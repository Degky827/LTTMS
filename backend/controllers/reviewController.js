const Review = require('../models/Review');
const Service = require('../models/Service');
const reviewService = require('../services/reviewService');

// @desc    Get all approved reviews for a service
// @route   GET /api/v1/reviews/service/:serviceId
// @access  Public
exports.getReviews = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const query = {
      service: serviceId,
      status: { $in: ['approved'] }
    };

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('user', 'name profilePicture')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments(query)
    ]);

    // Service rating statistics
    const ratingStats = await Review.aggregate([
      { $match: { service: new Service.base.Types.ObjectId(serviceId), status: 'approved' } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      ratingStats,
      data: reviews
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single review by ID
// @route   GET /api/v1/reviews/:reviewId
// @access  Public
exports.getReviewById = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.reviewId || req.params.id)
      .populate('user', 'name profilePicture')
      .populate('service', 'title price currency')
      .populate('vendor', 'businessName');

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.status(200).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

// @desc    Get authenticated tourist's reviews
// @route   GET /api/v1/reviews/my-reviews
// @access  Private (Tourist)
exports.getMyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate('service', 'title category')
      .populate('booking', 'bookingReference date')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add review for a service
// @route   POST /api/v1/reviews
// @access  Private (Tourist)
exports.addReview = async (req, res, next) => {
  try {
    const { service, serviceId, rating, title, comment, images, categories, booking, bookingId } = req.body;
    const targetServiceId = service || serviceId || req.params.serviceId;
    const targetBookingId = booking || bookingId;

    const review = await reviewService.createReview({
      userId: req.user.id,
      serviceId: targetServiceId,
      rating,
      title,
      comment,
      images,
      categories,
      bookingId: targetBookingId
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update review
// @route   PATCH /api/v1/reviews/:reviewId
// @access  Private (Owner)
exports.updateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.reviewId || req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this review' });
    }

    const { rating, title, comment, images, categories } = req.body;
    if (rating !== undefined) review.rating = rating;
    if (title !== undefined) review.title = title;
    if (comment !== undefined) review.comment = comment;
    if (images !== undefined) review.images = images;
    if (categories !== undefined) review.categories = { ...review.categories, ...categories };

    await review.save();
    await reviewService.recalculateServiceRating(review.service);

    res.status(200).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

// @desc    Report an inappropriate review
// @route   POST /api/v1/reviews/:reviewId/report
// @access  Private (Authenticated)
exports.reportReview = async (req, res, next) => {
  try {
    const { reason, description } = req.body;
    const review = await reviewService.reportReview({
      reviewId: req.params.reviewId || req.params.id,
      userId: req.user.id,
      reason,
      description
    });

    res.status(200).json({
      success: true,
      message: 'Review reported for moderation review',
      data: { reviewId: review._id, reportedCount: review.reportedCount }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Vendor responds to a review
// @route   POST /api/v1/vendor/reviews/:reviewId/respond
// @access  Private (Vendor)
exports.vendorRespond = async (req, res, next) => {
  try {
    const { response } = req.body;
    const review = await reviewService.addVendorResponse({
      reviewId: req.params.reviewId || req.params.id,
      vendorUserId: req.user.id,
      response
    });

    res.status(200).json({
      success: true,
      message: 'Vendor response submitted successfully',
      data: review
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin: get all reviews with moderation filters
// @route   GET /api/v1/admin/reviews
// @access  Private (Admin)
exports.adminGetReviews = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.flagged === 'true') query.flagged = true;
    if (req.query.service) query.service = req.query.service;
    if (req.query.vendor) query.vendor = req.query.vendor;

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('user', 'name email')
        .populate('service', 'title')
        .populate('vendor', 'businessName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: reviews
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin: moderate review (approve, reject, hide, restore, flag)
// @route   PATCH /api/v1/admin/reviews/:reviewId/moderate
// @access  Private (Admin)
exports.adminModerateReview = async (req, res, next) => {
  try {
    const { action, reason } = req.body;
    const review = await reviewService.moderateReview({
      reviewId: req.params.reviewId || req.params.id,
      adminUser: req.user,
      action,
      reason
    });

    res.status(200).json({
      success: true,
      message: `Review ${action}d successfully`,
      data: review
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin: view reports submitted against a review
// @route   GET /api/v1/admin/reviews/:reviewId/reports
// @access  Private (Admin)
exports.adminGetReviewReports = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.reviewId || req.params.id)
      .populate('reports.user', 'name email')
      .select('reports reportedCount flagged flagReason');

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.status(200).json({
      success: true,
      data: review.reports,
      reportedCount: review.reportedCount,
      flagged: review.flagged
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
// @access  Private (Owner/Admin)
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id || req.params.reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this review' });
    }

    const serviceId = review.service;
    await review.deleteOne();
    await reviewService.recalculateServiceRating(serviceId);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};
