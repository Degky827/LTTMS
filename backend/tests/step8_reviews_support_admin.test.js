process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-at-least-32-characters-long-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-at-least-32-chars-long';
process.env.JWT_BLACKLIST_ENABLED = 'false';

const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const mongoose = require('mongoose');

const app = require('../app');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const SupportTicket = require('../models/SupportTicket');
const RefundRequest = require('../models/RefundRequest');
const Payment = require('../models/Payment');
const CommissionTransaction = require('../models/CommissionTransaction');
const Settlement = require('../models/Settlement');
const AuditLog = require('../models/AuditLog');

const reviewService = require('../services/reviewService');
const notificationService = require('../services/notificationService');
const { convertToCSV } = require('../utils/csvExportUtil');

// User IDs & Roles
const touristId = '654321000000000000000101';
const otherTouristId = '654321000000000000000102';
const vendorUserId = '654321000000000000000103';
const otherVendorUserId = '654321000000000000000104';
const vendorProfileId = '654321000000000000000105';
const otherVendorProfileId = '654321000000000000000106';
const adminId = '654321000000000000000107';
const supportId = '654321000000000000000108';

const serviceId = '654321000000000000000109';
const otherServiceId = '654321000000000000000110';
const bookingId = '654321000000000000000111';
const reviewId = '654321000000000000000112';
const ticketId = '654321000000000000000113';
const notificationId = '654321000000000000000114';
const refundId = '654321000000000000000115';

// JWT Tokens
const touristToken = jwt.sign({ id: touristId, role: 'tourist' }, process.env.JWT_SECRET, { expiresIn: '15m' });
const otherTouristToken = jwt.sign({ id: otherTouristId, role: 'tourist' }, process.env.JWT_SECRET, { expiresIn: '15m' });
const vendorToken = jwt.sign({ id: vendorUserId, role: 'vendor', vendorId: vendorProfileId }, process.env.JWT_SECRET, { expiresIn: '15m' });
const otherVendorToken = jwt.sign({ id: otherVendorUserId, role: 'vendor', vendorId: otherVendorProfileId }, process.env.JWT_SECRET, { expiresIn: '15m' });
const adminToken = jwt.sign({ id: adminId, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '15m' });
const supportToken = jwt.sign({ id: supportId, role: 'support' }, process.env.JWT_SECRET, { expiresIn: '15m' });

// Global stub for User.findById authentication middleware
test.beforeEach(() => {
  User.findById = async (id) => {
    if (!id) return null;
    const idStr = id.toString();
    if (idStr === touristId) {
      return { _id: touristId, id: touristId, name: 'Abebe Tourist', email: 'tourist@example.com', role: 'tourist', isActive: true, isSuspended: false, isEmailVerified: true };
    }
    if (idStr === otherTouristId) {
      return { _id: otherTouristId, id: otherTouristId, name: 'Almaz Tourist', email: 'almaz@example.com', role: 'tourist', isActive: true, isSuspended: false, isEmailVerified: true };
    }
    if (idStr === vendorUserId) {
      return { _id: vendorUserId, id: vendorUserId, name: 'Tana Boats', email: 'vendor@example.com', role: 'vendor', vendorId: vendorProfileId, isActive: true, isSuspended: false, isEmailVerified: true };
    }
    if (idStr === otherVendorUserId) {
      return { _id: otherVendorUserId, id: otherVendorUserId, name: 'Other Vendor', email: 'other_vendor@example.com', role: 'vendor', vendorId: otherVendorProfileId, isActive: true, isSuspended: false, isEmailVerified: true };
    }
    if (idStr === adminId) {
      return { _id: adminId, id: adminId, name: 'Admin Manager', email: 'admin@laketana.gov.et', role: 'admin', isActive: true, isSuspended: false, isEmailVerified: true };
    }
    if (idStr === supportId) {
      return { _id: supportId, id: supportId, name: 'Support Staff', email: 'support@laketana.gov.et', role: 'support', isActive: true, isSuspended: false, isEmailVerified: true };
    }
    return null;
  };

  Vendor.findOne = async (query) => {
    if (query?.user === vendorUserId || query?.user?.toString() === vendorUserId) {
      return { _id: vendorProfileId, user: vendorUserId, businessName: 'Lake Tana Boat Tours', status: 'approved' };
    }
    if (query?.user === otherVendorUserId || query?.user?.toString() === otherVendorUserId) {
      return { _id: otherVendorProfileId, user: otherVendorUserId, businessName: 'Zege Peninsula Eco Lodge', status: 'approved' };
    }
    return null;
  };
});

