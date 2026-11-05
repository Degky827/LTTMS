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
const adminDashboardController = require('../controllers/adminDashboardController');
const adminSupportController = require('../controllers/adminSupportController');
const adminRefundsController = require('../controllers/adminRefundsController');
const adminExportsController = require('../controllers/adminExportsController');
const reviewController = require('../controllers/reviewController');

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

/**
 * @openapi
 * /admin/dashboard/overview:
 *   get:
 *     tags:
 *       - Admin Dashboard
 *     summary: Real-time comprehensive platform executive overview
 *     description: Returns aggregated KPIs across registered tourists, vendor verifications, active services, booking status distribution, gross payment volume, platform commissions, pending action items, and recent audit activity.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Platform executive metrics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardOverviewResponse'
 *       403:
 *         description: Admin authorization required
 * /admin/dashboard/bookings:
 *   get:
 *     tags:
 *       - Admin Dashboard
 *     summary: In-depth booking trends and status analysis
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Booking volume and conversion statistics
 * /admin/dashboard/revenue:
 *   get:
 *     tags:
 *       - Admin Dashboard
 *     summary: Platform revenue, commission, and payout financial analysis
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Revenue timeline and fee statistics
 * /admin/dashboard/vendors:
 *   get:
 *     tags:
 *       - Admin Dashboard
 *     summary: Vendor verification pipeline and performance analytics
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Vendor onboarding and compliance statistics
 * /admin/dashboard/tourists:
 *   get:
 *     tags:
 *       - Admin Dashboard
 *     summary: Tourist user registration and activity analytics
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User growth metrics
 * /admin/dashboard/services:
 *   get:
 *     tags:
 *       - Admin Dashboard
 *     summary: Tourism service inventory and category distribution
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Service metrics
 * /admin/dashboard/reviews:
 *   get:
 *     tags:
 *       - Admin Dashboard
 *     summary: Review sentiment and moderation queue statistics
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Review metrics
 * /admin/dashboard/refunds:
 *   get:
 *     tags:
 *       - Admin Dashboard
 *     summary: Refund claim metrics and resolution timelines
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Refund statistics
 * /admin/dashboard/support:
 *   get:
 *     tags:
 *       - Admin Dashboard
 *     summary: Customer support ticket resolution metrics
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Support analytics
 * /admin/dashboard/recent-activity:
 *   get:
 *     tags:
 *       - Admin Dashboard
 *     summary: Chronological administrative audit logs and platform events
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Recent activity feed
 */
router.get('/dashboard/overview', adminDashboardController.getOverview);
router.get('/dashboard/bookings', adminDashboardController.getBookingsAnalysis);
router.get('/dashboard/revenue', adminDashboardController.getRevenueAnalysis);
router.get('/dashboard/vendors', adminDashboardController.getVendorsAnalysis);
router.get('/dashboard/tourists', adminDashboardController.getTouristsAnalysis);
router.get('/dashboard/services', adminDashboardController.getServicesAnalysis);
router.get('/dashboard/reviews', adminDashboardController.getReviewsAnalysis);
router.get('/dashboard/refunds', adminDashboardController.getRefundsAnalysis);
router.get('/dashboard/support', adminDashboardController.getSupportAnalysis);
router.get('/dashboard/recent-activity', adminDashboardController.getRecentActivity);

/**
 * @openapi
 * /admin/reviews:
 *   get:
 *     tags:
 *       - Administration
 *     summary: Administrative review moderation list
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, approved, rejected, hidden, flagged] }
 *       - in: query
 *         name: flagged
 *         schema: { type: string, enum: ['true', 'false'] }
 *     responses:
 *       200:
 *         description: Paginated reviews for moderation
 * /admin/reviews/{reviewId}/moderate:
 *   patch:
 *     tags:
 *       - Administration
 *     summary: Execute review moderation action
 *     description: Transitions review status (approve, reject, hide, restore, flag) and recalculates service rating average.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [action]
 *             properties:
 *               action: { type: string, enum: [approve, reject, hide, restore, flag] }
 *               reason: { type: string }
 *     responses:
 *       200:
 *         description: Moderation action recorded
 * /admin/reviews/{reviewId}/reports:
 *   get:
 *     tags:
 *       - Administration
 *     summary: View abuse reports filed against a review
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of submitted user reports
 */
router.get('/reviews', reviewController.adminGetReviews);
router.patch('/reviews/:reviewId/moderate', reviewController.adminModerateReview);
router.get('/reviews/:reviewId/reports', reviewController.adminGetReviewReports);
router.delete('/reviews/:id', moderateReview);

