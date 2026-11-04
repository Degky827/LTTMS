const express = require('express');
const {
  updateVendorStatus, getVendors, getVendorDetail, verifyEcoBadge,
  getUsers, getUserDetail, updateUserStatus, assignRole,
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
const validate = require('../middleware/validate');
const { adminUserStatusSchema, adminAssignRoleSchema } = require('../validation/authSchemas');

// Require authentication and administrative role (super_admin or admin)
router.use(protect);
router.use(authorize('admin', 'super_admin'));

// Platform Stats
router.get('/stats', getStats);

// Vendor Management & Approvals
router.get('/vendors', getVendors);
router.get('/vendors/:id', getVendorDetail);
router.put('/vendors/:id/status', updateVendorStatus);
router.put('/vendors/:id/eco-badge', verifyEcoBadge);

// User Management
router.get('/users', getUsers);
router.get('/users/:id', getUserDetail);
router.put('/users/:id/status', validate(adminUserStatusSchema), updateUserStatus);
router.put('/users/:id/role', validate(adminAssignRoleSchema), assignRole);

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

// Analytics & Reports
router.get('/analytics', getAnalytics);
router.get('/reports/export', exportReport);

// Review Moderation
router.get('/reviews', getAllReviews);
router.delete('/reviews/:id', moderateReview);

// Notifications & Audit Logs
router.post('/announcements', sendAnnouncement);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
