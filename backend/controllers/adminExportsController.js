const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const CommissionTransaction = require('../models/CommissionTransaction');
const Settlement = require('../models/Settlement');
const RefundRequest = require('../models/RefundRequest');
const Vendor = require('../models/Vendor');
const Review = require('../models/Review');
const SupportTicket = require('../models/SupportTicket');
const { convertToCSV, sendCSVResponse } = require('../utils/csvExportUtil');

// @desc    Export Bookings to CSV
// @route   GET /api/v1/admin/exports/bookings
// @access  Private (Admin)
exports.exportBookings = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.startDate && req.query.endDate) {
      query.createdAt = { $gte: new Date(req.query.startDate), $lte: new Date(req.query.endDate) };
    }

    const bookings = await Booking.find(query)
      .populate('user', 'name email')
      .populate('service', 'title')
      .populate('vendor', 'businessName')
      .sort({ createdAt: -1 })
      .limit(5000);

    const fields = [
      { label: 'Booking Reference', value: 'bookingReference' },
      { label: 'Date', value: b => (b.date ? new Date(b.date).toISOString().split('T')[0] : '') },
      { label: 'Guests', value: 'guests' },
      { label: 'Total Amount', value: 'totalAmount' },
      { label: 'Currency', value: 'currency' },
      { label: 'Booking Status', value: 'status' },
      { label: 'Payment Status', value: 'paymentStatus' },
      { label: 'Customer Name', value: b => b.user?.name || '' },
      { label: 'Customer Email', value: b => b.user?.email || '' },
      { label: 'Service Title', value: b => b.service?.title || '' },
      { label: 'Vendor', value: b => b.vendor?.businessName || '' },
      { label: 'Created At', value: 'createdAt' }
    ];

    const csv = convertToCSV(bookings, fields);
    sendCSVResponse(res, `lttms-bookings-${Date.now()}`, csv);
  } catch (err) {
    next(err);
  }
};

// @desc    Export Payments to CSV
// @route   GET /api/v1/admin/exports/payments
// @access  Private (Admin)
exports.exportPayments = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;

    const payments = await Payment.find(query)
      .populate('user', 'name email')
      .populate('vendor', 'businessName')
      .sort({ createdAt: -1 })
      .limit(5000);

    const fields = [
      { label: 'Transaction Reference', value: 'txRef' },
      { label: 'Receipt Number', value: 'receiptNumber' },
      { label: 'Amount', value: 'amount' },
      { label: 'Currency', value: 'currency' },
      { label: 'Payment Method', value: 'paymentMethod' },
      { label: 'Status', value: 'status' },
      { label: 'Customer Name', value: p => p.user?.name || '' },
      { label: 'Customer Email', value: p => p.user?.email || '' },
      { label: 'Vendor', value: p => p.vendor?.businessName || '' },
      { label: 'Created At', value: 'createdAt' },
      { label: 'Paid At', value: 'paidAt' }
    ];

    const csv = convertToCSV(payments, fields);
    sendCSVResponse(res, `lttms-payments-${Date.now()}`, csv);
  } catch (err) {
    next(err);
  }
};

// @desc    Export Commissions to CSV
// @route   GET /api/v1/admin/exports/commissions
// @access  Private (Admin)
exports.exportCommissions = async (req, res, next) => {
  try {
    const commissions = await CommissionTransaction.find()
      .populate('vendor', 'businessName')
      .sort({ createdAt: -1 })
      .limit(5000);

    const fields = [
      { label: 'Gross Booking Amount', value: 'totalBookingAmount' },
      { label: 'Commission Rate', value: 'commissionRate' },
      { label: 'Platform Fee (ETB)', value: 'commissionAmount' },
      { label: 'Vendor Net Share (ETB)', value: 'vendorEarning' },
      { label: 'Status', value: 'status' },
      { label: 'Vendor', value: c => c.vendor?.businessName || '' },
      { label: 'Calculation Rule', value: 'calculationRule' },
      { label: 'Created At', value: 'createdAt' }
    ];

    const csv = convertToCSV(commissions, fields);
    sendCSVResponse(res, `lttms-commissions-${Date.now()}`, csv);
  } catch (err) {
    next(err);
  }
};

// @desc    Export Refunds to CSV
// @route   GET /api/v1/admin/exports/refunds
// @access  Private (Admin)
exports.exportRefunds = async (req, res, next) => {
  try {
    const refunds = await RefundRequest.find()
      .populate('user', 'name email')
      .populate('vendor', 'businessName')
      .populate('booking', 'bookingReference')
      .sort({ createdAt: -1 })
      .limit(5000);

    const fields = [
      { label: 'Refund ID', value: '_id' },
      { label: 'Booking Reference', value: r => r.booking?.bookingReference || '' },
      { label: 'Amount (ETB)', value: 'amount' },
      { label: 'Status', value: 'status' },
      { label: 'Reason', value: 'reason' },
      { label: 'Customer Name', value: r => r.user?.name || '' },
      { label: 'Vendor', value: r => r.vendor?.businessName || '' },
      { label: 'Submitted At', value: 'createdAt' },
      { label: 'Processed At', value: 'processedAt' }
    ];

    const csv = convertToCSV(refunds, fields);
    sendCSVResponse(res, `lttms-refunds-${Date.now()}`, csv);
  } catch (err) {
    next(err);
  }
};