/**
 * @openapi
 * /admin/support/tickets:
 *   get:
 *     tags:
 *       - Administration
 *     summary: List and filter all platform support tickets
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [open, assigned, in_progress, waiting_for_user, waiting_for_vendor, resolved, closed, reopened] }
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [low, medium, high, urgent] }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated support tickets
 * /admin/support/tickets/{ticketId}:
 *   get:
 *     tags:
 *       - Administration
 *     summary: Administrative support ticket detail with private staff notes
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Full ticket details including internal notes
 * /admin/support/tickets/{ticketId}/assign:
 *   patch:
 *     tags:
 *       - Administration
 *     summary: Assign staff member to support ticket
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [assignedTo]
 *             properties:
 *               assignedTo: { type: string }
 *     responses:
 *       200:
 *         description: Ticket assigned
 * /admin/support/tickets/{ticketId}/status:
 *   patch:
 *     tags:
 *       - Administration
 *     summary: Update support ticket lifecycle status
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [open, assigned, in_progress, waiting_for_user, waiting_for_vendor, resolved, closed, reopened] }
 *     responses:
 *       200:
 *         description: Ticket status updated
 * /admin/support/tickets/{ticketId}/priority:
 *   patch:
 *     tags:
 *       - Administration
 *     summary: Update ticket priority level
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [priority]
 *             properties:
 *               priority: { type: string, enum: [low, medium, high, urgent] }
 *     responses:
 *       200:
 *         description: Ticket priority updated
 * /admin/support/tickets/{ticketId}/reply:
 *   post:
 *     tags:
 *       - Administration
 *     summary: Post public administrative reply to ticket
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message: { type: string }
 *     responses:
 *       200:
 *         description: Public reply dispatched to user
 * /admin/support/tickets/{ticketId}/internal-notes:
 *   post:
 *     tags:
 *       - Administration
 *     summary: Add private internal note (visible strictly to staff)
 *     description: Appends a note with visibility set to 'internal'. Stripped from all tourist and vendor API responses.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message: { type: string }
 *     responses:
 *       200:
 *         description: Internal note recorded
 */
router.get('/support/tickets', adminSupportController.getAdminTickets);
router.get('/support/tickets/:ticketId', adminSupportController.getAdminTicketDetail);
router.patch('/support/tickets/:ticketId/assign', adminSupportController.assignTicket);
router.patch('/support/tickets/:ticketId/status', adminSupportController.updateStatus);
router.patch('/support/tickets/:ticketId/priority', adminSupportController.updatePriority);
router.post('/support/tickets/:ticketId/reply', adminSupportController.adminReply);
router.post('/support/tickets/:ticketId/internal-notes', adminSupportController.adminInternalNote);

/**
 * @openapi
 * /admin/refunds:
 *   get:
 *     tags:
 *       - Administration
 *     summary: List customer refund requests
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, approved, rejected, processed] }
 *     responses:
 *       200:
 *         description: Paginated refund requests
 * /admin/refunds/{refundId}:
 *   get:
 *     tags:
 *       - Administration
 *     summary: View refund request details and associated payment/booking
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: refundId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Refund request and payment breakdown
 * /admin/refunds/{refundId}/approve:
 *   patch:
 *     tags:
 *       - Administration
 *     summary: Approve and execute refund
 *     description: Executes financial rollback via Chapa refund engine, releases held capacity, debits vendor balance, and rolls back platform commission.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: refundId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               adminNote: { type: string }
 *     responses:
 *       200:
 *         description: Refund approved and financial rollback executed
 * /admin/refunds/{refundId}/reject:
 *   patch:
 *     tags:
 *       - Administration
 *     summary: Reject customer refund request with reason
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: refundId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason]
 *             properties:
 *               reason: { type: string }
 *     responses:
 *       200:
 *         description: Refund rejection recorded
 */
router.get('/refunds', adminRefundsController.getRefundRequests);
router.get('/refunds/:refundId', adminRefundsController.getRefundRequestDetail);
router.patch('/refunds/:refundId/approve', adminRefundsController.approveRefund);
router.patch('/refunds/:refundId/reject', adminRefundsController.rejectRefund);
router.post('/refunds/:refundId/retry', adminRefundsController.retryRefund);

/**
 * @openapi
 * /admin/exports/bookings:
 *   get:
 *     tags:
 *       - Admin Exports
 *     summary: Export bookings to RFC 4180 CSV attachment
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: CSV file download
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 * /admin/exports/payments:
 *   get:
 *     tags:
 *       - Admin Exports
 *     summary: Export payments to RFC 4180 CSV
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Payments CSV export
 * /admin/exports/commissions:
 *   get:
 *     tags:
 *       - Admin Exports
 *     summary: Export platform commissions to RFC 4180 CSV
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Commissions CSV export
 * /admin/exports/refunds:
 *   get:
 *     tags:
 *       - Admin Exports
 *     summary: Export refunds to RFC 4180 CSV
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Refunds CSV export
 * /admin/exports/settlements:
 *   get:
 *     tags:
 *       - Admin Exports
 *     summary: Export vendor settlements to RFC 4180 CSV
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Settlements CSV export
 * /admin/exports/vendors:
 *   get:
 *     tags:
 *       - Admin Exports
 *     summary: Export vendor directory to RFC 4180 CSV
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Vendors CSV export
 * /admin/exports/reviews:
 *   get:
 *     tags:
 *       - Admin Exports
 *     summary: Export reviews and rating feedback to RFC 4180 CSV
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Reviews CSV export
 * /admin/exports/support-tickets:
 *   get:
 *     tags:
 *       - Admin Exports
 *     summary: Export support tickets to RFC 4180 CSV
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Support tickets CSV export
 */
router.get('/exports/bookings', adminExportsController.exportBookings);
router.get('/exports/payments', adminExportsController.exportPayments);
router.get('/exports/commissions', adminExportsController.exportCommissions);
router.get('/exports/refunds', adminExportsController.exportRefunds);
router.get('/exports/settlements', adminExportsController.exportSettlements);
router.get('/exports/vendors', adminExportsController.exportVendors);
router.get('/exports/reviews', adminExportsController.exportReviews);
router.get('/exports/support-tickets', adminExportsController.exportSupportTickets);

// Eco-Compliance
router.get('/eco-compliance', getEcoCompliance);

// Analytics & Reports
router.get('/analytics', getAnalytics);
router.get('/reports/export', exportReport);

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
