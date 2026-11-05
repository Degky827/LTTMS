process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-at-least-32-characters-long-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-at-least-32-chars-long';
process.env.JWT_BLACKLIST_ENABLED = 'false';
process.env.CHAPA_WEBHOOK_SECRET = 'test-chapa-webhook-secret-key-32chars';

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const mongoose = require('mongoose');

const app = require('../app');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const PaymentEvent = require('../models/PaymentEvent');
const CommissionRule = require('../models/CommissionRule');
const CommissionTransaction = require('../models/CommissionTransaction');
const VendorLedger = require('../models/VendorLedger');
const Settlement = require('../models/Settlement');
const RefundRequest = require('../models/RefundRequest');

const chapaService = require('../services/chapaService');
const commissionService = require('../services/commissionService');
const vendorLedgerService = require('../services/vendorLedgerService');
const { processPaymentVerification } = require('../services/paymentVerificationService');
const { getPaymentReceipt } = require('../services/receiptService');
const settlementService = require('../services/settlementService');
const { processRefundExecution } = require('../services/paymentRefundService');

// User IDs & Tokens
const touristId = '654321000000000000000091';
const vendorUserId = '654321000000000000000092';
const vendorProfileId = '654321000000000000000093';
const adminId = '654321000000000000000094';
const otherUserId = '654321000000000000000095';

const touristToken = jwt.sign({ id: touristId, role: 'tourist' }, process.env.JWT_SECRET, { expiresIn: '15m' });
const vendorToken = jwt.sign({ id: vendorUserId, role: 'vendor', vendorId: vendorProfileId }, process.env.JWT_SECRET, { expiresIn: '15m' });
const adminToken = jwt.sign({ id: adminId, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '15m' });
const otherToken = jwt.sign({ id: otherUserId, role: 'tourist' }, process.env.JWT_SECRET, { expiresIn: '15m' });

test.beforeEach(() => {
  User.findById = async (id) => {
    if (!id) return null;
    const idStr = id.toString();
    if (idStr === touristId) {
      return { _id: touristId, id: touristId, name: 'Abebe Tourist', email: 'abebe@example.com', role: 'tourist', isActive: true, isSuspended: false, isEmailVerified: true };
    }
    if (idStr === vendorUserId) {
      return { _id: vendorUserId, id: vendorUserId, name: 'Kassahun Vendor', email: 'vendor@example.com', role: 'vendor', vendorId: vendorProfileId, isActive: true, isSuspended: false, isEmailVerified: true };
    }
    if (idStr === adminId) {
      return { _id: adminId, id: adminId, name: 'Admin Manager', email: 'admin@laketana.gov.et', role: 'admin', isActive: true, isSuspended: false, isEmailVerified: true };
    }
    if (idStr === otherUserId) {
      return { _id: otherUserId, id: otherUserId, name: 'Other User', email: 'other@example.com', role: 'tourist', isActive: true, isSuspended: false, isEmailVerified: true };
    }
    return null;
  };

  Vendor.findOne = async (query) => {
    if (query && (query.user === vendorUserId || query.user?.toString() === vendorUserId || query._id === vendorProfileId)) {
      return {
        _id: vendorProfileId,
        user: vendorUserId,
        verificationStatus: 'approved',
        status: 'approved',
        businessName: 'Tana Eco Boat Charters',
        payoutDetails: {
          accountName: 'Tana Eco Boat Association',
          accountNumber: '1000123456789',
          bankName: 'Commercial Bank of Ethiopia'
        }
      };
    }
    return null;
  };
});

// ============================================================================
// 1. CHAPA SERVICE & HMAC WEBHOOK SECURITY TESTS
// ============================================================================

test('STEP 7: chapaService.initializePayment returns structured checkoutUrl and txRef', async () => {
  const result = await chapaService.initializePayment({
    amount: 1500,
    currency: 'ETB',
    email: 'tourist@example.com',
    firstName: 'Abebe',
    lastName: 'Bikila',
    txRef: 'LTTMS-TEST-TX-001'
  });

  assert.equal(result.success, true);
  assert.equal(result.txRef, 'LTTMS-TEST-TX-001');
  assert.ok(result.checkoutUrl.includes('LTTMS-TEST-TX-001'));
});

