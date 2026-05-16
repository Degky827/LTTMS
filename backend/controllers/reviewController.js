const Review = require('../models/Review');
const Service = require('../models/Service');

// @desc    Get all reviews for a service
// @route   GET /api/reviews/service/:serviceId
// @access  Public
exports.getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ service: req.params.serviceId }).populate({
      path: 'user',
      select: 'name'
    });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Add review for a service
// @route   POST /api/reviews
// @access  Private (Tourist)
exports.addReview = async (req, res, next) => {
  try {
    req.body.user = req.user.id;

    const service = await Service.findById(req.body.service);

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const review = await Review.create(req.body);

    // Update service average rating (simple logic)
    const reviews = await Review.find({ service: req.body.service });
    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
    
    await Service.findByIdAndUpdate(req.body.service, { rating: avgRating });

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (Owner/Admin)
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Make sure user is review owner or admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this review' });
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
