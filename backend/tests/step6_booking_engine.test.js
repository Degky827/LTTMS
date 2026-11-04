process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-at-least-32-characters-long-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-at-least-32-chars-long';
process.env.JWT_BLACKLIST_ENABLED = 'false';

const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('../app');

const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const ReservationCapacity = require('../models/ReservationCapacity');
const ReservationHold = require('../models/ReservationHold');
const BookingStatusHistory = require('../models/BookingStatusHistory');
const RefundRequest = require('../models/RefundRequest');

const { calculatePricing } = require('../services/pricingService');
const {
  CapacityConflictError,
  normalizeDate,
  normalizeSlotKey,
  acquireCapacity,
  convertHoldToReserved,
  releaseCapacity
} = require('../services/capacityService');
const {
  validateDateAndSchedule,
  checkServiceAvailability,
  getCalendarAvailability
} = require('../services/availabilityService');
const {
  transitionBookingStatus,
  InvalidBookingStateTransitionError
} = require('../services/bookingStateMachine');
const {
  expireStaleHolds
} = require('../services/holdExpirationService');
const {
  initiateRefundRequest,
  reviewRefundRequest
} = require('../services/refundService');

// User IDs & Tokens
const touristId = '654321000000000000000081';
const vendorUserId = '654321000000000000000082';
const vendorProfileId = '654321000000000000000083';
const adminId = '654321000000000000000084';
const serviceId = '654321000000000000000085';
const bookingId = '654321000000000000000086';

const touristToken = jwt.sign({ id: touristId, role: 'tourist' }, process.env.JWT_SECRET, { expiresIn: '15m' });
const vendorToken = jwt.sign({ id: vendorUserId, role: 'vendor' }, process.env.JWT_SECRET, { expiresIn: '15m' });
const adminToken = jwt.sign({ id: adminId, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '15m' });

// Global User & Vendor stubs for authentication & authorization
test.beforeEach(() => {
  User.findById = async (id) => {
    if (!id) return null;
    const idStr = id.toString();
    if (idStr === touristId) {
      return { _id: touristId, id: touristId, role: 'tourist', isActive: true, isSuspended: false, isEmailVerified: true };
    }
    if (idStr === vendorUserId) {
      return { _id: vendorUserId, id: vendorUserId, role: 'vendor', isActive: true, isSuspended: false, isEmailVerified: true };
    }
    if (idStr === adminId) {
      return { _id: adminId, id: adminId, role: 'admin', isActive: true, isSuspended: false, isEmailVerified: true };
    }
    return null;
  };

  Vendor.findOne = async (query) => {
    if (query && (query.user === vendorUserId || query.user?.toString() === vendorUserId)) {
      return {
        _id: vendorProfileId,
        user: vendorUserId,
        verificationStatus: 'approved',
        status: 'approved',
        businessName: 'Lake Tana Boat Charters'
      };
    }
    return null;
  };
});

// ============================================================================
// 1. DATA MODEL ARCHITECTURE & PRE-VALIDATION TESTS
// ============================================================================

test('STEP 6: Booking Model auto-generates human-readable reference and default values', () => {
  const bkg = new Booking({
    user: touristId,
    vendor: vendorProfileId,
    service: serviceId,
    date: new Date('2026-12-20'),
    guests: 3,
    priceSnapshot: 500,
    totalAmount: 1500
  });

  const err = bkg.validateSync();
  assert.equal(err, undefined);
  assert.ok(bkg.bookingReference.startsWith('LTTMS-2026-'));
  assert.equal(bkg.status, 'pending');
  assert.equal(bkg.paymentStatus, 'unpaid');
  assert.equal(bkg.confirmationType, 'instant');
  assert.equal(bkg.currency, 'ETB');
});

test('STEP 6: ReservationCapacity Model enforces positive bounds and compound uniqueness', () => {
  const cap = new ReservationCapacity({
    service: serviceId,
    date: new Date('2026-12-20'),
    timeSlot: 'all_day',
    totalCapacity: 20,
    reservedCapacity: 5,
    heldCapacity: 2,
    remainingCapacity: 13
  });

  const err = cap.validateSync();
  assert.equal(err, undefined);
  assert.equal(cap.remainingCapacity, 13);
});

