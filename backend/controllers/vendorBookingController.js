const Booking = require('../models/Booking');
const Vendor = require('../models/Vendor');
const RefundRequest = require('../models/RefundRequest');
const { transitionBookingStatus } = require('../services/bookingStateMachine');

/**
 * Helper to resolve authenticated vendor profile
 */
async function resolveVendor(userId) {
  const vendor = await Vendor.findOne({ user: userId });
  if (!vendor) {
    const error = new Error('Vendor profile not found for this user account');
    error.statusCode = 404;
    throw error;
  }
  return vendor;
}

// @desc    Get bookings for authenticated vendor
// @route   GET /api/v1/vendor/bookings
// @access  Private (Vendor)
exports.getVendorBookings = async (req, res, next) => {
  try {
    const vendor = await resolveVendor(req.user.id);

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const query = { vendor: vendor._id };
    if (req.query.status) query.status = req.query.status;
    if (req.query.service) query.service = req.query.service;

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('user', 'name email phone')
        .populate('service', 'title price currency')
        .sort({ date: 1, createdAt: -1 })
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
    const statusCode = err.statusCode || 400;
    res.status(statusCode).json({ success: false, message: err.message });
  }
};

// @desc    Get single booking for authenticated vendor
// @route   GET /api/v1/vendor/bookings/:id
// @access  Private (Vendor)
exports.getVendorBookingById = async (req, res, next) => {
  try {
    const vendor = await resolveVendor(req.user.id);
    const booking = await Booking.findOne({
      _id: req.params.id,
      vendor: vendor._id
    })
      .populate('user', 'name email phone')
      .populate('service')
      .populate('destination')
      .populate({
        path: 'statusHistory',
        options: { sort: { timestamp: -1 } }
      });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found or does not belong to vendor' });
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

// @desc    Confirm pending booking
// @route   PATCH /api/v1/vendor/bookings/:id/confirm
// @access  Private (Vendor)
exports.confirmVendorBooking = async (req, res, next) => {
  try {
    const vendor = await resolveVendor(req.user.id);
    const booking = await Booking.findOne({
      _id: req.params.id,
      vendor: vendor._id
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found or not owned by vendor' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Only pending bookings can be confirmed. Current status: '${booking.status}'`
      });
    }

    const updatedBooking = await transitionBookingStatus(booking, 'confirmed', req.user, {
      reason: req.body.reason || 'Reservation confirmed by vendor'
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${booking.user}`).emit('booking:update', updatedBooking);
      io.to('admin').emit('booking:update', updatedBooking);
    }

    res.status(200).json({
      success: true,
      message: 'Booking successfully confirmed',
      data: updatedBooking
    });
  } catch (err) {
    const statusCode = err.statusCode || 400;
    res.status(statusCode).json({ success: false, message: err.message });
  }
};

// @desc    Reject pending booking
// @route   PATCH /api/v1/vendor/bookings/:id/reject
// @access  Private (Vendor)
exports.rejectVendorBooking = async (req, res, next) => {
  try {
    const vendor = await resolveVendor(req.user.id);
    const booking = await Booking.findOne({
      _id: req.params.id,
      vendor: vendor._id
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found or not owned by vendor' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Only pending bookings can be rejected. Current status: '${booking.status}'`
      });
    }

    const rejectionReason = req.body.reason || 'Declined by vendor due to scheduling conflict';
    const updatedBooking = await transitionBookingStatus(booking, 'rejected', req.user, {
      reason: rejectionReason
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${booking.user}`).emit('booking:update', updatedBooking);
      io.to('admin').emit('booking:update', updatedBooking);
    }

    res.status(200).json({
      success: true,
      message: 'Booking successfully rejected and held capacity released',
      data: updatedBooking
    });
  } catch (err) {
    const statusCode = err.statusCode || 400;
    res.status(statusCode).json({ success: false, message: err.message });
  }
};

// @desc    Get vendor booking statistics
// @route   GET /api/v1/vendor/bookings/statistics
// @access  Private (Vendor)
exports.getVendorBookingStatistics = async (req, res, next) => {
  try {
    const vendor = await resolveVendor(req.user.id);

    const stats = await Booking.aggregate([
      { $match: { vendor: vendor._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $cond: [{ $in: ['$status', ['confirmed', 'completed']] }, '$totalAmount', 0]
            }
          },
          totalGuests: { $sum: '$guests' }
        }
      }
    ]);

    const formattedStats = {
      totalBookings: 0,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      rejected: 0,
      expired: 0,
      estimatedRevenue: 0,
      totalGuestsServed: 0
    };

    for (const item of stats) {
      formattedStats.totalBookings += item.count;
      formattedStats[item._id] = item.count;
      formattedStats.estimatedRevenue += item.totalRevenue;
      if (['confirmed', 'completed'].includes(item._id)) {
        formattedStats.totalGuestsServed += item.totalGuests;
      }
    }

    res.status(200).json({
      success: true,
      data: formattedStats
    });
  } catch (err) {
    const statusCode = err.statusCode || 400;
    res.status(statusCode).json({ success: false, message: err.message });
  }
};

// @desc    Get refund requests for vendor's services
// @route   GET /api/v1/vendor/refund-requests
// @access  Private (Vendor)
exports.getVendorRefundRequests = async (req, res, next) => {
  try {
    const vendor = await resolveVendor(req.user.id);
    const requests = await RefundRequest.find({ vendor: vendor._id })
      .populate('booking', 'bookingReference totalAmount status date')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (err) {
    const statusCode = err.statusCode || 400;
    res.status(statusCode).json({ success: false, message: err.message });
  }
};
