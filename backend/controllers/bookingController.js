const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Vendor = require('../models/Vendor');
const NodeCache = require('node-cache');

const bookingIdempotencyCache = new NodeCache({ stdTTL: 300, checkperiod: 600 });

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private (Admin)
exports.getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find().populate('user service');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/user
// @access  Private (Tourist)
exports.getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).populate('service');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (Tourist)
exports.createBooking = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    const guests = Number(req.body.guests || 1);
    const bookingDate = new Date(req.body.date);

    if (!req.body.service) {
      return res.status(400).json({ success: false, message: 'Service is required' });
    }

    if (!Number.isInteger(guests) || guests < 1) {
      return res.status(400).json({ success: false, message: 'Guests must be a positive whole number' });
    }

    if (Number.isNaN(bookingDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid booking date' });
    }

    const service = await Service.findById(req.body.service);

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    req.body.guests = guests;
    req.body.totalAmount = service.price * guests;

    const normalizedDate = new Date(bookingDate);
    normalizedDate.setHours(0, 0, 0, 0);
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
    if (bookedGuests + guests > (service.dailyCapacity || 20)) {
      return res.status(409).json({
        success: false,
        message: 'Selected date is fully booked for this service'
      });
    }

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

    const booking = await Booking.create(req.body);

    if (idempotencyKey) {
      bookingIdempotencyCache.set(`${req.user.id}:${idempotencyKey}`, booking);
    }

    // Socket.IO realtime event emission
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${req.user.id}`).emit('booking:update', booking);
      if (service.vendor) {
        io.to(`vendor:${service.vendor}`).emit('booking:new', booking);
      }
      io.to('admin').emit('booking:new', booking);
    }

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (err) {
    // Authoritative Database Idempotency Handling:
    // If concurrent requests or cross-server instances collide on the unique idempotencyKey,
    // catch the MongoDB duplicate key error (code 11000) and safely return the existing booking.
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
        // Fallback to error response if lookup fails
      }
    }
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id
// @access  Private (Vendor/Admin)
exports.updateBooking = async (req, res, next) => {
  try {
    const allowedUpdates = ['status', 'paymentStatus', 'transactionId'];
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

    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Socket.IO realtime event emission
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
    res.status(400).json({ success: false, message: err.message });
  }
};
