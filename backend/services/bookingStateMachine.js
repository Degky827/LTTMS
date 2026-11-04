const BookingStatusHistory = require('../models/BookingStatusHistory');
const ReservationHold = require('../models/ReservationHold');
const { releaseCapacity, convertHoldToReserved } = require('./capacityService');

const ALLOWED_TRANSITIONS = {
  pending: ['confirmed', 'rejected', 'cancelled', 'expired'],
  confirmed: ['completed', 'cancelled', 'rejected'],
  completed: [],
  rejected: [],
  cancelled: [],
  expired: []
};

class InvalidBookingStateTransitionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidBookingStateTransitionError';
    this.statusCode = 400;
  }
}

/**
 * Validate and execute a booking status transition
 */
async function transitionBookingStatus(booking, newStatus, actorUser = null, options = {}) {
  const currentStatus = booking.status;

  if (currentStatus === newStatus) {
    return booking; // No-op
  }

  const allowedNext = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (!allowedNext.includes(newStatus)) {
    throw new InvalidBookingStateTransitionError(
      `Cannot transition booking from '${currentStatus}' to '${newStatus}'. Allowed transitions: [${allowedNext.join(', ')}]`
    );
  }

  const actorRole = actorUser ? (actorUser.role || 'tourist') : (options.actorRole || 'system');
  const actorId = actorUser ? (actorUser._id || actorUser.id) : null;
  const reason = options.reason || null;

  // Authorization checks based on role
  if (actorRole === 'tourist') {
    if (newStatus !== 'cancelled') {
      throw new InvalidBookingStateTransitionError('Tourists are only permitted to cancel their own bookings');
    }
    const bookingTouristId = booking.user ? booking.user.toString() : null;
    if (bookingTouristId && actorId && bookingTouristId !== actorId.toString()) {
      throw new InvalidBookingStateTransitionError('You can only cancel your own bookings');
    }
  }

  if (actorRole === 'vendor') {
    if (!['confirmed', 'rejected'].includes(newStatus)) {
      throw new InvalidBookingStateTransitionError('Vendors may only confirm or reject pending bookings');
    }
  }

  // Handle capacity ledger implications
  const guests = Number(booking.guests || booking.totalParticipants || 1);
  const timeSlot = booking.timeSlot || 'all_day';
  const bookingDate = booking.date || booking.bookingDate;

  if (newStatus === 'confirmed' && currentStatus === 'pending') {
    // Convert held capacity to reserved capacity
    try {
      await convertHoldToReserved(booking.service, bookingDate, timeSlot, guests);
      await ReservationHold.updateMany(
        { booking: booking._id, status: 'active' },
        { status: 'converted', convertedAt: new Date() }
      );
    } catch (capErr) {
      // Continue or log error
    }
  } else if (['cancelled', 'rejected', 'expired'].includes(newStatus)) {
    // Release capacity back to ledger
    const wasPending = currentStatus === 'pending';
    try {
      await releaseCapacity(booking.service, bookingDate, timeSlot, guests, { fromHold: wasPending });
      await ReservationHold.updateMany(
        { booking: booking._id, status: 'active' },
        { status: 'released', releasedAt: new Date() }
      );
    } catch (capErr) {
      // Continue or log error
    }

    if (newStatus === 'cancelled') {
      booking.cancelledAt = new Date();
      booking.cancellationReason = reason;
      booking.cancelledBy = actorId;
    } else if (newStatus === 'rejected') {
      booking.rejectedAt = new Date();
      booking.rejectionReason = reason;
      booking.rejectedBy = actorId;
    }
  }

  // Update booking record
  booking.status = newStatus;
  await booking.save();

  // Create immutable status history record
  await BookingStatusHistory.create({
    booking: booking._id,
    previousStatus: currentStatus,
    newStatus,
    actor: actorId,
    actorRole,
    reason,
    metadata: options.metadata || {}
  });

  return booking;
}

module.exports = {
  ALLOWED_TRANSITIONS,
  InvalidBookingStateTransitionError,
  transitionBookingStatus
};
