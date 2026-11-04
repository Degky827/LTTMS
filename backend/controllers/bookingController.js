const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Vendor = require('../models/Vendor');
const ReservationHold = require('../models/ReservationHold');
const BookingStatusHistory = require('../models/BookingStatusHistory');
const RefundRequest = require('../models/RefundRequest');
const { calculatePricing } = require('../services/pricingService');
const { acquireCapacity, normalizeSlotKey, normalizeDate } = require('../services/capacityService');
const { validateDateAndSchedule } = require('../services/availabilityService');
const { transitionBookingStatus } = require('../services/bookingStateMachine');
const { initiateRefundRequest } = require('../services/refundService');
const NodeCache = require('node-cache');

const bookingIdempotencyCache = new NodeCache({ stdTTL: 300, checkperiod: 600 });

// @desc    Get all bookings
// @route   GET /api/bookings or GET /api/v1/bookings
// @access  Private (Admin)
exports.getBookings = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.service) query.service = req.query.service;
    if (req.query.vendor) query.vendor = req.query.vendor;

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('user', 'name email phone role')
        .populate('service', 'title price currency')
        .populate('vendor', 'businessName contactEmail')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: bookings
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/user or GET /api/v1/bookings/my
// @access  Private (Tourist)
exports.getUserBookings = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const query = { user: req.user.id };
    if (req.query.status) query.status = req.query.status;

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('service', 'title coverImage price currency duration location')
        .populate('vendor', 'businessName rating')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: bookings
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Create new booking
// @route   POST /api/bookings or POST /api/v1/bookings
// @access  Private (Tourist)
exports.createBooking = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    const bookingDate = new Date(req.body.date);
    const guests = Number(req.body.guests || (Number(req.body.adults || 1) + Number(req.body.children || 0)));

    if (!req.body.service) {
      return res.status(400).json({ success: false, message: 'Service is required' });
    }

    if (!Number.isInteger(guests) || guests < 1) {
      return res.status(400).json({ success: false, message: 'Guests must be a positive whole number' });
    }

    if (Number.isNaN(bookingDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid booking date' });
    }

    const service = await Service.findById(req.body.service).populate('vendor');
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    if (service.status !== 'published' || service.availability === false) {
      return res.status(400).json({
        success: false,
        message: 'This tourism service is currently not available for new reservations'
      });
    }

    if (service.vendor) {
      const vendorStatus = service.vendor.verificationStatus || service.vendor.status;
      if (vendorStatus !== 'approved') {
        return res.status(400).json({
          success: false,
          message: 'The provider for this service is not currently verified or approved'
        });
      }
    }

    const timeSlotKey = normalizeSlotKey(req.body.timeSlot);

    // Validate date against operating days, unavailable dates, and seasonal rules
    const scheduleValidation = validateDateAndSchedule(service, bookingDate, timeSlotKey);
    if (!scheduleValidation.valid) {
      return res.status(400).json({ success: false, message: scheduleValidation.reason });
    }

    // Min / max capacity verification
    const minCap = Number(service.minBookingCapacity || 1);
    const maxCap = Number(service.maxBookingCapacity || service.dailyCapacity || 20);
    if (guests < minCap) {
      return res.status(400).json({
        success: false,
        message: `Booking must specify at least ${minCap} participant(s)`
      });
    }
    if (guests > maxCap) {
      return res.status(400).json({
        success: false,
        message: `Booking exceeds maximum capacity limit of ${maxCap} participants`
      });
    }

    // Authoritative Backend Pricing Calculation
    const pricing = calculatePricing(service, {
      adults: req.body.adults != null ? req.body.adults : guests,
      children: req.body.children != null ? req.body.children : 0,
      guests,
      selectedOptions: req.body.selectedOptions
    });

    req.body.guests = guests;
    req.body.adults = pricing.adults;
    req.body.children = pricing.children;
    req.body.totalAmount = pricing.totalAmount;
    req.body.priceSnapshot = pricing.priceSnapshot;
    req.body.pricingSnapshot = pricing.pricingSnapshot;
    req.body.currency = pricing.currency;
    req.body.vendor = service.vendor ? (service.vendor._id || service.vendor) : null;
    req.body.destination = service.destination || null;
    req.body.serviceTitleSnapshot = service.title;
    req.body.cancellationPolicySnapshot = service.cancellationPolicy;
    req.body.timeSlot = timeSlotKey;

    const confirmationType = service.confirmationType || 'instant';
    req.body.confirmationType = confirmationType;

    // Check existing guests in MongoDB for immediate check & compatibility
    const normalizedDate = normalizeDate(bookingDate);
    const dayStart = new Date(normalizedDate);
    const dayEnd = new Date(normalizedDate);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const existingGuests = await Booking.aggregate([
      {
        $match: {
          service: service._id,
          date: { $gte: dayStart, $lt: dayEnd },
          status: { $in: ['pending', 'confirmed'] }
        }
      },
      {
        $group: {
          _id: null,
          guests: { $sum: '$guests' }
        }
      }
    ]);
    const bookedGuests = existingGuests[0]?.guests || 0;
    const capacityLimit = Number(service.dailyCapacity || 20);
    if (bookedGuests + guests > capacityLimit) {
      return res.status(409).json({
        success: false,
        message: 'Selected date is fully booked for this service'
      });
    }

    // Idempotency check prior to capacity lock
    const idempotencyKey = req.body.idempotencyKey || req.headers['idempotency-key'];
    if (idempotencyKey) {
      req.body.idempotencyKey = idempotencyKey;
      const cachedBooking = bookingIdempotencyCache.get(`${req.user.id}:${idempotencyKey}`);
      if (cachedBooking) {
        return res.status(200).json({
          success: true,
          data: cachedBooking,
          idempotentReplay: true
        });
      }
    }

    // Concurrency-Safe Capacity Lock
    const asHold = confirmationType === 'vendor_confirmation';
    try {
      await acquireCapacity(service, normalizedDate, timeSlotKey, guests, { asHold });
    } catch (capErr) {
      if (capErr.statusCode === 409 || capErr.code === 'CAPACITY_CONFLICT') {
        return res.status(409).json({
          success: false,
          message: capErr.message
        });
      }
      throw capErr;
    }

    // Set status based on confirmation policy
    if (confirmationType === 'instant') {
      req.body.status = 'confirmed';
    } else {
      req.body.status = 'pending';
      req.body.holdExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15-minute hold
    }

    const booking = await Booking.create(req.body);

    // If hold active, create ReservationHold document
    if (asHold) {
      await ReservationHold.create({
        booking: booking._id,
        service: service._id,
        serviceDate: normalizedDate,
        timeSlot: timeSlotKey,
        reservedCapacity: guests,
        status: 'active',
        expiresAt: req.body.holdExpiresAt
      });
    }

    // Record initial status transition
    await BookingStatusHistory.create({
      booking: booking._id,
      previousStatus: 'none',
      newStatus: booking.status,
      actor: req.user.id,
      actorRole: 'tourist',
      reason: 'Initial reservation creation',
      metadata: { confirmationType, guests }
    });

    if (idempotencyKey) {
      bookingIdempotencyCache.set(`${req.user.id}:${idempotencyKey}`, booking);
    }

    // Realtime Socket.IO emission
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${req.user.id}`).emit('booking:update', booking);
      if (service.vendor) {
        io.to(`vendor:${service.vendor._id || service.vendor}`).emit('booking:new', booking);
      }
      io.to('admin').emit('booking:new', booking);
    }

    res.status(201).json({
      success: true,
      message: booking.status === 'confirmed'
        ? 'Booking confirmed successfully'
        : 'Reservation placed and awaiting vendor approval',
      nextAction: booking.status === 'confirmed' ? 'proceed_to_payment' : 'awaiting_vendor_confirmation',
      data: booking
    });
  } catch (err) {
    if ((err.code === 11000 || err.name === 'MongoServerError') && req.body?.idempotencyKey) {
      try {
        const existingBooking = await Booking.findOne({ idempotencyKey: req.body.idempotencyKey });
        if (existingBooking) {
          return res.status(200).json({
            success: true,
            data: existingBooking,
            idempotentReplay: true
          });
        }
      } catch (lookupErr) {
        // Fallback
      }
    }
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get single booking by ID
// @route   GET /api/v1/bookings/my/:id
// @access  Private (Tourist owner)
exports.getMyBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user.id
    })
      .populate('service')
      .populate('vendor', 'businessName rating contactPhone contactEmail')
      .populate('destination')
      .populate({
        path: 'statusHistory',
        options: { sort: { timestamp: -1 } }
      });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get booking by reference
// @route   GET /api/v1/bookings/reference/:reference
// @access  Private (Authorized tourist owner, vendor, or admin)
exports.getBookingByReference = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ bookingReference: req.params.reference.toUpperCase() })
      .populate('service')
      .populate('vendor')
      .populate('destination');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking reference not found' });
    }

    // Role-based authorization
    const isOwner = booking.user.toString() === req.user.id;
    const isAdmin = ['admin', 'super_admin', 'support'].includes(req.user.role);
    let isVendorOwner = false;

    if (req.user.role === 'vendor') {
      const vendor = await Vendor.findOne({ user: req.user.id });
      if (vendor && booking.vendor && booking.vendor._id.toString() === vendor._id.toString()) {
        isVendorOwner = true;
      }
    }

    if (!isOwner && !isAdmin && !isVendorOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Cancel booking
// @route   POST /api/v1/bookings/:id/cancel
// @access  Private (Tourist owner or Admin)
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isOwner = booking.user.toString() === req.user.id;
    const isAdmin = ['admin', 'super_admin'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    const reason = req.body.reason || 'Cancelled by tourist';
    const updatedBooking = await transitionBookingStatus(booking, 'cancelled', req.user, { reason });

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${booking.user}`).emit('booking:update', updatedBooking);
      if (booking.vendor) {
        io.to(`vendor:${booking.vendor}`).emit('booking:cancelled', updatedBooking);
      }
      io.to('admin').emit('booking:cancelled', updatedBooking);
    }

    res.status(200).json({
      success: true,
      message: 'Booking successfully cancelled and capacity released',
      data: updatedBooking
    });
  } catch (err) {
    const statusCode = err.statusCode || 400;
    res.status(statusCode).json({ success: false, message: err.message });
  }
};

