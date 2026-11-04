const Review = require('../models/Review');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Vendor = require('../models/Vendor');
const logger = require('../utils/logger');

/**
 * Validate tourist booking eligibility for verified review submission
 */
async function validateBookingEligibility({ userId, serviceId, bookingId }) {
  if (!bookingId) {
    return { isVerified: false, booking: null };
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    const error = new Error('Specified booking reference not found');
    error.statusCode = 404;
    throw error;
  }

  const bookingUserId = booking.user ? booking.user.toString() : null;
  if (bookingUserId !== userId.toString()) {
    const error = new Error('You can only submit reviews for your own bookings');
    error.statusCode = 403;
    throw error;
  }

  const bookingServiceId = booking.service ? booking.service.toString() : null;
  if (bookingServiceId !== serviceId.toString()) {
    const error = new Error('Booking does not match the reviewed tourism service');
    error.statusCode = 400;
    throw error;
  }

  // Must have experienced the service
  const eligibleStatuses = ['completed', 'confirmed'];
  if (!eligibleStatuses.includes(booking.status)) {
    const error = new Error(`Bookings in '${booking.status}' status are not yet eligible for review`);
    error.statusCode = 400;
    throw error;
  }

  // Check if booking already reviewed
  const existingReview = await Review.findOne({ booking: booking._id });
  if (existingReview) {
    const error = new Error('This booking has already been reviewed');
    error.statusCode = 400;
    throw error;
  }

  return { isVerified: true, booking };
}

/**
 * Recalculate average rating and review count for a tourism service
 */
async function recalculateServiceRating(serviceId) {
  try {
    const stats = await Review.aggregate([
      {
        $match: {
          service: typeof serviceId === 'string' ? new Service.base.Types.ObjectId(serviceId) : serviceId,
          status: 'approved'
        }
      },
      {
        $group: {
          _id: '$service',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]);

    if (stats.length > 0) {
      const avg = Math.round(stats[0].avgRating * 10) / 10;
      await Service.findByIdAndUpdate(serviceId, {
        rating: avg,
        ratingsAverage: avg,
        ratingsQuantity: stats[0].count,
        reviewCount: stats[0].count
      });
      return { rating: avg, count: stats[0].count };
    }

    // Default when no approved reviews
    await Service.findByIdAndUpdate(serviceId, {
      rating: 0,
      ratingsAverage: 0,
      ratingsQuantity: 0,
      reviewCount: 0
    });
    return { rating: 0, count: 0 };
  } catch (err) {
    logger.warn({ err: err.message, serviceId }, 'Failed to recalculate service rating');
    return null;
  }
}

/**
 * Create a new tourist review
 */
async function createReview({
  userId,
  serviceId,
  rating,
  title,
  comment,
  images = [],
  categories = {},
  bookingId = null
}) {
  const service = await Service.findById(serviceId);
  if (!service) {
    const error = new Error('Tourism service not found');
    error.statusCode = 404;
    throw error;
  }

  // Check anti-spam: One review per user per service
  const existing = await Review.findOne({ user: userId, service: serviceId });
  if (existing) {
    const error = new Error('You have already submitted a review for this service');
    error.statusCode = 400;
    throw error;
  }

  // Check booking eligibility
  let isVerified = false;
  let verifiedBookingId = null;
  if (bookingId) {
    const validation = await validateBookingEligibility({ userId, serviceId, bookingId });
    isVerified = validation.isVerified;
    verifiedBookingId = validation.booking?._id || bookingId;
  }

  const review = await Review.create({
    user: userId,
    service: serviceId,
    vendor: service.vendor || null,
    booking: verifiedBookingId,
    rating: Number(rating),
    title: title || null,
    comment,
    images: Array.isArray(images) ? images : [],
    categories: {
      cleanliness: categories.cleanliness || 5,
      ecoFriendly: categories.ecoFriendly || 5,
      hospitality: categories.hospitality || 5,
      value: categories.value || 5
    },
    status: 'approved', // Auto-approved by default unless flagged
    isVerifiedBooking: isVerified
  });

  await recalculateServiceRating(serviceId);
  return review;
}

/**
 * Report an inappropriate review
 */
async function reportReview({ reviewId, userId, reason, description }) {
  const review = await Review.findById(reviewId);
  if (!review) {
    const error = new Error('Review not found');
    error.statusCode = 404;
    throw error;
  }

  // Prevent duplicate report by same user
  const alreadyReported = review.reports.some(r => r.user && r.user.toString() === userId.toString());
  if (alreadyReported) {
    const error = new Error('You have already reported this review');
    error.statusCode = 400;
    throw error;
  }

  review.reports.push({
    user: userId,
    reason,
    description: description || null,
    reportedAt: new Date()
  });

  review.reportedCount = (review.reportedCount || 0) + 1;

  // Auto-flag review if reported 3 or more times
  if (review.reportedCount >= 3) {
    review.flagged = true;
    review.flagReason = `Multiple user reports (${review.reportedCount})`;
    review.status = 'flagged';
  }

  await review.save();
  return review;
}

/**
 * Vendor response to a review on their service
 */
async function addVendorResponse({ reviewId, vendorUserId, response }) {
  const review = await Review.findById(reviewId).populate('service');
  if (!review) {
    const error = new Error('Review not found');
    error.statusCode = 404;
    throw error;
  }

  // Check vendor ownership
  const vendor = await Vendor.findOne({ user: vendorUserId });
  if (!vendor) {
    const error = new Error('Vendor profile not found');
    error.statusCode = 404;
    throw error;
  }

  const reviewVendorId = review.vendor ? review.vendor.toString() : null;
  const serviceVendorId = review.service?.vendor ? review.service.vendor.toString() : null;
  const currentVendorId = vendor._id.toString();

  if (reviewVendorId !== currentVendorId && serviceVendorId !== currentVendorId) {
    const error = new Error('You can only respond to reviews on your own services');
    error.statusCode = 403;
    throw error;
  }

  review.vendorResponse = {
    response: response.trim(),
    respondedAt: new Date(),
    respondedBy: vendorUserId
  };
  review.vendorReply = response.trim();
  review.repliedAt = new Date();

  await review.save();
  return review;
}

/**
 * Admin review moderation
 */
async function moderateReview({ reviewId, adminUser, action, reason }) {
  const review = await Review.findById(reviewId);
  if (!review) {
    const error = new Error('Review not found');
    error.statusCode = 404;
    throw error;
  }

  const statusMap = {
    approve: 'approved',
    restore: 'approved',
    reject: 'rejected',
    hide: 'hidden',
    flag: 'flagged'
  };

  const newStatus = statusMap[action];
  if (!newStatus) {
    const error = new Error(`Invalid moderation action: '${action}'`);
    error.statusCode = 400;
    throw error;
  }

  review.status = newStatus;
  review.moderatedBy = adminUser.id || adminUser._id;
  review.moderationReason = reason || `Review ${action}d by administrator`;
  review.moderatedAt = new Date();

  if (action === 'approve' || action === 'restore') {
    review.flagged = false;
    review.isApproved = true;
  } else if (action === 'reject' || action === 'hide') {
    review.isApproved = false;
  } else if (action === 'flag') {
    review.flagged = true;
  }

  await review.save();
  await recalculateServiceRating(review.service);

  return review;
}

module.exports = {
  validateBookingEligibility,
  recalculateServiceRating,
  createReview,
  reportReview,
  addVendorResponse,
  moderateReview
};
