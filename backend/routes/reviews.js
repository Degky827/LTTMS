const express = require('express');
const {
  getReviews,
  getReviewById,
  getMyReviews,
  addReview,
  updateReview,
  reportReview,
  vendorRespond,
  deleteReview
} = require('../controllers/reviewController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createReviewSchema,
  updateReviewSchema,
  reportReviewSchema,
  vendorResponseSchema
} = require('../validation/reviewSchemas');

// Public review lookups
router.get('/service/:serviceId', getReviews);
router.get('/my-reviews', protect, getMyReviews);
router.get('/:reviewId', getReviewById);

// Review submission and updates
router.post('/', protect, authorize('tourist', 'admin'), validate(createReviewSchema), addReview);
router.patch('/:reviewId', protect, validate(updateReviewSchema), updateReview);
router.post('/:reviewId/report', protect, validate(reportReviewSchema), reportReview);
router.delete('/:id', protect, deleteReview);

// Vendor response endpoint alias
router.post('/:reviewId/respond', protect, authorize('vendor', 'admin'), validate(vendorResponseSchema), vendorRespond);
router.patch('/:reviewId/respond', protect, authorize('vendor', 'admin'), validate(vendorResponseSchema), vendorRespond);

module.exports = router;
