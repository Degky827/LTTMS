process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-at-least-32-characters-long-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-at-least-32-chars-long';
process.env.JWT_BLACKLIST_ENABLED = 'false';
process.env.CHAPA_WEBHOOK_SECRET = 'test-chapa-webhook-secret-key-32chars';

const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const request = require('supertest');

const app = require('../app');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Booking = require('../models/Booking');
const { swaggerSpec } = require('../config/swagger');
const { convertToCSV } = require('../utils/csvExportUtil');
const { FIXTURE_IDS, TOKENS, TEST_USERS } = require('./setup/test-helpers');

// Stub User.findById for authentication across all 5 roles
test.beforeEach(() => {
  User.findById = async (id) => {
    if (!id) return null;
    const idStr = id.toString();
    if (idStr === FIXTURE_IDS.tourist) return { ...TEST_USERS.tourist };
    if (idStr === FIXTURE_IDS.otherTourist) return { ...TEST_USERS.tourist, _id: FIXTURE_IDS.otherTourist, id: FIXTURE_IDS.otherTourist, email: 'other@example.com' };
    if (idStr === FIXTURE_IDS.vendorUser) return { ...TEST_USERS.vendorUser };
    if (idStr === FIXTURE_IDS.support) return { ...TEST_USERS.support };
    if (idStr === FIXTURE_IDS.admin) return { ...TEST_USERS.admin };
    if (idStr === FIXTURE_IDS.superAdmin) return { ...TEST_USERS.superAdmin };
    return null;
  };

  Vendor.findOne = async (query) => {
    if (query?.user === FIXTURE_IDS.vendorUser || query?.user?.toString() === FIXTURE_IDS.vendorUser) {
      return { _id: FIXTURE_IDS.vendorProfile, user: FIXTURE_IDS.vendorUser, businessName: 'Lake Tana Eco Charters', status: 'approved' };
    }
    return null;
  };
});

// ============================================================================
// 1. SWAGGER UI & OPENAPI 3.0.3 COMPLIANCE
// ============================================================================

test('STEP 9 SWAGGER: /api-docs and /api/v1/api-docs serve Swagger UI HTML', async () => {
  const resRoot = await request(app).get('/api-docs/');
  assert.equal(resRoot.status, 200);
  assert.ok(resRoot.text.includes('Swagger UI') || resRoot.text.includes('swagger-ui'));

  const resV1 = await request(app).get('/api/v1/api-docs/');
  assert.equal(resV1.status, 200);
  assert.ok(resV1.text.includes('Swagger UI') || resV1.text.includes('swagger-ui'));
});

test('STEP 9 SWAGGER: /api-docs.json and /swagger.json return complete OpenAPI 3.0.3 spec', async () => {
  const res = await request(app).get('/api-docs.json');
  assert.equal(res.status, 200);
  assert.equal(res.body.openapi, '3.0.3');
  assert.equal(res.body.info.title, 'Lake Tana Tourism Management System (LTTMS) API');

  // Verify Security Schemes: bearerAuth and cookieAuth
  const sec = res.body.components.securitySchemes;
  assert.ok(sec.bearerAuth, 'Must define bearerAuth security scheme');
  assert.equal(sec.bearerAuth.type, 'http');
  assert.equal(sec.bearerAuth.scheme, 'bearer');
  assert.equal(sec.bearerAuth.bearerFormat, 'JWT');
  assert.ok(sec.cookieAuth, 'Must define cookieAuth security scheme');

  // Verify tags coverage across all modules
  const tags = res.body.tags.map(t => t.name);
  const requiredTags = [
    'Authentication', 'User Management', 'Vendors', 'Destinations',
    'Categories', 'Services', 'Eco-Tourism', 'Bookings', 'Payments',
    'Vendor Finance', 'Admin Finance', 'Reviews', 'Notifications',
    'Support', 'Administration', 'Admin Dashboard', 'Admin Exports'
  ];
  requiredTags.forEach(tag => {
    assert.ok(tags.includes(tag), `OpenAPI spec must contain '${tag}' tag`);
  });

  // Verify complete endpoint paths coverage (> 140 paths)
  const pathsCount = Object.keys(res.body.paths).length;
  assert.ok(pathsCount >= 140, `Expected at least 140 documented paths, found ${pathsCount}`);
});