// ============================================================================
// PART A: REVIEWS & RATINGS ENGINE
// ============================================================================

test('STEP 8: reviewService.validateBookingEligibility succeeds for valid confirmed tourist booking', async () => {
  Booking.findById = async (id) => {
    if (id.toString() === bookingId) {
      return {
        _id: bookingId,
        user: touristId,
        service: serviceId,
        status: 'confirmed'
      };
    }
    return null;
  };

  Review.findOne = async () => null;

  const result = await reviewService.validateBookingEligibility({
    userId: touristId,
    serviceId: serviceId,
    bookingId: bookingId
  });

  assert.equal(result.isVerified, true);
  assert.equal(result.booking._id, bookingId);
});

test('STEP 8: reviewService.validateBookingEligibility blocks booking belonging to another user', async () => {
  Booking.findById = async () => ({
    _id: bookingId,
    user: otherTouristId,
    service: serviceId,
    status: 'confirmed'
  });

  Review.findOne = async () => null;

  await assert.rejects(
    async () => {
      await reviewService.validateBookingEligibility({
        userId: touristId,
        serviceId: serviceId,
        bookingId: bookingId
      });
    },
    (err) => {
      assert.equal(err.statusCode, 403);
      assert.ok(err.message.includes('only submit reviews for your own bookings'));
      return true;
    }
  );
});

test('STEP 8: reviewService.validateBookingEligibility blocks mismatched service or ineligible status', async () => {
  Booking.findById = async () => ({
    _id: bookingId,
    user: touristId,
    service: otherServiceId,
    status: 'pending'
  });

  await assert.rejects(
    async () => {
      await reviewService.validateBookingEligibility({
        userId: touristId,
        serviceId: serviceId,
        bookingId: bookingId
      });
    },
    (err) => {
      assert.equal(err.statusCode, 400);
      return true;
    }
  );
});

test('STEP 8: reviewService.createReview blocks duplicate review by same user for same service', async () => {
  Service.findById = async () => ({ _id: serviceId, vendor: vendorProfileId });
  Review.findOne = async () => ({ _id: reviewId, user: touristId, service: serviceId });

  await assert.rejects(
    async () => {
      await reviewService.createReview({
        userId: touristId,
        serviceId,
        rating: 5,
        comment: 'Already reviewed'
      });
    },
    (err) => {
      assert.equal(err.statusCode, 400);
      assert.ok(err.message.includes('already submitted a review'));
      return true;
    }
  );
});

test('STEP 8: reviewService.recalculateServiceRating accurately calculates average and count', async () => {
  let updatedData = null;
  Review.aggregate = async () => [
    { _id: serviceId, avgRating: 4.8, count: 12 }
  ];
  Service.findByIdAndUpdate = async (id, data) => {
    updatedData = data;
    return data;
  };

  const result = await reviewService.recalculateServiceRating(serviceId);
  assert.equal(result.rating, 4.8);
  assert.equal(result.count, 12);
  assert.equal(updatedData.rating, 4.8);
  assert.equal(updatedData.reviewCount, 12);
});

