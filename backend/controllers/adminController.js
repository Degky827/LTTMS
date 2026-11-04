const Vendor = require('../models/Vendor');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Review = require('../models/Review');
const logger = require('../utils/logger');
const sendEmail = require('../utils/email');
const { escapeRegex } = require('../shared/database/queryUtils');
const authService = require('../services/authService');

const audit = (action, adminId, details = {}) => {
  logger.info({ action, adminId, ...details, timestamp: new Date().toISOString() }, 'ADMIN_AUDIT');
};

// ==================== VENDOR MANAGEMENT ====================

exports.getVendors = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};
    const vendors = await Vendor.find(filter)
      .populate('user', 'name email phone createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Vendor.countDocuments(filter);
    res.json({ success: true, data: vendors, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getVendorDetail = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id).populate('user', 'name email phone');
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    const services = await Service.find({ vendor: vendor._id });
    const bookings = await Booking.find({ service: { $in: services.map(s => s._id) } }).populate('service', 'title');
    const totalRevenue = bookings.filter(b => b.paymentStatus === 'paid').reduce((s, b) => s + b.totalAmount, 0);
    const avgRating = services.reduce((s, sv) => s + (sv.rating || 0), 0) / (services.length || 1);
    res.json({ success: true, data: { vendor, services, bookings, totalRevenue, avgRating, totalBookings: bookings.length } });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateVendorStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    if (!['approved', 'rejected', 'pending', 'suspended', 'blacklisted'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const update = { status };
    if (status === 'rejected') update.rejectionReason = reason || '';
    if (status === 'approved') update.approvedAt = new Date();
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).populate('user', 'name email');
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    if (status === 'approved') await User.findByIdAndUpdate(vendor.user._id, { role: 'vendor' });
    if (status === 'rejected' || status === 'suspended' || status === 'blacklisted') {
      await User.findByIdAndUpdate(vendor.user._id, { role: 'tourist' });
    }
    if (vendor.user?.email) {
      const template = status === 'approved' ? 'vendor-approved' : 'vendor-rejected';
      await sendEmail({
        to: vendor.user.email,
        subject: status === 'approved' ? 'Vendor Account Approved' : 'Vendor Application Update',
        template,
        context: { name: vendor.user.name, businessName: vendor.businessName, reason, url: `${process.env.FRONTEND_ORIGIN || 'http://localhost:3000'}/vendor/dashboard` }
      });
    }
    audit('vendor.status.update', req.user._id, { vendorId: vendor._id, status });
    res.json({ success: true, data: vendor });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.verifyEcoBadge = async (req, res) => {
  try {
    const { ecoCertification } = req.body;
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, { ecoCertification }, { new: true });
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    audit('vendor.ecobadge.update', req.user._id, { vendorId: vendor._id, ecoCertification });
    res.json({ success: true, data: vendor });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ==================== USER MANAGEMENT ====================

exports.getUsers = async (req, res) => {
  try {
    const { role, status, search, q, page = 1, limit = 20, sort = '-createdAt' } = req.query;
    const filter = {};

    if (role && ['tourist', 'vendor', 'support', 'admin', 'super_admin'].includes(role)) {
      filter.role = role;
    }

    if (status === 'active') {
      filter.isActive = true;
      filter.isSuspended = { $ne: true };
    } else if (status === 'inactive') {
      filter.isActive = false;
    } else if (status === 'suspended') {
      filter.isSuspended = true;
    } else if (status === 'locked') {
      filter.lockUntil = { $gt: new Date() };
    }

    const searchQuery = search || q;
    if (searchQuery) {
      const safeRegex = new RegExp(escapeRegex(searchQuery), 'i');
      filter.$or = [{ name: safeRegex }, { email: safeRegex }];
    }

    const users = await User.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-password -verificationToken -verificationTokenExpire -resetPasswordToken -resetPasswordExpire -twoFactorSecret -twoFactorCodeExpire');

    const total = await User.countDocuments(filter);
    const sanitized = users.map(u => authService.sanitizeUser(u));

    res.json({
      success: true,
      data: sanitized,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getUserDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -verificationToken -verificationTokenExpire -resetPasswordToken -resetPasswordExpire -twoFactorSecret -twoFactorCodeExpire');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const sanitized = authService.sanitizeUser(user);

    let vendorProfile = null;
    if (user.role === 'vendor') {
      vendorProfile = await Vendor.findOne({ user: user._id });
    }

    res.json({
      success: true,
      data: {
        ...sanitized,
        vendorProfile
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { isActive, isSuspended, suspendedReason, lock } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Protection: regular admin cannot modify a super_admin account
    if (user.role === 'super_admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only super administrators can modify super administrator accounts'
      });
    }

    let statusChanged = false;
    let statusText = '';

    if (isActive !== undefined) {
      user.isActive = Boolean(isActive);
      statusChanged = true;
      statusText = user.isActive ? 'Activated' : 'Deactivated';
    }

    if (isSuspended !== undefined) {
      user.isSuspended = Boolean(isSuspended);
      user.suspendedReason = isSuspended ? (suspendedReason || 'Account suspended by administrator') : null;
      user.suspendedAt = isSuspended ? new Date() : null;
      statusChanged = true;
      statusText = user.isSuspended ? 'Suspended' : 'Reactivated';
    }

    if (lock === false) {
      user.lockUntil = null;
      user.loginAttempts = 0;
      statusChanged = true;
      statusText = 'Unlocked';
    } else if (lock === true) {
      user.lockUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
      statusChanged = true;
      statusText = 'Locked';
    }

    if (!statusChanged) {
      return res.status(400).json({
        success: false,
        message: 'Please provide status update field (isActive, isSuspended, or lock)'
      });
    }

    await user.save();

    // If deactivated, suspended, or locked: revoke all active sessions immediately!
    if (user.isActive === false || user.isSuspended === true || (user.lockUntil && user.lockUntil > Date.now())) {
      await authService.revokeAllUserTokens(user._id, 'admin_status_update');
    }

    // Send account status notification email (graceful error handling)
    await sendEmail({
      to: user.email,
      subject: `Account Status Update: ${statusText} - Lake Tana`,
      template: 'account-status-update',
      context: {
        name: user.name,
        status: statusText,
        statusText,
        isSuspended: user.isSuspended,
        reason: user.suspendedReason
      }
    });

    audit('user.status.update', req.user._id, {
      targetUserId: user._id,
      isActive: user.isActive,
      isSuspended: user.isSuspended,
      lockUntil: user.lockUntil
    });

    res.json({
      success: true,
      message: `User account status updated: ${statusText}`,
      data: authService.sanitizeUser(user)
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.assignRole = async (req, res) => {
  try {
    const { role } = req.body;
    const allowedRoles = ['tourist', 'vendor', 'support', 'admin', 'super_admin'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Protection 1: Non-super_admins cannot modify an existing super_admin
    if (user.role === 'super_admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only super administrators can modify a super administrator account'
      });
    }

    // Protection 2: Only super_admin can assign privileged roles (admin, super_admin)
    if (['admin', 'super_admin'].includes(role) && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only super administrators can assign admin or super_admin roles'
      });
    }

    // Protection 3: Admins cannot promote/demote other admins
    if (user.role === 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only super administrators can alter administrator roles'
      });
    }

    user.role = role;
    await user.save();

    // Invalidate existing sessions so the user must re-authenticate with their new permissions
    await authService.revokeAllUserTokens(user._id, 'role_assigned');

    audit('user.role.assign', req.user._id, { targetUserId: user._id, role });

    res.json({
      success: true,
      message: `Role assigned successfully: ${role}`,
      data: authService.sanitizeUser(user)
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ==================== BOOKING OVERSIGHT ====================

exports.getAllBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};
    const bookings = await Booking.find(filter)
      .populate('user', 'name email')
      .populate({ path: 'service', select: 'title vendor', populate: { path: 'vendor', select: 'businessName' } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Booking.countDocuments(filter);
    res.json({ success: true, data: bookings, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.overrideBooking = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    if (!['confirmed', 'cancelled', 'completed'].includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status, adminNote }, { new: true });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    audit('booking.override', req.user._id, { bookingId: booking._id, status, adminNote });
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getBookingReports = async (req, res) => {
  try {
    const { period = 'daily' } = req.query;
    const now = new Date();
    let start;
    if (period === 'daily') start = new Date(now.setDate(now.getDate() - 30));
    else if (period === 'weekly') start = new Date(now.setDate(now.getDate() - 90));
    else start = new Date(now.setFullYear(now.getFullYear() - 1));

    const bookings = await Booking.find({ createdAt: { $gte: start } });
    const totalRevenue = bookings.filter(b => b.paymentStatus === 'paid').reduce((s, b) => s + b.totalAmount, 0);
    res.json({ success: true, data: { total: bookings.length, revenue: totalRevenue, period, bookings } });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ==================== PAYMENT & COMMISSION ====================

exports.getTransactions = async (req, res) => {
  try {
    const bookings = await Booking.find({ paymentStatus: { $ne: 'unpaid' } })
      .populate('user', 'name email')
      .populate({ path: 'service', select: 'title price' })
      .sort({ createdAt: -1 });
    const transactions = bookings.map(b => ({
      id: b._id,
      transactionId: b.transactionId,
      user: b.user?.name || 'Unknown',
      service: b.service?.title || 'Unknown',
      amount: b.totalAmount,
      commission: b.totalAmount * 0.05,
      status: b.paymentStatus,
      date: b.createdAt
    }));
    res.json({ success: true, data: transactions });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getCommissionReport = async (req, res) => {
  try {
    const pipeline = [
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' }, totalCommission: { $sum: { $multiply: ['$totalAmount', 0.05] } }, count: { $sum: 1 } } }
    ];
    const result = await Booking.aggregate(pipeline);
    const r = result[0] || { totalRevenue: 0, totalCommission: 0, count: 0 };
    res.json({ success: true, data: { totalRevenue: r.totalRevenue, totalCommission: r.totalCommission, commissionRate: '5%', totalPaidBookings: r.count } });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.approveRefund = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, { paymentStatus: 'refunded', status: 'cancelled' }, { new: true });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    audit('booking.refund.approve', req.user._id, { bookingId: booking._id });
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ==================== ECO COMPLIANCE ====================

exports.getEcoCompliance = async (req, res) => {
  try {
    const vendors = await Vendor.find().populate('user', 'name email');
    const data = vendors.map(v => ({
      id: v._id,
      businessName: v.businessName,
      ecoCertification: v.ecoCertification,
      status: v.status,
    }));
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ==================== ANALYTICS ====================

exports.getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalVendors = await Vendor.countDocuments();
    const totalServices = await Service.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const revenueResult = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    const bookingTrend = await Booking.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]);

    const topVendors = await Vendor.aggregate([
      { $lookup: { from: 'services', localField: '_id', foreignField: 'vendor', as: 'services' } },
      { $lookup: { from: 'bookings', localField: 'services._id', foreignField: 'service', as: 'bookings' } },
      { $project: { businessName: 1, totalBookings: { $size: '$bookings' }, revenue: { $sum: '$bookings.totalAmount' } } },
      { $sort: { totalBookings: -1 } },
      { $limit: 10 }
    ]);

    const bookingsByCategory = await Booking.aggregate([
      { $lookup: { from: 'services', localField: 'service', foreignField: '_id', as: 'service' } },
      { $unwind: '$service' },
      { $group: { _id: '$service.category', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: { totalUsers, totalVendors, totalServices, totalBookings, totalRevenue, bookingTrend, topVendors, bookingsByCategory }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ==================== REVIEW MODERATION ====================

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name email')
      .populate({ path: 'service', select: 'title', populate: { path: 'vendor', select: 'businessName' } })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.moderateReview = async (req, res) => {
  try {
    const { action } = req.body;
    if (!['remove', 'flag'].includes(action)) return res.status(400).json({ success: false, message: 'Action must be remove or flag' });
    if (action === 'remove') {
      await Review.findByIdAndDelete(req.params.id);
      audit('review.remove', req.user._id, { reviewId: req.params.id });
      return res.json({ success: true, message: 'Review removed' });
    }
    audit('review.flag', req.user._id, { reviewId: req.params.id });
    res.json({ success: true, message: 'Review flagged for review' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ==================== NOTIFICATIONS ====================

exports.sendAnnouncement = async (req, res) => {
  try {
    const { title, message, target } = req.body;
    if (!title || !message) return res.status(400).json({ success: false, message: 'Title and message required' });
    audit('announcement.send', req.user._id, { title, target: target || 'all' });
    res.json({ success: true, message: 'Announcement sent' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    res.json({ success: true, data: [], total: 0, page: Number(page) });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.exportReport = async (req, res) => {
  try {
    const { type = 'csv' } = req.query;
    const bookings = await Booking.find().populate('user', 'name').populate({ path: 'service', select: 'title' });
    let csv = 'ID,User,Service,Amount,Status,Date\n';
    bookings.forEach(b => { csv += `${b._id},${b.user?.name || ''},${b.service?.title || ''},${b.totalAmount},${b.status},${b.createdAt}\n`; });
    res.setHeader('Content-Type', type === 'csv' ? 'text/csv' : 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=report.${type}`);
    res.send(csv);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ==================== PLATFORM STATS ====================

exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalVendors = await Vendor.countDocuments();
    const totalServices = await Service.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const pendingVendors = await Vendor.countDocuments({ status: 'pending' });
    const revenue = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    res.json({ success: true, data: { users: totalUsers, vendors: totalVendors, services: totalServices, bookings: totalBookings, pendingVendors, totalRevenue: revenue[0]?.total || 0 } });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
