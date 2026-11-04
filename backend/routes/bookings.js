const express = require('express');
const {
  getBookings,
  getUserBookings,
  createBooking,
  updateBooking,
  getMyBookingById,
  getBookingByReference,
  cancelBooking,
  getBookingHistory,
  createBookingRefundRequest,
  getMyRefundRequests
} = require('../controllers/bookingController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createBookingSchema,
  updateBookingSchema,
  cancelBookingSchema,
  refundRequestSchema
} = require('../validation/bookingSchemas');
const { requirePermission } = require('../middleware/permissions');

/**
 * @openapi
 * /bookings:
 *   get:
 *     tags:
 *       - Bookings
 *     summary: Get all bookings (Admin only)
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, confirmed, completed, cancelled, rejected, expired] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated booking records
 *   post:
 *     tags:
 *       - Bookings
 *     summary: Create a new tourism reservation
 *     description: Creates a real reservation with backend-calculated pricing snapshot, idempotency protection, and concurrency-safe capacity locking.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookingInput'
 *     responses:
 *       201:
 *         description: Reservation created successfully
 *       400:
 *         description: Validation error or schedule conflict
 *       409:
 *         description: Capacity conflict - Selected date/slot is fully booked
 */
router
  .route('/')
  .get(protect, authorize('admin', 'super_admin'), getBookings)
  .post(
    protect,
    authorize('tourist', 'admin', 'super_admin'),
    requirePermission('bookings:create:own'),
    validate(createBookingSchema),
    createBooking
  );

/**
 * @openapi
 * /bookings/my:
 *   get:
 *     tags:
 *       - Bookings
 *     summary: Get tourist's own reservations
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *     responses:
 *       200:
 *         description: Tourist reservation history
 */
router.get('/user', protect, authorize('tourist', 'admin', 'super_admin'), getUserBookings);
router.get('/my', protect, authorize('tourist', 'admin', 'super_admin'), getUserBookings);

/**
 * @openapi
 * /bookings/my/{id}:
 *   get:
 *     tags:
 *       - Bookings
 *     summary: Get single tourist reservation by ID
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
 *         description: Detailed reservation data
 *       404:
 *         description: Booking not found
 */
router.get('/my/:id', protect, authorize('tourist', 'admin', 'super_admin'), getMyBookingById);

/**
 * @openapi
 * /bookings/reference/{reference}:
 *   get:
 *     tags:
 *       - Bookings
 *     summary: Lookup reservation by human-readable booking reference
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema: { type: string, example: 'LTTMS-2026-4F2A9B1C' }
 *     responses:
 *       200:
 *         description: Booking found
 *       404:
 *         description: Reference not found
 */
router.get('/reference/:reference', protect, getBookingByReference);

/**
 * @openapi
 * /bookings/{id}/cancel:
 *   post:
 *     tags:
 *       - Bookings
 *     summary: Cancel an eligible reservation and restore capacity
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
 *               reason: { type: string, example: 'Change of travel plans' }
 *     responses:
 *       200:
 *         description: Reservation cancelled and capacity restored
 *       400:
 *         description: Cancellation not permitted under current booking state
 */
router.post('/:id/cancel', protect, authorize('tourist', 'admin', 'super_admin'), validate(cancelBookingSchema), cancelBooking);

/**
 * @openapi
 * /bookings/{id}/history:
 *   get:
 *     tags:
 *       - Bookings
 *     summary: Get immutable audit history of status transitions
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
 *         description: Status transition audit trail
 */
router.get('/:id/history', protect, getBookingHistory);

/**
 * @openapi
 * /bookings/{id}/refund-requests:
 *   post:
 *     tags:
 *       - Bookings
 *     summary: Initiate a refund request for an eligible booking
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
 *             required: [reason]
 *             properties:
 *               reason: { type: string, enum: [cancellation, service_not_provided, bad_weather, vendor_cancelled, duplicate_charge, other] }
 *               amount: { type: number, example: 1500 }
 *               description: { type: string, example: 'Boat trip cancelled due to stormy lake conditions' }
 *     responses:
 *       201:
 *         description: Refund request created and queued for administrative review
 */
router.post('/:id/refund-requests', protect, authorize('tourist', 'admin', 'super_admin'), validate(refundRequestSchema), createBookingRefundRequest);

// Backward-compatible individual booking routes
router
  .route('/:id')
  .get(protect, getMyBookingById)
  .put(protect, authorize('vendor', 'admin', 'super_admin'), validate(updateBookingSchema), updateBooking);

module.exports = router;
