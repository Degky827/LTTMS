const ReservationHold = require('../models/ReservationHold');
const Booking = require('../models/Booking');
const BookingStatusHistory = require('../models/BookingStatusHistory');
const { releaseCapacity } = require('./capacityService');
const logger = require('../utils/logger');

let cleanerTimer = null;

/**
 * Sweep and release expired reservation holds
 */
async function expireStaleHolds(io = null) {
  try {
    const now = new Date();
    const expiredHolds = await ReservationHold.find({
      status: 'active',
      expiresAt: { $lte: now }
    });

    if (!expiredHolds || expiredHolds.length === 0) {
      return 0;
    }

    let processedCount = 0;

    for (const hold of expiredHolds) {
      // Transition hold status atomically
      hold.status = 'expired';
      await hold.save();

      // Release held capacity back to ledger
      try {
        await releaseCapacity(
          hold.service,
          hold.serviceDate,
          hold.timeSlot,
          hold.reservedCapacity,
          { fromHold: true }
        );
      } catch (capErr) {
        logger.error({ err: capErr.message, holdId: hold._id }, 'Error restoring capacity for expired hold');
      }

      // If associated with a pending booking, expire the booking
      if (hold.booking) {
        try {
          const booking = await Booking.findById(hold.booking);
          if (booking && booking.status === 'pending') {
            const previousStatus = booking.status;
            booking.status = 'expired';
            await booking.save();

            // Record status history
            await BookingStatusHistory.create({
              booking: booking._id,
              previousStatus,
              newStatus: 'expired',
              actor: null,
              actorRole: 'system',
              reason: 'Reservation hold expired before checkout completion',
              metadata: { holdReference: hold.holdReference }
            });

            if (io) {
              io.to(`user:${booking.user}`).emit('booking:update', booking);
              io.to('admin').emit('booking:update', booking);
            }
          }
        } catch (bkgErr) {
          logger.error({ err: bkgErr.message, bookingId: hold.booking }, 'Error expiring booking for hold');
        }
      }

      processedCount++;
    }

    logger.info({ processedCount }, 'Swept expired reservation holds');
    return processedCount;
  } catch (err) {
    logger.error({ err: err.message }, 'Failed during hold expiration sweep');
    return 0;
  }
}

/**
 * Start background hold cleaner timer
 */
function startHoldCleaner(io = null, intervalMs = 60000) {
  if (cleanerTimer) return;
  cleanerTimer = setInterval(() => {
    expireStaleHolds(io);
  }, intervalMs);
  if (cleanerTimer.unref) {
    cleanerTimer.unref();
  }
}

/**
 * Stop background hold cleaner timer
 */
function stopHoldCleaner() {
  if (cleanerTimer) {
    clearInterval(cleanerTimer);
    cleanerTimer = null;
  }
}

module.exports = {
  expireStaleHolds,
  startHoldCleaner,
  stopHoldCleaner
};
