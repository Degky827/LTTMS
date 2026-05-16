const express = require('express');
const {
  getBookings,
  getUserBookings,
  createBooking,
  updateBooking
} = require('../controllers/bookingController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createBookingSchema, updateBookingSchema } = require('../validation/bookingSchemas');
const { requirePermission } = require('../middleware/permissions');

router
  .route('/')
  .get(protect, authorize('admin'), getBookings)
  .post(protect, authorize('tourist', 'admin'), requirePermission('bookings:create:own'), validate(createBookingSchema), createBooking);

router.get('/user', protect, authorize('tourist', 'admin'), getUserBookings);

router
  .route('/:id')
  .put(protect, authorize('vendor', 'admin'), validate(updateBookingSchema), updateBooking);

module.exports = router;