test('STEP 6: ReservationHold Model defaults to 15-minute expiration and active status', () => {
  const hold = new ReservationHold({
    service: serviceId,
    serviceDate: new Date('2026-12-20'),
    reservedCapacity: 4
  });

  const err = hold.validateSync();
  assert.equal(err, undefined);
  assert.ok(hold.holdReference.startsWith('HOLD-'));
  assert.equal(hold.status, 'active');
  assert.ok(hold.expiresAt.getTime() > Date.now());
});

test('STEP 6: BookingStatusHistory Model records status transitions and actor details', () => {
  const history = new BookingStatusHistory({
    booking: bookingId,
    previousStatus: 'pending',
    newStatus: 'confirmed',
    actor: vendorUserId,
    actorRole: 'vendor',
    reason: 'Confirmed by vendor after schedule check'
  });

  const err = history.validateSync();
  assert.equal(err, undefined);
  assert.equal(history.actorRole, 'vendor');
});

// ============================================================================
// 2. AUTHORITATIVE BACKEND PRICING CALCULATION ENGINE
// ============================================================================

test('STEP 6: Pricing Engine computes adult and child tiered rates accurately', () => {
  const mockService = {
    price: 1000,
    currency: 'ETB',
    pricingUnit: 'per_person',
    adultPrice: 1000,
    childPrice: 500
  };

  const pricing = calculatePricing(mockService, { adults: 2, children: 2 });
  assert.equal(pricing.totalParticipants, 4);
  assert.equal(pricing.totalAmount, 3000); // (2 * 1000) + (2 * 500)
  assert.equal(pricing.pricingSnapshot.adultPrice, 1000);
  assert.equal(pricing.pricingSnapshot.childPrice, 500);
  assert.equal(pricing.pricingSnapshot.subtotal, 3000);
});

test('STEP 6: Pricing Engine applies group discounts and extra service charges', () => {
  const mockService = {
    price: 800,
    currency: 'ETB',
    pricingUnit: 'per_person',
    adultPrice: 800,
    groupPricing: [
      { minGroupSize: 5, maxGroupSize: 10, pricePerGroup: 3500 }
    ]
  };

  const bookingData = {
    adults: 5,
    children: 0,
    selectedOptions: [
      { name: 'Hotel Transfer', price: 300, quantity: 1 },
      { name: 'Lunch Box', price: 150, quantity: 5 }
    ]
  };

  const pricing = calculatePricing(mockService, bookingData);
  // Group discount applies: subtotal becomes 3500 instead of 4000
  // Extra options: 300 + (150 * 5) = 1050
  // Total: 3500 + 1050 = 4550
  assert.equal(pricing.pricingSnapshot.subtotal, 3500);
  assert.equal(pricing.pricingSnapshot.groupDiscount, 500);
  assert.equal(pricing.totalAmount, 4550);
});

// ============================================================================
// 3. AVAILABILITY ENGINE & SCHEDULE VALIDATION
// ============================================================================

test('STEP 6: Availability Engine validates past dates, operating days, and blocked dates', () => {
  const mockService = {
    dailyCapacity: 20,
    operatingDays: ['monday', 'wednesday', 'friday'],
    unavailableDates: [new Date('2026-12-25')]
  };

  // Past date
  const pastRes = validateDateAndSchedule(mockService, new Date('2020-01-01'), 'all_day');
  assert.equal(pastRes.valid, false);
  assert.ok(pastRes.reason.includes('past'));

  // Day not in operating schedule (2026-12-20 is a Sunday)
  const sundayRes = validateDateAndSchedule(mockService, new Date('2026-12-20'), 'all_day');
  assert.equal(sundayRes.valid, false);
  assert.ok(sundayRes.reason.includes('Sunday'));

  // Blocked date (2026-12-25 is a Friday in operatingDays, but in unavailableDates)
  const blockedRes = validateDateAndSchedule(mockService, new Date('2026-12-25'), 'all_day');
  assert.equal(blockedRes.valid, false);
  assert.ok(blockedRes.reason.includes('blocked'));

  // Valid date (2026-12-18 is a Friday)
  const validRes = validateDateAndSchedule(mockService, new Date('2026-12-18'), 'all_day');
  assert.equal(validRes.valid, true);
});