// @desc    Get booking status transition history
// @route   GET /api/v1/bookings/:id/history
// @access  Private (Owner tourist, vendor, admin)
exports.getBookingHistory = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isOwner = booking.user.toString() === req.user.id;
    const isAdmin = ['admin', 'super_admin', 'support'].includes(req.user.role);
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to access history' });
    }

    const history = await BookingStatusHistory.find({ booking: booking._id })
      .populate('actor', 'name email role')
      .sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Initiate refund request
// @route   POST /api/v1/bookings/:id/refund-requests
// @access  Private (Tourist owner)
exports.createBookingRefundRequest = async (req, res, next) => {
  try {
    const refundRequest = await initiateRefundRequest({
      bookingId: req.params.id,
      userId: req.user.id,
      amount: req.body.amount,
      reason: req.body.reason,
      description: req.body.description
    });

    res.status(201).json({
      success: true,
      message: 'Refund request submitted for administrative review',
      data: refundRequest
    });
  } catch (err) {
    const statusCode = err.statusCode || 400;
    res.status(statusCode).json({ success: false, message: err.message });
  }
};

// @desc    Get tourist's refund requests
// @route   GET /api/v1/refund-requests/my
// @access  Private (Tourist)
exports.getMyRefundRequests = async (req, res, next) => {
  try {
    const requests = await RefundRequest.find({ user: req.user.id })
      .populate('booking', 'bookingReference totalAmount status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update booking status (backward-compatible)
// @route   PUT /api/bookings/:id
// @access  Private (Vendor/Admin)
exports.updateBooking = async (req, res, next) => {
  try {
    const allowedUpdates = ['status', 'paymentStatus', 'transactionId', 'adminNote'];
    const updateKeys = Object.keys(req.body);

    if (updateKeys.some((key) => !allowedUpdates.includes(key))) {
      return res.status(400).json({
        success: false,
        message: `Only these fields can be updated: ${allowedUpdates.join(', ')}`
      });
    }

    let booking = await Booking.findById(req.params.id).populate({
      path: 'service',
      select: 'vendor'
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (req.user.role === 'vendor') {
      const vendor = await Vendor.findOne({ user: req.user.id });
      const bookingVendorId = booking.service?.vendor?.toString();
      if (!vendor || !bookingVendorId || vendor._id.toString() !== bookingVendorId) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this booking' });
      }
    }

    if (req.body.status && req.body.status !== booking.status) {
      booking = await transitionBookingStatus(booking, req.body.status, req.user, {
        reason: req.body.reason || 'Status update via booking management API'
      });
    }

    if (req.body.paymentStatus) booking.paymentStatus = req.body.paymentStatus;
    if (req.body.transactionId) booking.transactionId = req.body.transactionId;
    if (req.body.adminNote) booking.adminNote = req.body.adminNote;
    await booking.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${booking.user}`).emit('booking:update', booking);
      io.to('admin').emit('booking:update', booking);
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    const statusCode = err.statusCode || 400;
    res.status(statusCode).json({ success: false, message: err.message });
  }
};
