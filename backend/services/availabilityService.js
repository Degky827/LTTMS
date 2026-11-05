const Service = require('../models/Service');
const Vendor = require('../models/Vendor');
const ReservationCapacity = require('../models/ReservationCapacity');
const { normalizeDate, normalizeSlotKey, getEffectiveCapacity, ensureCapacitySlot } = require('./capacityService');
const { calculatePricing } = require('./pricingService');

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/**
 * Validate date, operating schedules, blocked dates, and seasonal rules
 */
function validateDateAndSchedule(service, date, timeSlotKey) {
  const normDate = normalizeDate(date);
  const now = new Date();
  const todayNorm = normalizeDate(now);

  if (normDate.getTime() < todayNorm.getTime()) {
    return { valid: false, reason: 'Booking date cannot be in the past' };
  }

  // Operating days check
  if (Array.isArray(service.operatingDays) && service.operatingDays.length > 0) {
    const dayOfWeek = DAY_NAMES[normDate.getUTCDay()];
    const normalizedDays = service.operatingDays.map(d => d.toLowerCase().trim());
    if (!normalizedDays.includes(dayOfWeek)) {
      return { valid: false, reason: `Service is not available on ${dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)}s` };
    }
  }

  // Unavailable / blocked dates check
  if (Array.isArray(service.unavailableDates) && service.unavailableDates.length > 0) {
    const targetIso = normDate.toISOString().split('T')[0];
    const isBlocked = service.unavailableDates.some(d => {
      const bDate = normalizeDate(d);
      return bDate.toISOString().split('T')[0] === targetIso;
    });
    if (isBlocked) {
      return { valid: false, reason: 'Selected date is blocked or unavailable' };
    }
  }

  // Seasonal availability check
  if (service.seasonalAvailability && service.seasonalAvailability.startDate && service.seasonalAvailability.endDate) {
    const seasonStart = normalizeDate(service.seasonalAvailability.startDate);
    const seasonEnd = normalizeDate(service.seasonalAvailability.endDate);
    const inSeason = normDate.getTime() >= seasonStart.getTime() && normDate.getTime() <= seasonEnd.getTime();
    if (service.seasonalAvailability.isAvailable === false && inSeason) {
      return { valid: false, reason: 'Service is closed for seasonal hiatus during this period' };
    }
    if (service.seasonalAvailability.isAvailable === true && !inSeason) {
      return { valid: false, reason: 'Service is only available during its designated operating season' };
    }
  }

  // Time slot check
  if (timeSlotKey && timeSlotKey !== 'all_day' && Array.isArray(service.timeSlots) && service.timeSlots.length > 0) {
    const slotExists = service.timeSlots.some(s => {
      const formatted = `${s.startTime}-${s.endTime}`.toLowerCase();
      return formatted === timeSlotKey || s.startTime.toLowerCase() === timeSlotKey;
    });
    if (!slotExists) {
      return { valid: false, reason: `Invalid time slot '${timeSlotKey}' for this service` };
    }
  }

  return { valid: true };
}

/**
 * Check Availability for a Specific Service, Date, Time Slot, and Guest Count
 */