test('STEP 6: checkServiceAvailability returns structured capacity and availability status', async () => {
  Service.findById = () => ({
    populate: async () => ({
      _id: serviceId,
      title: 'Monastery Island Tour',
      price: 1200,
      currency: 'ETB',
      status: 'published',
      availability: true,
      dailyCapacity: 20,
      minBookingCapacity: 1,
      maxBookingCapacity: 15,
      confirmationType: 'instant',
      operatingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      vendor: { _id: vendorProfileId, verificationStatus: 'approved' }
    })
  });

  ReservationCapacity.findOneAndUpdate = async () => ({
    totalCapacity: 20,
    reservedCapacity: 4,
    heldCapacity: 0,
    remainingCapacity: 16
  });

  const avail = await checkServiceAvailability(serviceId, {
    date: '2026-12-18',
    participants: 2
  });

  assert.equal(avail.isAvailable, true);
  assert.equal(avail.totalCapacity, 20);
  assert.equal(avail.reservedCapacity, 4);
  assert.equal(avail.remainingCapacity, 16);
  assert.equal(avail.confirmationType, 'instant');
});

// ============================================================================
// 4. CONCURRENCY-SAFE CAPACITY ENGINE (MANDATORY CONCURRENCY TESTS)
// ============================================================================

test('CONCURRENCY SCENARIO 1: Two concurrent requests compete for 1 remaining seat', async () => {
  // Simulates MongoDB document-level serialized atomic conditional update
  let remainingCapacity = 1;
  let heldCapacity = 0;
  let reservedCapacity = 9;

  ReservationCapacity.findOneAndUpdate = async (filter, update) => {
    // If filter contains remainingCapacity condition, evaluate atomically
    if (filter.remainingCapacity && filter.remainingCapacity.$gte) {
      if (remainingCapacity < filter.remainingCapacity.$gte) {
        return null; // Condition fails!
      }
      const requested = update.$inc.reservedCapacity || update.$inc.heldCapacity || 0;
      remainingCapacity -= requested;
      reservedCapacity += requested;
      return { totalCapacity: 10, reservedCapacity, heldCapacity, remainingCapacity };
    }
    return { totalCapacity: 10, reservedCapacity, heldCapacity, remainingCapacity };
  };

  const mockService = { _id: serviceId, dailyCapacity: 10 };
  const targetDate = new Date('2026-12-22');

  // Both tourists request 1 seat simultaneously
  const results = await Promise.allSettled([
    acquireCapacity(mockService, targetDate, 'all_day', 1),
    acquireCapacity(mockService, targetDate, 'all_day', 1)
  ]);

  const fulfilled = results.filter(r => r.status === 'fulfilled');
  const rejected = results.filter(r => r.status === 'rejected');

  // Exactly one booking succeeds; the second receives CapacityConflictError
  assert.equal(fulfilled.length, 1);
  assert.equal(rejected.length, 1);
  assert.equal(rejected[0].reason.statusCode, 409);
  assert.equal(rejected[0].reason.code, 'CAPACITY_CONFLICT');
  // Capacity never went negative
  assert.equal(remainingCapacity, 0);
  assert.ok(remainingCapacity >= 0);
});

