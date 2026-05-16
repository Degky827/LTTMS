const express = require('express');
const {
  getReviews,
  addReview,
  deleteReview
} = require('../controllers/reviewController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.get('/service/:serviceId', getReviews);
router.post('/', protect, authorize('tourist', 'admin'), addReview);
router.delete('/:id', protect, authorize('tourist', 'admin'), deleteReview);

module.exports = router;