async function checkServiceAvailability(serviceId, query = {}) {
  const service = await Service.findById(serviceId).populate('vendor');
  if (!service) {
    throw new Error('Tourism service not found');
  }

  if (service.status !== 'published' || service.availability === false) {
    return {
      serviceId,
      isAvailable: false,
      reason: 'Service is currently not active or published for bookings'
    };
  }

  if (service.vendor) {
    const vendorStatus = service.vendor.verificationStatus || service.vendor.status;
    if (vendorStatus !== 'approved') {
      return {
        serviceId,
        isAvailable: false,
        reason: 'Service provider is not currently in approved status'
      };
    }
  }

  const requestedDate = query.date || query.startDate || new Date();
  const timeSlotKey = normalizeSlotKey(query.timeSlot);
  const participants = Number(query.participants || (Number(query.adults || 1) + Number(query.children || 0)));

  // Validate schedule and dates
  const scheduleValidation = validateDateAndSchedule(service, requestedDate, timeSlotKey);
  if (!scheduleValidation.valid) {
    return {
      serviceId,
      date: normalizeDate(requestedDate),
      timeSlot: timeSlotKey,
      isAvailable: false,
      reason: scheduleValidation.reason
    };
  }

  // Capacity bounds validation
  const minCap = Number(service.minBookingCapacity || 1);
  const maxCap = Number(service.maxBookingCapacity || service.dailyCapacity || 20);

  if (participants < minCap) {
    return {
      serviceId,
      date: normalizeDate(requestedDate),
      timeSlot: timeSlotKey,
      isAvailable: false,
      reason: `Booking requires at least ${minCap} participant(s)`
    };
  }

  if (participants > maxCap) {
    return {
      serviceId,
      date: normalizeDate(requestedDate),
      timeSlot: timeSlotKey,
      isAvailable: false,
      reason: `Maximum allowable booking size is ${maxCap} participants`
    };
  }

  // Retrieve or initialize capacity ledger slot
  const normDate = normalizeDate(requestedDate);
  const capacitySlot = await ensureCapacitySlot(service, normDate, timeSlotKey);

  const totalCapacity = capacitySlot.totalCapacity;
  const reservedCapacity = capacitySlot.reservedCapacity;
  const heldCapacity = capacitySlot.heldCapacity;
  const remainingCapacity = Math.max(0, capacitySlot.remainingCapacity);

  const isAvailable = remainingCapacity >= participants;

  const pricingResult = calculatePricing(service, {
    adults: query.adults != null ? query.adults : participants,
    children: query.children != null ? query.children : 0,
    guests: participants
  });

  return {
    serviceId: service._id,
    serviceTitle: service.title,
    date: normDate,
    timeSlot: timeSlotKey,
    totalCapacity,
    reservedCapacity,
    heldCapacity,
    remainingCapacity,
    isAvailable,
    minBookingCapacity: minCap,
    maxBookingCapacity: maxCap,
    confirmationType: service.confirmationType || 'instant',
    pricing: pricingResult.pricingSnapshot
  };
}

/**
 * Calendar Range Availability Matrix
 */
async function getCalendarAvailability(serviceId, startDateInput, endDateInput) {
  const service = await Service.findById(serviceId).populate('vendor');
  if (!service) {
    throw new Error('Tourism service not found');
  }

  const start = startDateInput ? normalizeDate(startDateInput) : normalizeDate(new Date());
  const end = endDateInput ? normalizeDate(endDateInput) : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Safety limit: Max 90 days range
  const MAX_DAYS = 90;
  const dayDifference = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
  const effectiveEnd = dayDifference > MAX_DAYS
    ? new Date(start.getTime() + MAX_DAYS * 24 * 60 * 60 * 1000)
    : end;

  // Batch load capacity slots for the date range
  const capacitySlots = await ReservationCapacity.find({
    service: service._id,
    date: { $gte: start, $lte: effectiveEnd }
  }).lean();

  const slotMap = new Map();
  for (const slot of capacitySlots) {
    const key = `${slot.date.toISOString().split('T')[0]}_${slot.timeSlot}`;
    slotMap.set(key, slot);
  }

  const calendar = [];
  const current = new Date(start);

  while (current.getTime() <= effectiveEnd.getTime()) {
    const dateStr = current.toISOString().split('T')[0];
    const validation = validateDateAndSchedule(service, current, 'all_day');

    if (!validation.valid) {
      calendar.push({
        date: dateStr,
        isAvailable: false,
        remainingCapacity: 0,
        totalCapacity: Number(service.dailyCapacity || 20),
        reason: validation.reason
      });
    } else {
      const slot = slotMap.get(`${dateStr}_all_day`);
      const totalCap = slot ? slot.totalCapacity : Number(service.dailyCapacity || 20);
      const remainingCap = slot ? Math.max(0, slot.remainingCapacity) : totalCap;

      calendar.push({
        date: dateStr,
        isAvailable: remainingCap > 0,
        remainingCapacity: remainingCap,
        totalCapacity: totalCap,
        reservedCapacity: slot ? slot.reservedCapacity : 0,
        heldCapacity: slot ? slot.heldCapacity : 0
      });
    }

    current.setUTCDate(current.getUTCDate() + 1);
  }

  return {
    serviceId: service._id,
    serviceTitle: service.title,
    startDate: start.toISOString().split('T')[0],
    endDate: effectiveEnd.toISOString().split('T')[0],
    calendar
  };
}

module.exports = {
  validateDateAndSchedule,
  checkServiceAvailability,
  getCalendarAvailability
};
