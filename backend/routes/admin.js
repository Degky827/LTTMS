const express = require('express');
const {
  updateVendorStatus, getVendors, getVendorDetail, verifyEcoBadge,
  getUsers, updateUserStatus, assignRole,
  getAllBookings, overrideBooking, getBookingReports,
  getTransactions, getCommissionReport, approveRefund,
  getEcoCompliance,
  getAnalytics, exportReport,
  getAllReviews, moderateReview,
  sendAnnouncement, getAuditLogs,
  getStats
} = require('../controllers/adminController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

// Stats
router.get('/stats', getStats);

// Vendor Management
router.get('/vendors', getVendors);
router.get('/vendors/:id', getVendorDetail);
router.put('/vendors/:id/status', updateVendorStatus);
router.put('/vendors/:id/eco-badge', verifyEcoBadge);

// User Management
router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id/role', assignRole);

// Booking Oversight
router.get('/bookings', getAllBookings);
router.put('/bookings/:id/override', overrideBooking);
router.get('/reports/bookings', getBookingReports);

// Payment & Commission
router.get('/transactions', getTransactions);
router.get('/reports/commission', getCommissionReport);
router.put('/bookings/:id/refund', approveRefund);

// Eco-Compliance
router.get('/eco-compliance', getEcoCompliance);

// Analytics
router.get('/analytics', getAnalytics);
router.get('/reports/export', exportReport);

// Review Moderation
router.get('/reviews', getAllReviews);
router.delete('/reviews/:id', moderateReview);

// Notifications & Audit
router.post('/announcements', sendAnnouncement);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
