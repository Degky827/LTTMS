const Booking = require('../models/Booking');
const RefundRequest = require('../models/RefundRequest');
const { transitionBookingStatus } = require('../services/bookingStateMachine');
const { reviewRefundRequest } = require('../services/refundService');

// @desc    Get all platform bookings with extensive filtering
// @route   GET /api/v1/admin/bookings
// @access  Private (Admin, Super Admin)
exports.getAdminBookings = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.vendor) query.vendor = req.query.vendor;
    if (req.query.service) query.service = req.query.service;
    if (req.query.user) query.user = req.query.user;
    if (req.query.reference) {
      query.bookingReference = { $regex: req.query.reference, $options: 'i' };
    }
    if (req.query.startDate || req.query.endDate) {
      query.date = {};
      if (req.query.startDate) query.date.$gte = new Date(req.query.startDate);
      if (req.query.endDate) query.date.$lte = new Date(req.query.endDate);
    }

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('user', 'name email phone')
        .populate('vendor', 'businessName contactEmail')
        .populate('service', 'title price currency')
        .populate('destination', 'name')
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

// @desc    Get single platform booking details
// @route   GET /api/v1/admin/bookings/:id
// @access  Private (Admin, Super Admin)
exports.getAdminBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email phone role')
      .populate('vendor')
      .populate('service')
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

// @desc    Administrative cancellation of any booking
// @route   PATCH /api/v1/admin/bookings/:id/cancel
// @access  Private (Admin, Super Admin)
exports.cancelAdminBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const reason = req.body.reason || 'Administrative intervention cancellation';
    const updated = await transitionBookingStatus(booking, 'cancelled', req.user, { reason });

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${booking.user}`).emit('booking:update', updated);
      if (booking.vendor) {
        io.to(`vendor:${booking.vendor}`).emit('booking:cancelled', updated);
      }
      io.to('admin').emit('booking:cancelled', updated);
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled by administrative override',
      data: updated
    });
  } catch (err) {
    const statusCode = err.statusCode || 400;
    res.status(statusCode).json({ success: false, message: err.message });
  }
};

// @desc    Update booking status by administrator
// @route   PATCH /api/v1/admin/bookings/:id/status
// @access  Private (Admin, Super Admin)
exports.updateAdminBookingStatus = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const newStatus = req.body.status;
    const reason = req.body.reason || 'Administrative status transition';
    const updated = await transitionBookingStatus(booking, newStatus, req.user, { reason });

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${booking.user}`).emit('booking:update', updated);
      if (booking.vendor) {
        io.to(`vendor:${booking.vendor}`).emit('booking:update', updated);
      }
      io.to('admin').emit('booking:update', updated);
    }

    res.status(200).json({
      success: true,
      message: `Booking status updated to '${newStatus}'`,
      data: updated
    });
  } catch (err) {
    const statusCode = err.statusCode || 400;
    res.status(statusCode).json({ success: false, message: err.message });
  }
};

// @desc    Platform booking statistics and performance
// @route   GET /api/v1/admin/bookings/statistics
// @access  Private (Admin, Super Admin)
exports.getAdminBookingStatistics = async (req, res, next) => {
  try {
    const stats = await Booking.aggregate([
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
      grossBookingValue: 0,
      totalGuests: 0
    };

    for (const item of stats) {
      formattedStats.totalBookings += item.count;
      formattedStats[item._id] = item.count;
      formattedStats.grossBookingValue += item.totalRevenue;
      formattedStats.totalGuests += item.totalGuests;
    }

    res.status(200).json({
      success: true,
      data: formattedStats
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get all platform refund requests
// @route   GET /api/v1/admin/refund-requests
// @access  Private (Admin, Super Admin)
exports.getAdminRefundRequests = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) query.status = req.query.status;

    const [requests, total] = await Promise.all([
      RefundRequest.find(query)
        .populate('user', 'name email phone')
        .populate('vendor', 'businessName contactEmail')
        .populate('booking', 'bookingReference totalAmount status')
        .populate('reviewedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      RefundRequest.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: requests.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: requests
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Approve refund request
// @route   PATCH /api/v1/admin/refund-requests/:id/approve
// @access  Private (Admin, Super Admin)
exports.approveRefundRequest = async (req, res, next) => {
  try {
    const request = await reviewRefundRequest(
      req.params.id,
      req.user,
      'approved',
      req.body.adminNote
    );

    res.status(200).json({
      success: true,
      message: 'Refund request approved. Ready for payment processing in Step 7.',
      data: request
    });
  } catch (err) {
    const statusCode = err.statusCode || 400;
    res.status(statusCode).json({ success: false, message: err.message });
  }
};

// @desc    Reject refund request
// @route   PATCH /api/v1/admin/refund-requests/:id/reject
// @access  Private (Admin, Super Admin)
exports.rejectRefundRequest = async (req, res, next) => {
  try {
    const request = await reviewRefundRequest(
      req.params.id,
      req.user,
      'rejected',
      req.body.adminNote,
      req.body.rejectionReason
    );

    res.status(200).json({
      success: true,
      message: 'Refund request rejected',
      data: request
    });
  } catch (err) {
    const statusCode = err.statusCode || 400;
    res.status(statusCode).json({ success: false, message: err.message });
  }
};