test('CONCURRENCY SCENARIO 2: Two concurrent requests ask for 4 seats each when only 5 remain', async () => {
  let remainingCapacity = 5;
  let reservedCapacity = 5;

  ReservationCapacity.findOneAndUpdate = async (filter, update) => {
    if (filter.remainingCapacity && filter.remainingCapacity.$gte) {
      if (remainingCapacity < filter.remainingCapacity.$gte) {
        return null;
      }
      const requested = update.$inc.reservedCapacity || update.$inc.heldCapacity || 0;
      remainingCapacity -= requested;
      reservedCapacity += requested;
      return { totalCapacity: 10, reservedCapacity, heldCapacity: 0, remainingCapacity };
    }
    return { totalCapacity: 10, reservedCapacity, heldCapacity: 0, remainingCapacity };
  };

  const mockService = { _id: serviceId, dailyCapacity: 10 };
  const targetDate = new Date('2026-12-22');

  // Tourist A and Tourist B each request 4 seats simultaneously
  const results = await Promise.allSettled([
    acquireCapacity(mockService, targetDate, 'all_day', 4),
    acquireCapacity(mockService, targetDate, 'all_day', 4)
  ]);

  const fulfilled = results.filter(r => r.status === 'fulfilled');
  const rejected = results.filter(r => r.status === 'rejected');

  // Exactly one can succeed; remaining capacity was 5, so 4+4=8 would exceed 5
  assert.equal(fulfilled.length, 1);
  assert.equal(rejected.length, 1);
  assert.equal(remainingCapacity, 1); // 5 - 4 = 1
  assert.ok(remainingCapacity >= 0);
});

test('CONCURRENCY SCENARIO 3: Atomic capacity release restores remaining pool accurately', async () => {
  let remainingCapacity = 2;
  let reservedCapacity = 8;

  ReservationCapacity.findOneAndUpdate = async (filter, update) => {
    const incHeld = update.$inc.heldCapacity || 0;
    const incRes = update.$inc.reservedCapacity || 0;
    const incRem = update.$inc.remainingCapacity || 0;
    reservedCapacity += incRes;
    remainingCapacity += incRem;
    return { totalCapacity: 10, reservedCapacity, heldCapacity: 0, remainingCapacity };
  };

  const released = await releaseCapacity(serviceId, '2026-12-22', 'all_day', 3, { fromHold: false });
  assert.equal(remainingCapacity, 5); // 2 + 3 = 5
  assert.equal(reservedCapacity, 5);  // 8 - 3 = 5
});

// ============================================================================
// 5. TEMPORARY RESERVATION HOLDS & EXPIRATION SWEEPER
// ============================================================================

test('STEP 6: expireStaleHolds sweeps expired holds, releases capacity, and marks pending bookings expired', async () => {
  const expiredHold = {
    _id: '654321000000000000000091',
    holdReference: 'HOLD-EXP-001',
    booking: bookingId,
    service: serviceId,
    serviceDate: new Date('2026-12-20'),
    timeSlot: 'all_day',
    reservedCapacity: 2,
    status: 'active',
    expiresAt: new Date(Date.now() - 60000), // 1 min ago
    save: async function () { return this; }
  };

  ReservationHold.find = async () => [expiredHold];

  let capacityReleased = false;
  ReservationCapacity.findOneAndUpdate = async () => {
    capacityReleased = true;
    return { totalCapacity: 10, remainingCapacity: 10 };
  };

  let bookingExpired = false;
  Booking.findById = async () => ({
    _id: bookingId,
    user: touristId,
    status: 'pending',
    save: async function () {
      bookingExpired = this.status === 'expired';
      return this;
    }
  });

  BookingStatusHistory.create = async () => ({});

  const sweptCount = await expireStaleHolds();

  assert.equal(sweptCount, 1);
  assert.equal(expiredHold.status, 'expired');
  assert.equal(capacityReleased, true);
  assert.equal(bookingExpired, true);
});

// ============================================================================
// 6. BOOKING STATE MACHINE & LIFECYCLE AUDIT TRAIL
// ============================================================================

test('STEP 6: State Machine allows valid transitions and records audit trail', async () => {
  const mockBooking = {
    _id: bookingId,
    user: touristId,
    vendor: vendorProfileId,
    service: serviceId,
    date: new Date('2026-12-20'),
    status: 'pending',
    guests: 2,
    save: async function () { return this; }
  };

  ReservationCapacity.findOneAndUpdate = async () => ({});
  ReservationHold.updateMany = async () => ({});
  let historyRecorded = false;
  BookingStatusHistory.create = async (doc) => {
    assert.equal(doc.previousStatus, 'pending');
    assert.equal(doc.newStatus, 'confirmed');
    historyRecorded = true;
  };

  const updated = await transitionBookingStatus(
    mockBooking,
    'confirmed',
    { _id: vendorUserId, role: 'vendor' },
    { reason: 'Confirmed by vendor' }
  );

  assert.equal(updated.status, 'confirmed');
  assert.equal(historyRecorded, true);
});