// @desc    Export Settlements to CSV
// @route   GET /api/v1/admin/exports/settlements
// @access  Private (Admin)
exports.exportSettlements = async (req, res, next) => {
  try {
    const settlements = await Settlement.find()
      .populate('vendor', 'businessName')
      .populate('requestedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(5000);

    const fields = [
      { label: 'Settlement Reference', value: 'settlementReference' },
      { label: 'Vendor', value: s => s.vendor?.businessName || '' },
      { label: 'Amount (ETB)', value: 'amount' },
      { label: 'Status', value: 'status' },
      { label: 'Payout Method', value: 'payoutMethod' },
      { label: 'Provider Reference', value: 'providerReference' },
      { label: 'Requested By', value: s => s.requestedBy?.name || '' },
      { label: 'Requested At', value: 'createdAt' },
      { label: 'Completed At', value: 'completedAt' }
    ];

    const csv = convertToCSV(settlements, fields);
    sendCSVResponse(res, `lttms-settlements-${Date.now()}`, csv);
  } catch (err) {
    next(err);
  }
};

// @desc    Export Vendors to CSV
// @route   GET /api/v1/admin/exports/vendors
// @access  Private (Admin)
exports.exportVendors = async (req, res, next) => {
  try {
    const vendors = await Vendor.find()
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(5000);

    const fields = [
      { label: 'Vendor ID', value: '_id' },
      { label: 'Business Name', value: 'businessName' },
      { label: 'Business Type', value: 'businessType' },
      { label: 'Verification Status', value: 'verificationStatus' },
      { label: 'Account Status', value: 'status' },
      { label: 'Owner Name', value: v => v.user?.name || '' },
      { label: 'Contact Email', value: v => v.user?.email || v.contact || '' },
      { label: 'Phone', value: v => v.phone || v.user?.phone || '' },
      { label: 'Created At', value: 'createdAt' }
    ];

    const csv = convertToCSV(vendors, fields);
    sendCSVResponse(res, `lttms-vendors-${Date.now()}`, csv);
  } catch (err) {
    next(err);
  }
};

// @desc    Export Reviews to CSV
// @route   GET /api/v1/admin/exports/reviews
// @access  Private (Admin)
exports.exportReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name email')
      .populate('service', 'title')
      .populate('vendor', 'businessName')
      .sort({ createdAt: -1 })
      .limit(5000);

    const fields = [
      { label: 'Review ID', value: '_id' },
      { label: 'Rating', value: 'rating' },
      { label: 'Title', value: 'title' },
      { label: 'Comment', value: 'comment' },
      { label: 'Status', value: 'status' },
      { label: 'Verified Booking', value: 'isVerifiedBooking' },
      { label: 'Customer Name', value: r => r.user?.name || '' },
      { label: 'Service Title', value: r => r.service?.title || '' },
      { label: 'Vendor', value: r => r.vendor?.businessName || '' },
      { label: 'Flagged', value: 'flagged' },
      { label: 'Created At', value: 'createdAt' }
    ];

    const csv = convertToCSV(reviews, fields);
    sendCSVResponse(res, `lttms-reviews-${Date.now()}`, csv);
  } catch (err) {
    next(err);
  }
};

// @desc    Export Support Tickets to CSV
// @route   GET /api/v1/admin/exports/support-tickets
// @access  Private (Admin)
exports.exportSupportTickets = async (req, res, next) => {
  try {
    const tickets = await SupportTicket.find()
      .populate('user', 'name email role')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .limit(5000);

    const fields = [
      { label: 'Ticket Number', value: 'ticketNumber' },
      { label: 'Subject', value: 'subject' },
      { label: 'Category', value: 'category' },
      { label: 'Priority', value: 'priority' },
      { label: 'Status', value: 'status' },
      { label: 'User Name', value: t => t.user?.name || '' },
      { label: 'User Role', value: 'userRole' },
      { label: 'Assigned To', value: t => t.assignedTo?.name || 'Unassigned' },
      { label: 'Created At', value: 'createdAt' },
      { label: 'Resolved At', value: 'resolvedAt' }
    ];

    const csv = convertToCSV(tickets, fields);
    sendCSVResponse(res, `lttms-support-tickets-${Date.now()}`, csv);
  } catch (err) {
    next(err);
  }
};