test('STEP 8: reviewService.reportReview tracks reports and auto-flags on threshold (3 reports)', async () => {
  let saved = false;
  const dummyReview = {
    _id: reviewId,
    reports: [
      { user: 'user1', reason: 'spam' },
      { user: 'user2', reason: 'harassment' }
    ],
    reportedCount: 2,
    flagged: false,
    save: async function () { saved = true; return this; }
  };

  Review.findById = async () => dummyReview;

  const result = await reviewService.reportReview({
    reviewId,
    userId: touristId,
    reason: 'fake_review',
    description: 'Not a real customer'
  });

  assert.equal(saved, true);
  assert.equal(result.reportedCount, 3);
  assert.equal(result.flagged, true);
  assert.equal(result.status, 'flagged');
});

test('STEP 8: reviewService.addVendorResponse allows service owner and blocks unauthorized vendor', async () => {
  const dummyReview = {
    _id: reviewId,
    vendor: vendorProfileId,
    service: { vendor: vendorProfileId },
    save: async function () { return this; }
  };

  Review.findById = () => ({
    populate: () => Promise.resolve(dummyReview)
  });

  // Authorized vendor
  const authorized = await reviewService.addVendorResponse({
    reviewId,
    vendorUserId,
    response: 'Thank you for exploring Lake Tana with us!'
  });
  assert.equal(authorized.vendorResponse.response, 'Thank you for exploring Lake Tana with us!');

  // Unauthorized other vendor
  await assert.rejects(
    async () => {
      await reviewService.addVendorResponse({
        reviewId,
        vendorUserId: otherVendorUserId,
        response: 'Imposter response'
      });
    },
    (err) => {
      assert.equal(err.statusCode, 403);
      return true;
    }
  );
});

// ============================================================================
// PART B: HTTP REVIEWS ENDPOINTS
// ============================================================================