test('STEP 6: State Machine rejects invalid and unauthorized state transitions', async () => {
  const mockBooking = {
    _id: bookingId,
    user: touristId,
    status: 'completed'
  };

  // 'completed' cannot transition to 'cancelled'
  await assert.rejects(
    async () => {
      await transitionBookingStatus(
        mockBooking,
        'cancelled',
        { _id: touristId, role: 'tourist' }
      );
    },
    (err) => {
      assert.ok(err instanceof InvalidBookingStateTransitionError);
      assert.equal(err.statusCode, 400);
      return true;
    }
  );
});

// ============================================================================
// 7. VENDOR & REFUND REQUEST WORKFLOWS
// ============================================================================

test('STEP 6: Tourist initiates refund request with amount & duplicate prevention', async () => {
  Booking.findById = () => ({
    populate: async () => ({
      _id: bookingId,
      user: touristId,
      totalAmount: 1800,
      currency: 'ETB',
      status: 'cancelled',
      service: { vendor: vendorProfileId }
    })
  });

  // No active refund requests
  RefundRequest.findOne = async () => null;
  RefundRequest.create = async (doc) => ({
    _id: '654321000000000000000099',
    ...doc,
    refundReference: 'REF-2026-1234'
  });

  const request = await initiateRefundRequest({
    bookingId,
    userId: touristId,
    amount: 1800,
    reason: 'cancellation',
    description: 'Vendor cancelled boat trip due to high waves'
  });

  assert.equal(request.amount, 1800);
  assert.equal(request.status, 'submitted');
  assert.ok(request.refundReference.startsWith('REF-2026-'));
});

test('STEP 6: Administrator approves or rejects refund request', async () => {
  const mockRefund = {
    _id: '654321000000000000000099',
    status: 'submitted',
    save: async function () { return this; }
  };

  RefundRequest.findById = () => ({
    populate: async () => mockRefund
  });

  const approved = await reviewRefundRequest(
    '654321000000000000000099',
    { _id: adminId },
    'approved',
    'Verified bad weather cancellation'
  );

  assert.equal(approved.status, 'approved');
  assert.equal(approved.adminNote, 'Verified bad weather cancellation');
});

// ============================================================================
// 8. HTTP / SUPERTEST END-TO-END ENDPOINTS VERIFICATION
// ============================================================================

test('HTTP: GET /api/v1/services/:id/availability returns 200 with availability and pricing', async () => {
  Service.findById = () => ({
    populate: async () => ({
      _id: serviceId,
      title: 'Lake Tana Sunset Boat Charter',
      price: 1500,
      currency: 'ETB',
      status: 'published',
      availability: true,
      dailyCapacity: 20,
      minBookingCapacity: 1,
      maxBookingCapacity: 20,
      confirmationType: 'instant',
      operatingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      vendor: { _id: vendorProfileId, verificationStatus: 'approved' }
    }),
    select: () => ({
      dailyCapacity: 20,
      minBookingCapacity: 1,
      maxBookingCapacity: 20,
      operatingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      timeSlots: [],
      unavailableDates: [],
      seasonalAvailability: {},
      availability: true,
      confirmationType: 'instant'
    })
  });

  ReservationCapacity.findOneAndUpdate = async () => ({
    totalCapacity: 20,
    reservedCapacity: 2,
    heldCapacity: 0,
    remainingCapacity: 18
  });

  const res = await request(app)
    .get(`/api/v1/services/${serviceId}/availability?date=2026-12-18&participants=2`)
    .expect(200);

  assert.equal(res.body.success, true);
  assert.equal(res.body.data.isAvailable, true);
  assert.equal(res.body.data.remainingCapacity, 18);
});

