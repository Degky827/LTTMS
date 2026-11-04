const express = require('express');
const {
  getVendorBookings,
  getVendorBookingById,
  confirmVendorBooking,
  rejectVendorBooking,
  getVendorBookingStatistics,
  getVendorRefundRequests
} = require('../controllers/vendorBookingController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { rejectBookingSchema } = require('../validation/bookingSchemas');

router.use(protect);
router.use(authorize('vendor', 'admin', 'super_admin'));

/**
 * @openapi
 * /vendor/bookings/statistics:
 *   get:
 *     tags:
 *       - Vendors
 *     summary: Get booking analytics and revenue statistics for vendor
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Vendor booking performance metrics
 */
router.get('/statistics', getVendorBookingStatistics);

/**
 * @openapi
 * /vendor/bookings:
 *   get:
 *     tags:
 *       - Vendors
 *     summary: List incoming bookings for vendor services
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
 *     responses:
 *       200:
 *         description: Paginated vendor booking list
 */
router.get('/', getVendorBookings);

/**
 * @openapi
 * /vendor/bookings/{id}:
 *   get:
 *     tags:
 *       - Vendors
 *     summary: Get single vendor booking details
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
 *         description: Booking details
 *       404:
 *         description: Booking not found
 */
router.get('/:id', getVendorBookingById);

/**
 * @openapi
 * /vendor/bookings/{id}/confirm:
 *   patch:
 *     tags:
 *       - Vendors
 *     summary: Confirm a pending reservation
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
 *         description: Booking confirmed successfully
 */
router.patch('/:id/confirm', confirmVendorBooking);

/**
 * @openapi
 * /vendor/bookings/{id}/reject:
 *   patch:
 *     tags:
 *       - Vendors
 *     summary: Reject a pending reservation and release held capacity
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
 *               reason: { type: string, example: 'Fully booked for private event' }
 *     responses:
 *       200:
 *         description: Booking rejected and capacity released
 */
router.patch('/:id/reject', validate(rejectBookingSchema), rejectVendorBooking);

module.exports = router;