test('STEP 8 HTTP: POST /api/v1/reviews creates verified review and updates ratings', async () => {
  Service.findById = async () => ({ _id: serviceId, vendor: vendorProfileId, title: 'Ura Kidane Mehret Boat Tour' });
  Booking.findById = async () => ({ _id: bookingId, user: touristId, service: serviceId, status: 'completed' });
  Review.findOne = async () => null;

  Review.create = async (doc) => ({
    ...doc,
    _id: reviewId,
    createdAt: new Date()
  });

  Review.aggregate = async () => [{ _id: serviceId, avgRating: 5.0, count: 1 }];
  Service.findByIdAndUpdate = async () => ({});

  const res = await request(app)
    .post('/api/v1/reviews')
    .set('Authorization', `Bearer ${touristToken}`)
    .send({
      service: serviceId,
      booking: bookingId,
      rating: 5,
      title: 'Amazing spiritual monastery tour',
      comment: 'The boat was pristine and the guide explained the 14th century murals in deep detail.',
      categories: {
        cleanliness: 5,
        ecoFriendly: 5,
        hospitality: 5,
        value: 5
      }
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.isVerifiedBooking, true);
});

test('STEP 8 HTTP: GET /api/v1/reviews/service/:serviceId retrieves approved reviews and ratingStats', async () => {
  Review.find = () => ({
    populate: () => ({
      sort: () => ({
        skip: () => ({
          limit: () => Promise.resolve([
            { _id: reviewId, rating: 5, comment: 'Exceptional trip', status: 'approved' }
          ])
        })
      })
    })
  });
  Review.countDocuments = async () => 1;
  Review.aggregate = async () => [{ _id: 5, count: 1 }];

  const res = await request(app)
    .get(`/api/v1/reviews/service/${serviceId}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.total, 1);
  assert.equal(res.body.data[0].rating, 5);
});

test('STEP 8 HTTP: PATCH /api/v1/admin/reviews/:reviewId/moderate allows admin moderation', async () => {
  Review.findById = async () => ({
    _id: reviewId,
    service: serviceId,
    status: 'approved',
    save: async function () { return this; }
  });
  Review.aggregate = async () => [];
  Service.findByIdAndUpdate = async () => ({});

  const res = await request(app)
    .patch(`/api/v1/admin/reviews/${reviewId}/moderate`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      action: 'hide',
      reason: 'Contains disputed commercial claims'
    });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.status, 'hidden');
});

// ============================================================================
// PART C: NOTIFICATIONS & REAL-TIME DISPATCH
// ============================================================================

test('STEP 8: notificationService.createNotification dispatches notification and updates unread count', async () => {
  let createdDoc = null;
  Notification.create = async (doc) => {
    createdDoc = { ...doc, _id: notificationId, createdAt: new Date() };
    return createdDoc;
  };

  const notification = await notificationService.createNotification({
    recipient: touristId,
    type: 'booking_confirmed',
    title: 'Booking Confirmed',
    message: 'Your monastery tour has been confirmed by Tana Boats',
    actionUrl: `/bookings/${bookingId}`
  });

  assert.equal(notification.recipient, touristId);
  assert.equal(notification.type, 'booking_confirmed');
  assert.equal(notification.actionUrl, `/bookings/${bookingId}`);
});

test('STEP 8 HTTP: GET /api/v1/notifications retrieves user notifications and unread-count', async () => {
  Notification.find = () => ({
    sort: () => ({
      skip: () => ({
        limit: () => Promise.resolve([
          { _id: notificationId, recipient: touristId, title: 'Booking Confirmed', isRead: false }
        ])
      })
    })
  });
  Notification.countDocuments = async (query) => {
    if (query?.isRead === false) return 1;
    return 1;
  };

  const resList = await request(app)
    .get('/api/v1/notifications')
    .set('Authorization', `Bearer ${touristToken}`);

  assert.equal(resList.status, 200);
  assert.equal(resList.body.success, true);
  assert.equal(resList.body.data.length, 1);
  assert.equal(resList.body.meta.unreadCount, 1);

  const resUnread = await request(app)
    .get('/api/v1/notifications/unread-count')
    .set('Authorization', `Bearer ${touristToken}`);

  assert.equal(resUnread.status, 200);
  assert.equal(resUnread.body.unreadCount, 1);
});

test('STEP 8 HTTP: PATCH /api/v1/notifications/:id/read and PATCH /read-all update read status', async () => {
  const dummyNotif = {
    _id: notificationId,
    recipient: touristId,
    isRead: false,
    save: async function () { this.isRead = true; return this; }
  };
  Notification.findOne = async () => dummyNotif;
  Notification.updateMany = async () => ({ modifiedCount: 3 });

  const resSingle = await request(app)
    .patch(`/api/v1/notifications/${notificationId}/read`)
    .set('Authorization', `Bearer ${touristToken}`);

  assert.equal(resSingle.status, 200);
  assert.equal(resSingle.body.success, true);
  assert.equal(resSingle.body.data.isRead, true);

  const resAll = await request(app)
    .patch('/api/v1/notifications/read-all')
    .set('Authorization', `Bearer ${touristToken}`);

  assert.equal(resAll.status, 200);
  assert.equal(resAll.body.modifiedCount, 3);
});

// ============================================================================
// PART D: SUPPORT TICKETS & STRICT PRIVACY ISOLATION
// ============================================================================

test('STEP 8 HTTP: POST /api/v1/support/tickets creates ticket with unique TIK- number', async () => {
  SupportTicket.create = async (doc) => ({
    ...doc,
    _id: ticketId,
    createdAt: new Date()
  });

  const res = await request(app)
    .post('/api/v1/support/tickets')
    .set('Authorization', `Bearer ${touristToken}`)
    .send({
      subject: 'Inquiry regarding private monastery cruise',
      description: 'Can we arrange a stop at Debre Maryam island on our way to Ura Kidane Mehret?',
      category: 'booking',
      priority: 'medium'
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.ok(res.body.data.ticketNumber.startsWith('TIK-'));
  assert.equal(res.body.data.status, 'open');
});

test('STEP 8 HTTP PRIVACY: Tourist viewing ticket detail NEVER sees internal staff notes', async () => {
  const dummyTicket = {
    _id: ticketId,
    ticketNumber: 'TIK-2026-TEST01',
    user: touristId,
    subject: 'Booking rescheduling inquiry',
    status: 'in_progress',
    messages: [
      { sender: touristId, senderRole: 'tourist', message: 'Hello, can I reschedule?', visibility: 'public' },
      { sender: adminId, senderRole: 'admin', message: 'Internal Note: Vendor boat engine undergoing maintenance, verify spare capacity first.', visibility: 'internal' },
      { sender: adminId, senderRole: 'admin', message: 'Yes, rescheduling is possible for tomorrow 10am.', visibility: 'public' }
    ],
    toObject: function () {
      return {
        _id: this._id,
        ticketNumber: this.ticketNumber,
        user: this.user,
        subject: this.subject,
        status: this.status,
        messages: [...this.messages]
      };
    }
  };

  SupportTicket.findOne = () => ({
    populate: () => ({
      populate: () => ({
        populate: () => ({
          populate: () => Promise.resolve(dummyTicket)
        })
      })
    })
  });

  // 1. Tourist requests ticket detail
  const resTourist = await request(app)
    .get(`/api/v1/support/tickets/${ticketId}`)
    .set('Authorization', `Bearer ${touristToken}`);

  assert.equal(resTourist.status, 200);
  assert.equal(resTourist.body.success, true);
  // Internal note must be filtered out: exactly 2 public messages visible
  assert.equal(resTourist.body.data.messages.length, 2);
  assert.ok(resTourist.body.data.messages.every(m => m.visibility !== 'internal'));

  // 2. Admin requests ticket detail
  const resAdmin = await request(app)
    .get(`/api/v1/support/tickets/${ticketId}`)
    .set('Authorization', `Bearer ${adminToken}`);

  assert.equal(resAdmin.status, 200);
  // Admin sees all 3 messages including internal note
  assert.equal(resAdmin.body.data.messages.length, 3);
  assert.ok(resAdmin.body.data.messages.some(m => m.visibility === 'internal'));
});

test('STEP 8 HTTP: Admin adds internal note to ticket', async () => {
  const dummyTicket = {
    _id: ticketId,
    messages: [],
    save: async function () { return this; }
  };
  SupportTicket.findById = async () => dummyTicket;

  const res = await request(app)
    .post(`/api/v1/admin/support/tickets/${ticketId}/internal-notes`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      message: 'Confidential investigation: Tourist reported high water level near monastery dock.'
    });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(dummyTicket.messages[0].visibility, 'internal');
});

// ============================================================================
// PART E: ADMINISTRATION, DASHBOARD ANALYTICS & REFUNDS
// ============================================================================

test('STEP 8 HTTP: GET /api/v1/admin/dashboard/overview returns comprehensive platform statistics', async () => {
  User.countDocuments = async () => 45;
  Vendor.aggregate = async () => [{ _id: 'approved', count: 12 }];
  Service.aggregate = async () => [{ _id: true, count: 28 }];
  Booking.aggregate = async () => [{ _id: 'completed', count: 95 }];
  Payment.aggregate = async () => [{ _id: null, totalGross: 145000, count: 90 }];
  CommissionTransaction.aggregate = async () => [{ _id: null, totalCommission: 14500 }];
  Settlement.aggregate = async () => [{ _id: 'completed', totalPaid: 120000 }];
  RefundRequest.countDocuments = async () => 2;
  SupportTicket.aggregate = async () => [{ _id: 'open', count: 4 }];
  Review.aggregate = async () => [{ _id: null, avgRating: 4.7, count: 68 }];
  AuditLog.find = () => ({
    populate: () => ({
      sort: () => ({
        limit: () => Promise.resolve([
          { action: 'vendor.approved', createdAt: new Date() }
        ])
      })
    })
  });

  const res = await request(app)
    .get('/api/v1/admin/dashboard/overview')
    .set('Authorization', `Bearer ${adminToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.tourists.total, 45);
  assert.equal(res.body.data.financials.grossVolume, 145000);
  assert.equal(res.body.data.actionItems.openTickets, 4);
});

test('STEP 8 HTTP: PATCH /api/v1/admin/refunds/:id/approve executes refund and returns success', async () => {
  const dummyRefund = {
    _id: refundId,
    status: 'pending',
    amount: 1500,
    user: { _id: touristId, name: 'Abebe Tourist', email: 'tourist@example.com' },
    booking: { _id: bookingId, bookingReference: 'LTTMS-BK-001' },
    save: async function () { return this; }
  };

  RefundRequest.findById = () => ({
    populate: () => ({
      populate: () => Promise.resolve(dummyRefund)
    })
  });

  // Mock Step 7 refund execution engine
  const paymentRefundService = require('../services/paymentRefundService');
  paymentRefundService.processRefundExecution = async () => ({
    refundRequestId: refundId,
    status: 'completed',
    amountRefunded: 1500,
    alreadyProcessed: false
  });

  const res = await request(app)
    .patch(`/api/v1/admin/refunds/${refundId}/approve`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ adminNote: 'Weather cancellation approved by lake authority' });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.execution.status, 'completed');
});