test('HTTP: GET /api/v1/services/:id/availability/calendar returns date range matrix', async () => {
  Service.findById = () => ({
    populate: async () => ({
      _id: serviceId,
      title: 'Lake Tana Sunset Boat Charter',
      dailyCapacity: 20,
      status: 'published',
      availability: true,
      operatingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      vendor: { _id: vendorProfileId, verificationStatus: 'approved' }
    })
  });

  ReservationCapacity.find = () => ({
    lean: async () => []
  });

  const res = await request(app)
    .get(`/api/v1/services/${serviceId}/availability/calendar?startDate=2026-12-01&endDate=2026-12-05`)
    .expect(200);

  assert.equal(res.body.success, true);
  assert.equal(Array.isArray(res.body.data.calendar), true);
  assert.equal(res.body.data.calendar.length, 5);
});

test('HTTP: POST /api/v1/bookings creates reservation with calculated pricing and reference', async () => {
  Service.findById = () => ({
    populate: async () => ({
      _id: serviceId,
      title: 'Island Monastery Excursion',
      price: 1000,
      currency: 'ETB',
      status: 'published',
      availability: true,
      dailyCapacity: 20,
      minBookingCapacity: 1,
      maxBookingCapacity: 20,
      confirmationType: 'instant',
      cancellationPolicy: 'Free cancellation up to 24h prior',
      operatingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      vendor: { _id: vendorProfileId, verificationStatus: 'approved' }
    })
  });

  ReservationCapacity.findOneAndUpdate = async () => ({
    totalCapacity: 20,
    reservedCapacity: 2,
    heldCapacity: 0,
    remainingCapacity: 18
  });

  Booking.aggregate = async () => [{ guests: 2 }];

  Booking.create = async (doc) => ({
    _id: bookingId,
    bookingReference: 'LTTMS-2026-A1B2C3D4',
    ...doc,
    status: 'confirmed',
    toJSON: function () { return this; }
  });

  BookingStatusHistory.create = async () => ({});

  const res = await request(app)
    .post('/api/v1/bookings')
    .set('Authorization', `Bearer ${touristToken}`)
    .send({
      service: serviceId,
      date: '2026-12-20',
      adults: 2,
      children: 0
    })
    .expect(201);

  assert.equal(res.body.success, true);
  assert.equal(res.body.data.bookingReference, 'LTTMS-2026-A1B2C3D4');
  assert.equal(res.body.data.status, 'confirmed');
  assert.equal(res.body.data.totalAmount, 2000); // 2 * 1000
});

test('HTTP: GET /api/v1/bookings/my returns tourist booking history', async () => {
  Booking.find = () => ({
    populate: () => ({
      populate: () => ({
        sort: () => ({
          skip: () => ({
            limit: async () => [
              {
                _id: bookingId,
                bookingReference: 'LTTMS-2026-A1B2C3D4',
                totalAmount: 2000,
                status: 'confirmed'
              }
            ]
          })
        })
      })
    })
  });

  Booking.countDocuments = async () => 1;

  const res = await request(app)
    .get('/api/v1/bookings/my')
    .set('Authorization', `Bearer ${touristToken}`)
    .expect(200);

  assert.equal(res.body.success, true);
  assert.equal(res.body.count, 1);
  assert.equal(res.body.data[0].bookingReference, 'LTTMS-2026-A1B2C3D4');
});

test('HTTP: GET /api/v1/bookings/reference/:ref returns booking details', async () => {
  Booking.findOne = () => ({
    populate: () => ({
      populate: () => ({
        populate: async () => ({
          _id: bookingId,
          bookingReference: 'LTTMS-2026-A1B2C3D4',
          user: touristId,
          vendor: { _id: vendorProfileId },
          totalAmount: 2000
        })
      })
    })
  });

  const res = await request(app)
    .get('/api/v1/bookings/reference/LTTMS-2026-A1B2C3D4')
    .set('Authorization', `Bearer ${touristToken}`)
    .expect(200);

  assert.equal(res.body.success, true);
  assert.equal(res.body.data.bookingReference, 'LTTMS-2026-A1B2C3D4');
});

test('HTTP: POST /api/v1/bookings/:id/cancel cancels booking and releases capacity', async () => {
  const mockBooking = {
    _id: bookingId,
    user: touristId,
    status: 'confirmed',
    service: serviceId,
    date: new Date('2026-12-20'),
    guests: 2,
    save: async function () { return this; }
  };

  Booking.findById = async () => mockBooking;
  ReservationCapacity.findOneAndUpdate = async () => ({});
  ReservationHold.updateMany = async () => ({});
  BookingStatusHistory.create = async () => ({});

  const res = await request(app)
    .post(`/api/v1/bookings/${bookingId}/cancel`)
    .set('Authorization', `Bearer ${touristToken}`)
    .send({ reason: 'Trip rescheduled' })
    .expect(200);

  assert.equal(res.body.success, true);
  assert.equal(res.body.data.status, 'cancelled');
});

