const ReservationCapacity = require('../models/ReservationCapacity');

class CapacityConflictError extends Error {
  constructor(message = 'Requested capacity exceeds available capacity for this date and time slot') {
    super(message);
    this.name = 'CapacityConflictError';
    this.statusCode = 409;
    this.code = 'CAPACITY_CONFLICT';
  }
}

/**
 * Normalize date to UTC midnight (00:00:00.000Z)
 */
function normalizeDate(inputDate) {
  const d = new Date(inputDate);
  if (Number.isNaN(d.getTime())) {
    throw new Error('Invalid date provided for capacity calculation');
  }
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

/**
 * Normalize time slot identifier
 */
function normalizeSlotKey(timeSlot) {
  if (!timeSlot || typeof timeSlot !== 'string' || timeSlot.trim() === '') {
    return 'all_day';
  }
  return timeSlot.trim().toLowerCase();
}

/**
 * Determine configured total capacity for a service and time slot
 */
function getEffectiveCapacity(service, timeSlotKey) {
  if (timeSlotKey && timeSlotKey !== 'all_day' && Array.isArray(service.timeSlots)) {
    const matchedSlot = service.timeSlots.find(slot => {
      const formatted = `${slot.startTime}-${slot.endTime}`.toLowerCase();
      return formatted === timeSlotKey || slot.startTime === timeSlotKey;
    });
    if (matchedSlot && matchedSlot.maxCapacity) {
      return Number(matchedSlot.maxCapacity);
    }
  }
  return Number(service.dailyCapacity || 20);
}

/**
 * Ensure a capacity ledger document exists for the given slot
 */
async function ensureCapacitySlot(service, date, timeSlot) {
  const normDate = normalizeDate(date);
  const slotKey = normalizeSlotKey(timeSlot);
  const serviceId = service._id || service;
  const totalCap = getEffectiveCapacity(service, slotKey);

  const slot = await ReservationCapacity.findOneAndUpdate(
    {
      service: serviceId,
      date: normDate,
      timeSlot: slotKey
    },
    {
      $setOnInsert: {
        service: serviceId,
        date: normDate,
        timeSlot: slotKey,
        totalCapacity: totalCap,
        reservedCapacity: 0,
        heldCapacity: 0,
        remainingCapacity: totalCap
      }
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );

  return slot;
}

/**
 * Concurrency-Safe Atomic Capacity Acquisition
 * 
 * Uses MongoDB document-level serialized atomic conditional update.
 * Prevents race conditions and overbooking even under high concurrency.
 */
async function acquireCapacity(service, date, timeSlot, guests, options = {}) {
  const normDate = normalizeDate(date);
  const slotKey = normalizeSlotKey(timeSlot);
  const serviceId = service._id || service;
  const requestedGuests = Number(guests || 1);
  const asHold = Boolean(options.asHold);

  if (requestedGuests <= 0) {
    throw new Error('Requested capacity must be a positive integer');
  }

  // Ensure slot exists prior to conditional decrement
  await ensureCapacitySlot(service, normDate, slotKey);

  const updatedSlot = await ReservationCapacity.findOneAndUpdate(
    {
      service: serviceId,
      date: normDate,
      timeSlot: slotKey,
      remainingCapacity: { $gte: requestedGuests }
    },
    {
      $inc: {
        heldCapacity: asHold ? requestedGuests : 0,
        reservedCapacity: asHold ? 0 : requestedGuests,
        remainingCapacity: -requestedGuests
      }
    },
    { new: true }
  );

  if (!updatedSlot) {
    throw new CapacityConflictError(
      `Insufficient capacity on ${normDate.toISOString().split('T')[0]} (Slot: ${slotKey}). Requested: ${requestedGuests} seats.`
    );
  }

  return updatedSlot;
}

/**
 * Atomically convert a temporary hold to a confirmed reservation
 */
async function convertHoldToReserved(service, date, timeSlot, guests) {
  const normDate = normalizeDate(date);
  const slotKey = normalizeSlotKey(timeSlot);
  const serviceId = service._id || service;
  const count = Number(guests || 1);

  const updated = await ReservationCapacity.findOneAndUpdate(
    {
      service: serviceId,
      date: normDate,
      timeSlot: slotKey
    },
    {
      $inc: {
        heldCapacity: -count,
        reservedCapacity: count
      }
    },
    { new: true }
  );

  return updated;
}

/**
 * Atomically release capacity back to the available pool
 */
async function releaseCapacity(service, date, timeSlot, guests, options = {}) {
  const normDate = normalizeDate(date);
  const slotKey = normalizeSlotKey(timeSlot);
  const serviceId = service._id || service;
  const count = Number(guests || 1);
  const fromHold = Boolean(options.fromHold);

  const updated = await ReservationCapacity.findOneAndUpdate(
    {
      service: serviceId,
      date: normDate,
      timeSlot: slotKey
    },
    {
      $inc: {
        heldCapacity: fromHold ? -count : 0,
        reservedCapacity: fromHold ? 0 : -count,
        remainingCapacity: count
      }
    },
    { new: true }
  );

  return updated;
}

module.exports = {
  CapacityConflictError,
  normalizeDate,
  normalizeSlotKey,
  getEffectiveCapacity,
  ensureCapacitySlot,
  acquireCapacity,
  convertHoldToReserved,
  releaseCapacity
};