// ============================================================================
// PART F: ENTERPRISE CSV DATA EXPORTS
// ============================================================================

test('STEP 8: CSV Export utility correctly formats RFC 4180 escaped values', () => {
  const records = [
    {
      id: '1',
      name: 'Lake Tana, Monastery "Holy" Tour\nLine2',
      amount: 1250.5
    }
  ];

  const fields = [
    { label: 'ID', value: 'id' },
    { label: 'Tour Name', value: 'name' },
    { label: 'Price', value: 'amount' }
  ];

  const csv = convertToCSV(records, fields);
  const lines = csv.split('\r\n');
  assert.equal(lines[0], '"ID","Tour Name","Price"');
  // Value with quotes and comma must be enclosed in double quotes and inner quotes escaped
  assert.ok(lines[1].includes('"Lake Tana, Monastery ""Holy"" Tour\nLine2"'));
});

test('STEP 8 HTTP: GET /api/v1/admin/exports/bookings streams RFC 4180 CSV attachment', async () => {
  Booking.find = () => ({
    populate: () => ({
      populate: () => ({
        populate: () => ({
          sort: () => ({
            limit: () => Promise.resolve([
              {
                bookingReference: 'LTTMS-BK-TEST01',
                date: new Date('2026-11-10'),
                guests: 4,
                totalAmount: 3200,
                currency: 'ETB',
                status: 'confirmed',
                paymentStatus: 'paid',
                user: { name: 'Abebe Tourist', email: 'tourist@example.com' },
                service: { title: 'Blue Nile Falls Hike' },
                vendor: { businessName: 'Tis Abay Guides' },
                createdAt: new Date('2026-11-01')
              }
            ])
          })
        })
      })
    })
  });

  const res = await request(app)
    .get('/api/v1/admin/exports/bookings')
    .set('Authorization', `Bearer ${adminToken}`);

  assert.equal(res.status, 200);
  assert.ok(res.headers['content-type'].includes('text/csv'));
  assert.ok(res.headers['content-disposition'].includes('attachment; filename='));
  assert.ok(res.text.includes('LTTMS-BK-TEST01'));
  assert.ok(res.text.includes('Blue Nile Falls Hike'));
});

test('STEP 8 HTTP: Non-admin users are blocked from dashboard and export endpoints', async () => {
  const resDashboard = await request(app)
    .get('/api/v1/admin/dashboard/overview')
    .set('Authorization', `Bearer ${touristToken}`);

  assert.equal(resDashboard.status, 403);

  const resExport = await request(app)
    .get('/api/v1/admin/exports/payments')
    .set('Authorization', `Bearer ${vendorToken}`);

  assert.equal(resExport.status, 403);
});