test('STEP 9 SWAGGER: Component schemas are complete and strongly typed', () => {
  const schemas = swaggerSpec.components.schemas;
  assert.ok(schemas.BookingInput);
  assert.ok(schemas.BookingResponse);
  assert.ok(schemas.PaymentResponse);
  assert.ok(schemas.ReceiptResponse);
  assert.ok(schemas.VendorFinanceOverview);
  assert.ok(schemas.SettlementRequest);
  assert.ok(schemas.CommissionRuleInput);
  assert.ok(schemas.ReviewInput);
  assert.ok(schemas.ReviewResponse);
  assert.ok(schemas.NotificationResponse);
  assert.ok(schemas.SupportTicketInput);
  assert.ok(schemas.SupportTicketResponse);
  assert.ok(schemas.DashboardOverviewResponse);
});

// ============================================================================
// 2. JWT AUTHORIZATION MATRIX ACROSS ALL 5 ROLES
// ============================================================================

test('STEP 9 RBAC: Access without token is rejected with 401', async () => {
  const res = await request(app).get('/api/v1/auth/me');
  assert.equal(res.status, 401);
  assert.equal(res.body.success, false);
});

test('STEP 9 RBAC: Access with invalid or expired token is rejected with 401', async () => {
  const resInvalid = await request(app)
    .get('/api/v1/auth/me')
    .set('Authorization', `Bearer ${TOKENS.invalid}`);
  assert.equal(resInvalid.status, 401);

  const resExpired = await request(app)
    .get('/api/v1/auth/me')
    .set('Authorization', `Bearer ${TOKENS.expired}`);
  assert.equal(resExpired.status, 401);

  const resTampered = await request(app)
    .get('/api/v1/auth/me')
    .set('Authorization', `Bearer ${TOKENS.tampered}`);
  assert.equal(resTampered.status, 401);
});

test('STEP 9 RBAC: Tourist can access tourist endpoints, blocked from vendor and admin', async () => {
  // 1. Permitted tourist endpoint
  const resMe = await request(app)
    .get('/api/v1/auth/me')
    .set('Authorization', `Bearer ${TOKENS.tourist}`);
  assert.equal(resMe.status, 200);
  assert.equal(resMe.body.data.role, 'tourist');

  // 2. Forbidden vendor endpoint
  const resVendor = await request(app)
    .get('/api/v1/vendor/finance/overview')
    .set('Authorization', `Bearer ${TOKENS.tourist}`);
  assert.equal(resVendor.status, 403);

  // 3. Forbidden admin endpoint
  const resAdmin = await request(app)
    .get('/api/v1/admin/dashboard/overview')
    .set('Authorization', `Bearer ${TOKENS.tourist}`);
  assert.equal(resAdmin.status, 403);
});

test('STEP 9 RBAC: Vendor can access vendor finance, blocked from admin dashboard', async () => {
  const vendorLedgerService = require('../services/vendorLedgerService');
  vendorLedgerService.getFinancialOverview = async () => ({
    currency: 'ETB',
    currentBalance: 9200,
    availableBalance: 7200
  });

  const resVendor = await request(app)
    .get('/api/v1/vendor/finance/overview')
    .set('Authorization', `Bearer ${TOKENS.vendor}`);
  assert.equal(resVendor.status, 200);

  const resAdmin = await request(app)
    .get('/api/v1/admin/dashboard/overview')
    .set('Authorization', `Bearer ${TOKENS.vendor}`);
  assert.equal(resAdmin.status, 403);
});

test('STEP 9 RBAC: Support role can access support tickets, blocked from super_admin role assignment', async () => {
  const SupportTicket = require('../models/SupportTicket');
  SupportTicket.find = () => ({
    sort: () => ({
      skip: () => ({
        limit: () => Promise.resolve([])
      })
    })
  });
  SupportTicket.countDocuments = async () => 0;

  // Support access to support tickets
  const resSupport = await request(app)
    .get('/api/v1/support/tickets/my-tickets')
    .set('Authorization', `Bearer ${TOKENS.support}`);
  assert.equal(resSupport.status, 200);

  // Support blocked from assigning roles
  const resRole = await request(app)
    .put(`/api/v1/admin/users/${FIXTURE_IDS.tourist}/role`)
    .set('Authorization', `Bearer ${TOKENS.support}`)
    .send({ role: 'admin' });
  assert.equal(resRole.status, 403);
});