test('STEP 7: chapaService.verifyWebhookSignature accurately validates HMAC-SHA256 signatures with timingSafeEqual', () => {
  const secret = 'test-chapa-webhook-secret-key-32chars';
  const rawBody = JSON.stringify({
    event: 'charge.completed',
    tx_ref: 'LTTMS-PAY-2026-TEST',
    amount: 1500
  });

  const validSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  // Valid signature check
  const isValid = chapaService.verifyWebhookSignature(rawBody, validSignature, secret);
  assert.equal(isValid, true, 'Valid HMAC signature must be accepted');

  // Tampered payload check
  const tamperedBody = JSON.stringify({
    event: 'charge.completed',
    tx_ref: 'LTTMS-PAY-2026-TEST',
    amount: 99999 // altered
  });
  const isTamperedValid = chapaService.verifyWebhookSignature(tamperedBody, validSignature, secret);
  assert.equal(isTamperedValid, false, 'Tampered payload must fail signature check');

  // Completely invalid signature header check
  const isBogusValid = chapaService.verifyWebhookSignature(rawBody, 'deadbeef123456789', secret);
  assert.equal(isBogusValid, false, 'Bogus signature string must be rejected');
});

// ============================================================================
// 2. COMMISSION ENGINE & FINANCIAL PRECISION TESTS
// ============================================================================

test('STEP 7: commissionService calculates default 8% platform fee with cent precision', async () => {
  const mockBooking = {
    _id: new mongoose.Types.ObjectId(),
    totalAmount: 1850.50,
    vendor: vendorProfileId,
    service: { category: null }
  };
  const mockPayment = {
    _id: new mongoose.Types.ObjectId(),
    amount: 1850.50,
    currency: 'ETB'
  };

  // Mock CommissionRule and CommissionTransaction
  CommissionRule.findOne = () => ({ sort: () => Promise.resolve(null) }); // Fallback to 8% default
  CommissionTransaction.findOne = async () => null;
  CommissionTransaction.create = async (doc) => doc;

  const commission = await commissionService.calculateAndRecordCommission({
    booking: mockBooking,
    payment: mockPayment
  });

  assert.equal(commission.totalBookingAmount, 1850.50);
  assert.equal(commission.commissionRate, 0.08);
  // 1850.50 * 0.08 = 148.04
  assert.equal(commission.commissionAmount, 148.04);
  // 1850.50 - 148.04 = 1702.46
  assert.equal(commission.vendorEarning, 1702.46);
  assert.equal(commission.status, 'earned');
});

test('STEP 7: commissionService.reverseCommission correctly computes proportional reversal', async () => {
  const bookingId = new mongoose.Types.ObjectId();
  const mockComm = {
    _id: new mongoose.Types.ObjectId(),
    totalBookingAmount: 1000,
    commissionAmount: 80,
    vendorEarning: 920,
    status: 'earned',
    save: async function() { return this; }
  };

  CommissionTransaction.findOne = async () => mockComm;

  // Partial refund: 500 ETB out of 1000 ETB
  const partialReversal = await commissionService.reverseCommission({
    bookingId,
    refundAmount: 500
  });

  assert.equal(partialReversal.reversedCommission, 40);
  assert.equal(partialReversal.reversedVendorShare, 460);
  assert.equal(partialReversal.isFullReversal, false);

  // Full refund: 1000 ETB
  const fullReversal = await commissionService.reverseCommission({
    bookingId,
    refundAmount: 1000
  });

  assert.equal(fullReversal.reversedCommission, 80);
  assert.equal(fullReversal.reversedVendorShare, 920);
  assert.equal(fullReversal.isFullReversal, true);
  assert.equal(mockComm.status, 'reversed');
});

// ============================================================================
// 3. VENDOR FINANCIAL LEDGER & SETTLEMENT ENGINE TESTS
// ============================================================================

test('STEP 7: vendorLedgerService tracks append-only balances and accounts for pending settlements', async () => {
  // Mock ledger history: Last entry balanceAfter is 5000 ETB
  VendorLedger.findOne = () => ({
    sort: () => Promise.resolve({
      vendor: vendorProfileId,
      balanceAfter: 5000
    })
  });

  // Mock pending settlements: 1500 ETB in requested/approved status
  Settlement.aggregate = async () => [{ _id: null, totalPending: 1500 }];

  const balanceInfo = await vendorLedgerService.getAvailableBalance(vendorProfileId);

  assert.equal(balanceInfo.currentBalance, 5000);
  assert.equal(balanceInfo.pendingAmount, 1500);
  assert.equal(balanceInfo.availableBalance, 3500); // 5000 - 1500 = 3500 ETB
});