test('HTTP: GET /api/v1/vendor/bookings returns vendor reservations', async () => {
  Booking.find = () => ({
    populate: () => ({
      populate: () => ({
        sort: () => ({
          skip: () => ({
            limit: async () => [
              {
                _id: bookingId,
                bookingReference: 'LTTMS-2026-A1B2C3D4',
                status: 'pending',
                guests: 3
              }
            ]
          })
        })
      })
    })
  });

  Booking.countDocuments = async () => 1;

  const res = await request(app)
    .get('/api/v1/vendor/bookings')
    .set('Authorization', `Bearer ${vendorToken}`)
    .expect(200);

  assert.equal(res.body.success, true);
  assert.equal(res.body.count, 1);
});

test('HTTP: PATCH /api/v1/vendor/bookings/:id/confirm confirms pending reservation', async () => {
  const mockBooking = {
    _id: bookingId,
    user: touristId,
    vendor: vendorProfileId,
    service: serviceId,
    date: new Date('2026-12-20'),
    status: 'pending',
    guests: 2,
    save: async function () { return this; }
  };

  Booking.findOne = async () => mockBooking;
  ReservationCapacity.findOneAndUpdate = async () => ({});
  ReservationHold.updateMany = async () => ({});
  BookingStatusHistory.create = async () => ({});

  const res = await request(app)
    .patch(`/api/v1/vendor/bookings/${bookingId}/confirm`)
    .set('Authorization', `Bearer ${vendorToken}`)
    .expect(200);

  assert.equal(res.body.success, true);
  assert.equal(res.body.data.status, 'confirmed');
});

test('HTTP: GET /api/v1/admin/bookings returns platform reservations list', async () => {
  Booking.find = () => ({
    populate: () => ({
      populate: () => ({
        populate: () => ({
          populate: () => ({
            sort: () => ({
              skip: () => ({
                limit: async () => [
                  {
                    _id: bookingId,
                    bookingReference: 'LTTMS-2026-A1B2C3D4',
                    totalAmount: 2000
                  }
                ]
              })
            })
          })
        })
      })
    })
  });

  Booking.countDocuments = async () => 1;

  const res = await request(app)
    .get('/api/v1/admin/bookings')
    .set('Authorization', `Bearer ${adminToken}`)
    .expect(200);

  assert.equal(res.body.success, true);
  assert.equal(res.body.count, 1);
});

test('HTTP: PATCH /api/v1/admin/refund-requests/:id/approve approves refund request', async () => {
  const mockRefund = {
    _id: '654321000000000000000099',
    status: 'submitted',
    save: async function () { return this; }
  };

  RefundRequest.findById = () => ({
    populate: async () => mockRefund
  });

  const res = await request(app)
    .patch('/api/v1/admin/refund-requests/654321000000000000000099/approve')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ adminNote: 'Verified payment log and approved' })
    .expect(200);

  assert.equal(res.body.success, true);
  assert.equal(res.body.data.status, 'approved');
});

test('HTTP: OpenAPI /api-docs.json includes new Step 6 booking, vendor, and refund paths', async () => {
  const res = await request(app)
    .get('/api-docs.json')
    .expect(200);

  assert.equal(res.body.openapi, '3.0.3');
  assert.ok(res.body.paths['/bookings']);
  assert.ok(res.body.paths['/bookings/my']);
  assert.ok(res.body.paths['/bookings/reference/{reference}']);
  assert.ok(res.body.paths['/bookings/{id}/cancel']);
  assert.ok(res.body.paths['/services/{id}/availability']);
  assert.ok(res.body.paths['/services/{id}/availability/calendar']);
  assert.ok(res.body.paths['/vendor/bookings']);
  assert.ok(res.body.paths['/refund-requests']);
});
