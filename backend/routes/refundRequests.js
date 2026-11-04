const express = require('express');
const { getMyRefundRequests } = require('../controllers/bookingController');
const {
  getAdminRefundRequests,
  approveRefundRequest,
  rejectRefundRequest
} = require('../controllers/adminBookingController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { reviewRefundRequestSchema } = require('../validation/bookingSchemas');

router.use(protect);

/**
 * @openapi
 * /refund-requests/my:
 *   get:
 *     tags:
 *       - Bookings
 *     summary: Get tourist's own refund requests
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of submitted refund requests
 */
router.get('/my', authorize('tourist', 'admin', 'super_admin'), getMyRefundRequests);

/**
 * @openapi
 * /refund-requests:
 *   get:
 *     tags:
 *       - Administration
 *     summary: List platform refund requests for review
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [submitted, under_review, approved, rejected, processing, completed] }
 *     responses:
 *       200:
 *         description: Platform refund requests queue
 */
router.get('/', authorize('admin', 'super_admin'), getAdminRefundRequests);

/**
 * @openapi
 * /refund-requests/{id}/approve:
 *   patch:
 *     tags:
 *       - Administration
 *     summary: Approve refund request for payout execution in Step 7
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               adminNote: { type: string, example: 'Verified trip cancellation due to weather' }
 *     responses:
 *       200:
 *         description: Refund request approved
 */
router.patch('/:id/approve', authorize('admin', 'super_admin'), validate(reviewRefundRequestSchema), approveRefundRequest);

/**
 * @openapi
 * /refund-requests/{id}/reject:
 *   patch:
 *     tags:
 *       - Administration
 *     summary: Reject refund request
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               adminNote: { type: string }
 *               rejectionReason: { type: string, example: 'Non-refundable booking cancellation policy' }
 *     responses:
 *       200:
 *         description: Refund request rejected
 */
router.patch('/:id/reject', authorize('admin', 'super_admin'), validate(reviewRefundRequestSchema), rejectRefundRequest);

module.exports = router;