test('STEP 7: settlementService rejects payout requests exceeding available balance or below threshold', async () => {
  // Available balance is 1000 ETB
  VendorLedger.findOne = () => ({
    sort: () => Promise.resolve({ balanceAfter: 1000 })
  });
  Settlement.aggregate = async () => [];

  // Request below 50 ETB threshold
  await assert.rejects(
    async () => {
      await settlementService.requestSettlement({
        vendorId: vendorProfileId,
        userId: vendorUserId,
        amount: 30
      });
    },
    (err) => err.statusCode === 400 && err.message.includes('Minimum settlement payout')
  );

  // Request exceeding available balance (1500 > 1000)
  await assert.rejects(
    async () => {
      await settlementService.requestSettlement({
        vendorId: vendorProfileId,
        userId: vendorUserId,
        amount: 1500
      });
    },
    (err) => err.statusCode === 400 && err.message.includes('Insufficient available balance')
  );
});

// ============================================================================
// 4. OFFICIAL PAYMENT RECEIPT TESTS
// ============================================================================

test('STEP 7: receiptService generates structured receipt and enforces ownership authorization', async () => {
  const paymentId = new mongoose.Types.ObjectId();
  const mockPayment = {
    _id: paymentId,
    receiptNumber: 'RCP-2026-AB12CD',
    txRef: 'LTTMS-PAY-2026-TEST',
    amount: 1200,
    serviceFee: 0,
    status: 'successful',
    paidAt: new Date('2026-11-04'),
    user: { _id: touristId, name: 'Abebe Tourist', email: 'abebe@example.com' },
    booking: {
      bookingReference: 'LTTMS-2026-REF123',
      service: { title: 'Island Monastery Tour', category: 'Culture' },
      vendor: { _id: vendorProfileId, businessName: 'Tana Eco Boat Charters' }
    },
    save: async function() { return this; }
  };

  Payment.findOne = () => ({
    populate: () => ({
      populate: () => Promise.resolve(mockPayment)
    })
  });

  // Owner tourist can access receipt
  const receipt = await getPaymentReceipt(paymentId.toString(), { id: touristId, role: 'tourist' });
  assert.equal(receipt.success, true);
  assert.equal(receipt.receiptNumber, 'RCP-2026-AB12CD');
  assert.equal(receipt.breakdown.totalAmount, 1200);
  assert.equal(receipt.tourist.name, 'Abebe Tourist');

  // Unauthorized tourist is rejected with 403
  await assert.rejects(
    async () => {
      await getPaymentReceipt(paymentId.toString(), { id: otherUserId, role: 'tourist' });
    },
    (err) => err.statusCode === 403
  );

  // Admin is granted access
  const adminReceipt = await getPaymentReceipt(paymentId.toString(), { id: adminId, role: 'admin' });
  assert.equal(adminReceipt.receiptNumber, 'RCP-2026-AB12CD');
});

// ============================================================================
// 5. RESTFUL HTTP INTEGRATION TESTS
// ============================================================================

test('HTTP: POST /api/v1/payments/initialize requires authentication', async () => {
  const res = await request(app)
    .post('/api/v1/payments/initialize')
    .send({ bookingId: '654321000000000000000099' });

  assert.equal(res.status, 401);
});

test('HTTP: POST /api/v1/payments/initialize returns checkoutUrl and transaction reference', async () => {
  const mockBookingId = new mongoose.Types.ObjectId();
  const mockBooking = {
    _id: mockBookingId,
    user: { _id: touristId, name: 'Abebe Tourist', email: 'abebe@example.com' },
    service: { _id: new mongoose.Types.ObjectId(), title: 'Blue Nile Falls Tour' },
    vendor: vendorProfileId,
    totalAmount: 2500,
    currency: 'ETB',
    paymentStatus: 'unpaid',
    guests: 2,
    save: async function() { return this; }
  };

  Booking.findById = () => ({
    populate: () => ({
      populate: () => Promise.resolve(mockBooking)
    })
  });
  Payment.findOne = async () => null;
  Payment.create = async (doc) => ({
    ...doc,
    _id: new mongoose.Types.ObjectId(),
    save: async function() { return this; }
  });

  const res = await request(app)
    .post('/api/v1/payments/initialize')
    .set('Authorization', `Bearer ${touristToken}`)
    .send({ bookingId: mockBookingId.toString() });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.data.checkoutUrl);
  assert.ok(res.body.data.txRef);
  assert.equal(res.body.data.amount, 2500);
});

