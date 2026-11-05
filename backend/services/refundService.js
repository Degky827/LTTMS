const RefundRequest = require('../models/RefundRequest');
const Booking = require('../models/Booking');

class RefundEligibilityError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RefundEligibilityError';
    this.statusCode = 400;
  }
}

/**
 * Initiate a refund request for an eligible booking
 */
async function initiateRefundRequest({ bookingId, userId, amount, reason, description }) {
  const booking = await Booking.findById(bookingId).populate('service');
  if (!booking) {
    throw new RefundEligibilityError('Booking not found');
  }

  const bookingUserId = booking.user ? booking.user.toString() : null;
  if (!bookingUserId || bookingUserId !== userId.toString()) {
    throw new RefundEligibilityError('You can only submit refund requests for your own bookings');
  }

  const eligibleStatuses = ['cancelled', 'rejected', 'completed', 'pending'];
  if (!eligibleStatuses.includes(booking.status)) {
    throw new RefundEligibilityError(
      `Bookings with status '${booking.status}' are not currently eligible for refund requests`
    );
  }

  const requestedAmount = Number(amount || booking.totalAmount);
  if (requestedAmount <= 0) {
    throw new RefundEligibilityError('Refund amount must be greater than zero');
  }

  if (requestedAmount > booking.totalAmount) {
    throw new RefundEligibilityError(
      `Requested refund amount (${requestedAmount}) exceeds the total booking amount (${booking.totalAmount})`
    );
  }

  // Prevent duplicate active refund requests
  const existingActive = await RefundRequest.findOne({
    booking: booking._id,
    status: { $in: ['requested', 'submitted', 'under_review', 'approved'] }
  });

  if (existingActive) {
    throw new RefundEligibilityError(
      'An active refund request already exists for this booking. Duplicate requests are not permitted.'
    );
  }

  const refundRequest = await RefundRequest.create({
    booking: booking._id,
    user: userId,
    vendor: booking.vendor || (booking.service && booking.service.vendor),
    amount: requestedAmount,
    currency: booking.currency || 'ETB',
    reason,
    description: description || 'Refund requested by tourist',
    status: 'submitted'
  });

  return refundRequest;
}

/**
 * Administrative review of a refund request
 */
async function reviewRefundRequest(requestId, adminUser, decision, adminNote = null, rejectionReason = null) {
  const request = await RefundRequest.findById(requestId).populate('booking user');
  if (!request) {
    throw new RefundEligibilityError('Refund request not found');
  }

  if (!['approved', 'rejected', 'under_review'].includes(decision)) {
    throw new RefundEligibilityError('Decision must be approved, rejected, or under_review');
  }

  request.status = decision;
  request.reviewedBy = adminUser._id || adminUser.id;
  request.reviewedAt = new Date();
  if (adminNote) request.adminNote = adminNote;
  if (rejectionReason && decision === 'rejected') request.rejectionReason = rejectionReason;

  await request.save();
  return request;
}

module.exports = {
  RefundEligibilityError,
  initiateRefundRequest,
  reviewRefundRequest
};
