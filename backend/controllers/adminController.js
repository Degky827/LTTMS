const Vendor = require('../models/Vendor');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Review = require('../models/Review');
const logger = require('../utils/logger');

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
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending', 'suspended', 'blacklisted'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    if (status === 'approved') await User.findByIdAndUpdate(vendor.user, { role: 'vendor' });
    if (status === 'rejected' || status === 'suspended' || status === 'blacklisted') {
      await User.findByIdAndUpdate(vendor.user, { role: 'tourist' });
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
    const { role, page = 1, limit = 20 } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
    const total = await User.countDocuments(filter);
    res.json({ success: true, data: users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    if (isActive === undefined) return res.status(400).json({ success: false, message: 'isActive required' });
    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    audit('user.status.update', req.user._id, { targetUserId: user._id, isActive });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.assignRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['tourist', 'vendor', 'admin'].includes(role)) return res.status(400).json({ success: false, message: 'Invalid role' });
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    audit('user.role.assign', req.user._id, { targetUserId: user._id, role });
    res.json({ success: true, data: user });
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