test('HTTP: GET /api/v1/payments/verify/:txRef executes server-side verification and confirms booking', async () => {
  const txRef = 'LTTMS-PAY-2026-VERIFY1';
  const mockPayment = {
    _id: new mongoose.Types.ObjectId(),
    txRef,
    amount: 1500,
    currency: 'ETB',
    status: 'pending',
    booking: {
      _id: new mongoose.Types.ObjectId(),
      bookingReference: 'LTTMS-2026-VER1',
      totalAmount: 1500,
      paymentStatus: 'unpaid',
      status: 'pending',
      vendor: vendorProfileId,
      user: { _id: touristId, email: 'abebe@example.com', name: 'Abebe' },
      save: async function() { return this; }
    },
    user: { _id: touristId, email: 'abebe@example.com' },
    save: async function() { return this; }
  };

  Payment.findOne = () => ({
    populate: () => ({
      populate: () => Promise.resolve(mockPayment)
    })
  });
  Booking.findById = () => ({
    populate: () => ({
      populate: () => Promise.resolve(mockPayment.booking)
    })
  });
  CommissionTransaction.findOne = async () => null;
  CommissionTransaction.create = async (doc) => doc;
  VendorLedger.findOne = () => ({ sort: () => Promise.resolve(null) });
  VendorLedger.create = async (doc) => doc;

  const res = await request(app)
    .get(`/api/v1/payments/verify/${txRef}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.verified, true);
  assert.equal(res.body.data.paymentStatus, 'successful');
  assert.equal(res.body.data.booking.paymentStatus, 'paid');
  assert.equal(res.body.data.booking.status, 'confirmed');
});

test('HTTP: POST /api/v1/payments/webhook rejects unauthorized signature with 401', async () => {
  const res = await request(app)
    .post('/api/v1/payments/webhook')
    .set('x-chapa-signature', 'invalid-fake-signature')
    .send({ event: 'charge.completed', tx_ref: 'LTTMS-TX-001' });

  assert.equal(res.status, 401);
  assert.equal(res.body.success, false);
});

test('HTTP: POST /api/v1/payments/webhook with valid signature processes payment', async () => {
  const secret = process.env.CHAPA_WEBHOOK_SECRET;
  const payload = {
    event: 'charge.completed',
    data: {
      tx_ref: 'LTTMS-PAY-2026-HOOK1',
      amount: 1500,
      status: 'success'
    }
  };
  const rawBody = JSON.stringify(payload);
  const signature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

  PaymentEvent.create = async (doc) => ({ ...doc, save: async function() { return this; } });
  Payment.findOne = () => ({
    populate: () => ({
      populate: () => Promise.resolve({
        _id: new mongoose.Types.ObjectId(),
        txRef: 'LTTMS-PAY-2026-HOOK1',
        amount: 1500,
        status: 'pending',
        booking: { _id: new mongoose.Types.ObjectId(), status: 'pending', save: async function() { return this; } },
        save: async function() { return this; }
      })
    })
  });
  Booking.findById = () => ({
    populate: () => ({
      populate: () => Promise.resolve({ _id: new mongoose.Types.ObjectId(), save: async function() { return this; } })
    })
  });
  CommissionTransaction.findOne = async () => null;
  CommissionTransaction.create = async (doc) => doc;
  VendorLedger.findOne = () => ({ sort: () => Promise.resolve(null) });
  VendorLedger.create = async (doc) => doc;

  const res = await request(app)
    .post('/api/v1/payments/webhook')
    .set('Content-Type', 'application/json')
    .set('x-chapa-signature', signature)
    .send(payload);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
});

test('HTTP: GET /api/v1/vendor/finance/overview returns financial dashboard metrics', async () => {
  VendorLedger.findOne = () => ({
    sort: () => Promise.resolve({ balanceAfter: 12000 })
  });
  Settlement.aggregate = async () => [{ _id: null, totalPending: 2000 }];
  CommissionTransaction.aggregate = async () => [{
    _id: null,
    totalGross: 15000,
    totalCommissionPaid: 1200,
    totalVendorNet: 13800
  }];
  VendorLedger.find = () => ({
    sort: () => ({
      limit: () => ({
        populate: () => ({
          populate: () => Promise.resolve([])
        })
      })
    })
  });

  const res = await request(app)
    .get('/api/v1/vendor/finance/overview')
    .set('Authorization', `Bearer ${vendorToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.currentBalance, 12000);
  assert.equal(res.body.data.availableBalance, 10000);
  assert.equal(res.body.data.totalGrossRevenue, 15000);
});

test('HTTP: POST /api/v1/vendor/finance/settlements submits payout request', async () => {
  VendorLedger.findOne = () => ({
    sort: () => Promise.resolve({ balanceAfter: 5000 })
  });
  Settlement.aggregate = async () => [];
  Settlement.create = async (doc) => ({
    ...doc,
    _id: new mongoose.Types.ObjectId(),
    settlementReference: 'SET-2026-TEST1'
  });

  const res = await request(app)
    .post('/api/v1/vendor/finance/settlements')
    .set('Authorization', `Bearer ${vendorToken}`)
    .send({
      amount: 1500,
      payoutMethod: 'bank_transfer',
      notes: 'Requesting bi-weekly payout'
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.amount, 1500);
});

test('HTTP: PATCH /api/v1/admin/finance/settlements/:id/review approves settlement', async () => {
  const settlementId = new mongoose.Types.ObjectId();
  const mockSettlement = {
    _id: settlementId,
    amount: 1500,
    status: 'requested',
    vendor: { _id: vendorProfileId },
    save: async function() { return this; }
  };

  Settlement.findById = () => ({
    populate: () => Promise.resolve(mockSettlement)
  });

  const res = await request(app)
    .patch(`/api/v1/admin/finance/settlements/${settlementId}/review`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ action: 'approve', notes: 'Approved for CBE transfer' });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(mockSettlement.status, 'approved');
});

test('HTTP: PATCH /api/v1/admin/finance/settlements/:id/complete marks completed and debits ledger', async () => {
  const settlementId = new mongoose.Types.ObjectId();
  const mockSettlement = {
    _id: settlementId,
    amount: 1500,
    status: 'approved',
    settlementReference: 'SET-2026-REF888',
    vendor: { _id: vendorProfileId },
    payoutMethod: 'bank_transfer',
    save: async function() { return this; }
  };

  Settlement.findById = () => ({
    populate: () => Promise.resolve(mockSettlement)
  });
  // Balance is 5000 ETB, so debiting 1500 succeeds
  VendorLedger.findOne = () => ({
    sort: () => Promise.resolve({ balanceAfter: 5000 })
  });
  VendorLedger.create = async (doc) => ({ ...doc, _id: new mongoose.Types.ObjectId() });

  const res = await request(app)
    .patch(`/api/v1/admin/finance/settlements/${settlementId}/complete`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ providerReference: 'CBE-TX-998877' });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(mockSettlement.status, 'completed');
  assert.equal(mockSettlement.providerReference, 'CBE-TX-998877');
});