test('STEP 9 RBAC: Admin can view admin dashboard, but cannot assign admin/super_admin roles', async () => {
  const Service = require('../models/Service');
  const Payment = require('../models/Payment');
  const CommissionTransaction = require('../models/CommissionTransaction');
  const Settlement = require('../models/Settlement');
  const RefundRequest = require('../models/RefundRequest');
  const SupportTicket = require('../models/SupportTicket');
  const Review = require('../models/Review');
  const AuditLog = require('../models/AuditLog');

  User.countDocuments = async () => 10;
  Vendor.aggregate = async () => [];
  Service.aggregate = async () => [];
  Booking.aggregate = async () => [];
  Payment.aggregate = async () => [];
  CommissionTransaction.aggregate = async () => [];
  Settlement.aggregate = async () => [];
  RefundRequest.countDocuments = async () => 0;
  SupportTicket.aggregate = async () => [];
  Review.aggregate = async () => [];
  AuditLog.find = () => ({ populate: () => ({ sort: () => ({ limit: () => Promise.resolve([]) }) }) });

  // Admin accesses dashboard
  const resDash = await request(app)
    .get('/api/v1/admin/dashboard/overview')
    .set('Authorization', `Bearer ${TOKENS.admin}`);
  assert.equal(resDash.status, 200);
  assert.equal(resDash.body.success, true);

  // Regular admin cannot promote a user to admin or super_admin
  const resAssign = await request(app)
    .put(`/api/v1/admin/users/${FIXTURE_IDS.tourist}/role`)
    .set('Authorization', `Bearer ${TOKENS.admin}`)
    .send({ role: 'admin' });
  assert.equal(resAssign.status, 403);
});

test('STEP 9 RBAC: Super-Admin can promote user roles', async () => {
  let targetUser = {
    _id: FIXTURE_IDS.tourist,
    role: 'tourist',
    save: async function () { return this; }
  };
  User.findById = async (id) => {
    if (id.toString() === FIXTURE_IDS.superAdmin) return { ...TEST_USERS.superAdmin };
    if (id.toString() === FIXTURE_IDS.tourist) return targetUser;
    return null;
  };

  const resAssign = await request(app)
    .put(`/api/v1/admin/users/${FIXTURE_IDS.tourist}/role`)
    .set('Authorization', `Bearer ${TOKENS.superAdmin}`)
    .send({ role: 'support' });

  assert.equal(resAssign.status, 200);
  assert.equal(targetUser.role, 'support');
});

// ============================================================================
// 3. SECURITY & INJECTION DEFENSE
// ============================================================================

test('STEP 9 SECURITY: CSV Formula Injection (DDE) values are sanitized with leading quote', () => {
  const records = [
    { name: '=cmd|"/C calc"!A0', price: '+100-50', note: '@SUM(A1:A10)', code: '-99' }
  ];
  const fields = [
    { label: 'Name', value: 'name' },
    { label: 'Price', value: 'price' },
    { label: 'Note', value: 'note' },
    { label: 'Code', value: 'code' }
  ];

  const csv = convertToCSV(records, fields);
  const rows = csv.split('\r\n');

  // Verify dangerous formula prefixes are escaped
  assert.ok(rows[1].includes(`"'=cmd|""/C calc""!A0"`));
  assert.ok(rows[1].includes(`"'+100-50"`));
  assert.ok(rows[1].includes(`"'@SUM(A1:A10)"`));
  assert.ok(rows[1].includes(`"'-99"`));
});

test('STEP 9 SECURITY: NoSQL object injection in string inputs is rejected with 400', async () => {
  // Attacker sends { "$gt": "" } instead of a string email
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({
      email: { $gt: '' },
      password: 'password123'
    });

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
});

test('STEP 9 SECURITY: Mass assignment attack attempting to elevate role in register is ignored or rejected', async () => {
  const res = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Hacker User',
      email: 'hacker@example.com',
      password: 'Password123!',
      role: 'super_admin' // Unauthorized attempt to self-assign super_admin
    });

  // Role enum in register schema only allows tourist or vendor
  assert.equal(res.status, 400);
});

test('STEP 9 SECURITY: IDOR defense - Tourist cannot cancel another tourist booking', async () => {
  Booking.findById = async () => ({
    _id: FIXTURE_IDS.booking,
    user: FIXTURE_IDS.otherTourist, // Owned by other tourist
    status: 'confirmed'
  });

  const res = await request(app)
    .post(`/api/v1/bookings/${FIXTURE_IDS.booking}/cancel`)
    .set('Authorization', `Bearer ${TOKENS.tourist}`)
    .send({ reason: 'Malicious cancellation attempt' });

  assert.equal(res.status, 403);
  assert.equal(res.body.success, false);
});

test('STEP 9 SECURITY: Sensitive authentication fields are omitted from profile responses', async () => {
  const res = await request(app)
    .get('/api/v1/auth/me')
    .set('Authorization', `Bearer ${TOKENS.tourist}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.data.password, undefined);
  assert.equal(res.body.data.resetPasswordToken, undefined);
  assert.equal(res.body.data.emailVerificationToken, undefined);
});
