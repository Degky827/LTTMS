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
const {
  getAdminBookings,
  getAdminBookingById,
  cancelAdminBooking,
  updateAdminBookingStatus,
  getAdminBookingStatistics,
  getAdminRefundRequests,
  approveRefundRequest,
  rejectRefundRequest
} = require('../controllers/adminBookingController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { adminUserStatusSchema, adminAssignRoleSchema } = require('../validation/authSchemas');

// Require authentication and administrative role (super_admin or admin)
router.use(protect);
router.use(authorize('admin', 'super_admin'));

/**
 * @openapi
 * /admin/stats:
 *   get:
 *     tags:
 *       - Administration
 *     summary: Get overall platform statistics
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Platform key metrics, counts, and revenues
 */
router.get('/stats', getStats);

/**
 * @openapi
 * /admin/vendors:
 *   get:
 *     tags:
 *       - Administration
 *     summary: List vendors with status filter and pagination
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, suspended, blacklisted]
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated vendor applications list
 */
router.get('/vendors', getVendors);

/**
 * @openapi
 * /admin/vendors/{id}:
 *   get:
 *     tags:
 *       - Administration
 *     summary: Get vendor detail with metrics, bookings, and services
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Detailed vendor profile and revenue metrics
 *       404:
 *         description: Vendor not found
 */
router.get('/vendors/:id', getVendorDetail);

/**
 * @openapi
 * /admin/vendors/{id}/status:
 *   put:
 *     tags:
 *       - Administration
 *     summary: Approve, reject, or suspend a vendor application
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ['status']
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected, pending, suspended, blacklisted]
 *               reason: { type: string }
 *     responses:
 *       200:
 *         description: Vendor status updated successfully and notification email dispatched
 */
router.put('/vendors/:id/status', updateVendorStatus);

/**
 * @openapi
 * /admin/vendors/{id}/eco-badge:
 *   put:
 *     tags:
 *       - Administration
 *     summary: Verify eco-friendly certification badge for vendor
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ecoCertification: { type: boolean, example: true }
 *     responses:
 *       200:
 *         description: Eco-badge status updated
 */
router.put('/vendors/:id/eco-badge', verifyEcoBadge);

/**
 * @openapi
 * /admin/users:
 *   get:
 *     tags:
 *       - Administration
 *     summary: Search and list users with pagination, role, and status filtering
 *     description: Returns paginated user records excluding passwords, tokens, and sensitive security hashes.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [tourist, vendor, support, admin, super_admin]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, suspended, locked]
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Text search on name or email (ReDoS protected)
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated users list
 */
router.get('/users', getUsers);

/**
 * @openapi
 * /admin/users/{id}:
 *   get:
 *     tags:
 *       - Administration
 *     summary: Get detailed user profile by ID
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User profile details and linked vendor profile
 *       404:
 *         description: User not found
 */
router.get('/users/:id', getUserDetail);

/**
 * @openapi
 * /admin/users/{id}/status:
 *   put:
 *     tags:
 *       - Administration
 *     summary: Update user status (activate, deactivate, suspend, reactivate, lock, unlock)
 *     description: Toggles account state. Applying deactivation, suspension, or lockout immediately revokes all active refresh sessions for the target user. Regular admins cannot alter super_admin accounts.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminStatusInput'
 *     responses:
 *       200:
 *         description: Account status updated and notification email sent
 *       403:
 *         description: Cannot modify super administrator account
 *       404:
 *         description: User not found
 */
router.put('/users/:id/status', validate(adminUserStatusSchema), updateUserStatus);

/**
 * @openapi
 * /admin/users/{id}/role:
 *   put:
 *     tags:
 *       - Administration
 *     summary: Assign user role with strict hierarchy enforcement
 *     description: Assigns a new role. Regular administrators cannot assign admin or super_admin roles, nor modify other administrators. Assigning roles invalidates target user sessions.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminRoleInput'
 *     responses:
 *       200:
 *         description: Role assigned successfully; target user sessions invalidated
 *       403:
 *         description: Forbidden - Only super_admin can assign admin or super_admin roles
 *       404:
 *         description: User not found
 */
router.put('/users/:id/role', validate(adminAssignRoleSchema), assignRole);

// Booking Oversight & Platform Management (Step 6)
router.get('/bookings/statistics', getAdminBookingStatistics);
router.get('/bookings', getAdminBookings);
router.get('/bookings/:id', getAdminBookingById);
router.patch('/bookings/:id/cancel', cancelAdminBooking);
router.patch('/bookings/:id/status', updateAdminBookingStatus);
router.put('/bookings/:id/override', overrideBooking);
router.get('/reports/bookings', getBookingReports);

// Refund Requests Management (Step 6)
router.get('/refund-requests', getAdminRefundRequests);
router.patch('/refund-requests/:id/approve', approveRefundRequest);
router.patch('/refund-requests/:id/reject', rejectRefundRequest);

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

/**
 * @openapi
 * /admin/audit-logs:
 *   get:
 *     tags:
 *       - Administration
 *     summary: Retrieve administrative audit logs
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of immutable audit log entries
 */
router.get('/audit-logs', getAuditLogs);

module.exports = router;