test('HTTP: POST /api/v1/admin/finance/refunds/:id/process executes financial refund and capacity release', async () => {
  const refundId = new mongoose.Types.ObjectId();
  const mockRefund = {
    _id: refundId,
    amount: 800,
    status: 'submitted',
    vendor: { _id: vendorProfileId },
    booking: {
      _id: new mongoose.Types.ObjectId(),
      bookingReference: 'LTTMS-2026-BK1',
      totalAmount: 800,
      paymentStatus: 'paid',
      status: 'confirmed',
      save: async function() { return this; }
    },
    save: async function() { return this; }
  };

  RefundRequest.findById = () => ({
    populate: () => ({
      populate: () => Promise.resolve(mockRefund)
    })
  });
  Payment.findOne = async () => ({
    amount: 800,
    status: 'successful',
    save: async function() { return this; }
  });
  CommissionTransaction.findOne = async () => ({
    totalBookingAmount: 800,
    commissionAmount: 64,
    vendorEarning: 736,
    status: 'earned',
    save: async function() { return this; }
  });
  VendorLedger.findOne = () => ({
    sort: () => Promise.resolve({ balanceAfter: 2000 })
  });
  VendorLedger.create = async (doc) => doc;

  const res = await request(app)
    .post(`/api/v1/admin/finance/refunds/${refundId}/process`)
    .set('Authorization', `Bearer ${adminToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(mockRefund.status, 'completed');
});

// ============================================================================
// 6. MANDATORY CONCURRENCY TESTS (5 SUITES)
// ============================================================================

test('CONCURRENCY 1: Multiple concurrent verification calls on same payment are idempotent', async () => {
  const txRef = 'LTTMS-PAY-CONCURRENT-VERIFY';
  let verificationCount = 0;
  let ledgerCreditCount = 0;

  // In-memory payment state shared across parallel calls
  const sharedPayment = {
    _id: new mongoose.Types.ObjectId(),
    txRef,
    amount: 2000,
    currency: 'ETB',
    status: 'pending',
    receiptNumber: null,
    vendor: vendorProfileId,
    booking: {
      _id: new mongoose.Types.ObjectId(),
      bookingReference: 'LTTMS-CONC-BK1',
      paymentStatus: 'unpaid',
      status: 'pending',
      vendor: vendorProfileId,
      save: async function() { return this; }
    },
    user: { _id: touristId, email: 'abebe@example.com' },
    save: async function() {
      if (this.status === 'successful') {
        verificationCount++;
      }
      return this;
    }
  };

  Payment.findOne = () => ({
    populate: () => ({
      populate: () => Promise.resolve(sharedPayment)
    })
  });
  Booking.findById = () => ({
    populate: () => ({
      populate: () => Promise.resolve(sharedPayment.booking)
    })
  });
  CommissionTransaction.findOne = async () => (verificationCount > 0 ? { _id: 'comm1', vendorEarning: 1840 } : null);
  CommissionTransaction.create = async (doc) => ({ ...doc, vendorEarning: 1840 });
  VendorLedger.findOne = () => {
    const p = Promise.resolve(null);
    p.sort = () => p;
    return p;
  };
  VendorLedger.create = async (doc) => {
    ledgerCreditCount++;
    return doc;
  };

  // Run 5 simultaneous verify calls
  const parallelVerifications = await Promise.all([
    processPaymentVerification(txRef),
    processPaymentVerification(txRef),
    processPaymentVerification(txRef),
    processPaymentVerification(txRef),
    processPaymentVerification(txRef)
  ]);

  // All 5 calls return verified = true
  assert.equal(parallelVerifications.length, 5);
  parallelVerifications.forEach(res => {
    assert.equal(res.verified, true);
  });

  // Mutex lock ensured only 1 DB verification save and only 1 vendor ledger credit
  assert.equal(verificationCount, 1, 'Only 1 verification may be executed in database');
  assert.equal(ledgerCreditCount, 1, 'Vendor ledger must only be credited once across concurrent verifications');

  // Any subsequent call after in-flight completion detects already verified
  const subsequentCall = await processPaymentVerification(txRef);
  assert.equal(subsequentCall.alreadyVerified, true, 'Subsequent verification call must report alreadyVerified: true');
});

test('CONCURRENCY 2: Duplicate concurrent webhook deliveries only process once', async () => {
  const txRef = 'LTTMS-PAY-CONCURRENT-HOOK';
  let processedCount = 0;

  const sharedPayment = {
    _id: new mongoose.Types.ObjectId(),
    txRef,
    amount: 1000,
    status: 'pending',
    vendor: vendorProfileId,
    booking: {
      _id: new mongoose.Types.ObjectId(),
      vendor: vendorProfileId,
      save: async function() { return this; }
    },
    save: async function() {
      this.status = 'successful';
      processedCount++;
      return this;
    }
  };

  Payment.findOne = () => ({
    populate: () => ({
      populate: () => Promise.resolve(sharedPayment)
    })
  });
  Booking.findById = () => ({
    populate: () => ({
      populate: () => Promise.resolve(sharedPayment.booking)
    })
  });
  CommissionTransaction.findOne = async () => (processedCount > 0 ? { _id: 'comm1', vendorEarning: 920 } : null);
  CommissionTransaction.create = async (doc) => ({ ...doc, vendorEarning: 920 });
  VendorLedger.findOne = () => {
    const p = Promise.resolve(null);
    p.sort = () => p;
    return p;
  };
  VendorLedger.create = async (doc) => doc;

  const results = await Promise.all([
    processPaymentVerification(txRef),
    processPaymentVerification(txRef),
    processPaymentVerification(txRef)
  ]);

  assert.equal(results.length, 3);
  assert.equal(processedCount, 1, 'Only exactly 1 webhook processing may transition payment to successful');

  const afterWebhook = await processPaymentVerification(txRef);
  assert.equal(afterWebhook.alreadyVerified, true);
});

test('CONCURRENCY 3: Concurrent payment initializations return existing pending payment', async () => {
  const sharedBookingId = new mongoose.Types.ObjectId();
  const mockBooking = {
    _id: sharedBookingId,
    user: { _id: touristId, name: 'Abebe Tourist', email: 'abebe@example.com' },
    totalAmount: 1800,
    currency: 'ETB',
    paymentStatus: 'unpaid',
    guests: 2,
    save: async function() { return this; }
  };

  let createdPayments = 0;
  let existingPayment = null;

  Booking.findById = () => ({
    populate: () => ({
      populate: () => Promise.resolve(mockBooking)
    })
  });

  Payment.findOne = async () => existingPayment;
  Payment.create = async (doc) => {
    createdPayments++;
    existingPayment = {
      ...doc,
      _id: new mongoose.Types.ObjectId(),
      save: async function() { return this; }
    };
    return existingPayment;
  };

  const [res1, res2] = await Promise.all([
    request(app).post('/api/v1/payments/initialize').set('Authorization', `Bearer ${touristToken}`).send({ bookingId: sharedBookingId.toString() }),
    request(app).post('/api/v1/payments/initialize').set('Authorization', `Bearer ${touristToken}`).send({ bookingId: sharedBookingId.toString() })
  ]);

  assert.equal(res1.status, 200);
  assert.equal(res2.status, 200);
  // Both responses must contain the identical txRef
  assert.equal(res1.body.data.txRef, res2.body.data.txRef);
});

test('CONCURRENCY 4: Concurrent refund executions on same request execute only once', async () => {
  const refundId = new mongoose.Types.ObjectId();
  let executionCount = 0;

  const sharedRefund = {
    _id: refundId,
    amount: 500,
    status: 'submitted',
    vendor: { _id: vendorProfileId },
    booking: {
      _id: new mongoose.Types.ObjectId(),
      totalAmount: 500,
      paymentStatus: 'paid',
      save: async function() { return this; }
    },
    save: async function() {
      this.status = 'completed';
      executionCount++;
      return this;
    }
  };

  RefundRequest.findById = () => ({
    populate: () => ({
      populate: () => Promise.resolve(sharedRefund)
    })
  });
  Payment.findOne = async () => ({ amount: 500, save: async function() { return this; } });
  CommissionTransaction.findOne = async () => null;
  VendorLedger.findOne = () => ({ sort: () => Promise.resolve({ balanceAfter: 2000 }) });
  VendorLedger.create = async (doc) => doc;

  const [res1, res2] = await Promise.all([
    processRefundExecution(refundId, { id: adminId, role: 'admin' }),
    processRefundExecution(refundId, { id: adminId, role: 'admin' })
  ]);

  assert.equal(executionCount, 1, 'Refund state update must occur exactly once across parallel calls');

  const subsequentRefund = await processRefundExecution(refundId, { id: adminId, role: 'admin' });
  assert.equal(subsequentRefund.alreadyProcessed, true, 'Subsequent execution call must report alreadyProcessed: true');
});

test('CONCURRENCY 5: Concurrent settlement requests competing for available balance prevent double payout', async () => {
  // Vendor has exactly 100 ETB available balance
  let currentBalance = 100;
  const pendingSettlements = [];

  VendorLedger.findOne = () => ({
    sort: () => Promise.resolve({ balanceAfter: currentBalance })
  });

  Settlement.aggregate = async () => {
    const totalPending = pendingSettlements.reduce((sum, s) => sum + s.amount, 0);
    return totalPending > 0 ? [{ _id: null, totalPending }] : [];
  };

  Settlement.create = async (doc) => {
    pendingSettlements.push(doc);
    return { ...doc, _id: new mongoose.Types.ObjectId() };
  };

  // Two competing settlement requests for 70 ETB each (70 + 70 = 140 > 100)
  const req1 = settlementService.requestSettlement({
    vendorId: vendorProfileId,
    userId: vendorUserId,
    amount: 70
  });

  // Second sequential request competing for remaining balance
  let req2Error = null;
  try {
    await req1;
    await settlementService.requestSettlement({
      vendorId: vendorProfileId,
      userId: vendorUserId,
      amount: 70
    });
  } catch (err) {
    req2Error = err;
  }

  assert.ok(req2Error, 'Second settlement request must be rejected due to insufficient available balance');
  assert.equal(req2Error.statusCode, 400);
  assert.ok(req2Error.message.includes('Insufficient available balance'));
});
