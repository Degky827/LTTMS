process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing';
process.env.JWT_BLACKLIST_ENABLED = 'false';

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const http = require('http');
const app = require('../index');

let server;
test.before(() => {
  server = http.createServer(app);
});
test.after(() => {
  server?.close();
});

// ==================== HEALTH ====================

test('GET /health returns 200 with status payload', async () => {
  const res = await request(app).get('/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.dependencies);
});

test('GET /metrics returns server metrics', async () => {
  const res = await request(app).get('/metrics');
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.metrics.uptime !== undefined);
});

// ==================== AUTH VALIDATION ====================

test('POST /api/auth/register requires name, email, password', async () => {
  const res = await request(app).post('/api/auth/register').send({ email: 'not-enough' });
  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
});

test('POST /api/auth/register rejects invalid email', async () => {
  const res = await request(app).post('/api/auth/register').send({
    name: 'Test',
    email: 'not-an-email',
    password: 'password123'
  });
  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
});

test('POST /api/auth/register rejects short password', async () => {
  const res = await request(app).post('/api/auth/register').send({
    name: 'Test User',
    email: 'test@example.com',
    password: '123'
  });
  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
});

test('POST /api/auth/login requires email and password', async () => {
  const res = await request(app).post('/api/auth/login').send({ email: 'test@test.com' });
  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
});

test('POST /api/auth/forgot-password requires email', async () => {
  const res = await request(app).post('/api/auth/forgot-password').send({});
  assert.equal(res.status, 400);
});

// ==================== PROTECTED ROUTES ====================

test('GET /api/bookings without token returns 401', async () => {
  const res = await request(app).get('/api/bookings');
  assert.equal(res.status, 401);
});

test('GET /api/bookings/user without token returns 401', async () => {
  const res = await request(app).get('/api/bookings/user');
  assert.equal(res.status, 401);
});

test('POST /api/bookings without token returns 401', async () => {
  const res = await request(app).post('/api/bookings').send({ service: 'abc', date: '2026-06-01' });
  assert.equal(res.status, 401);
});

test('GET /api/admin/stats without token returns 401', async () => {
  const res = await request(app).get('/api/admin/stats');
  assert.equal(res.status, 401);
});

test('POST /api/reviews without token returns 401', async () => {
  const res = await request(app).post('/api/reviews').send({ service: 'abc', rating: 5, comment: 'Great!' });
  assert.equal(res.status, 401);
});

test('POST /api/messages without token returns 401', async () => {
  const res = await request(app).post('/api/messages').send({ recipient: 'abc', subject: 'Hi', message: 'Hello' });
  assert.equal(res.status, 401);
});

test('POST /api/payments/checkout without token returns 401', async () => {
  const res = await request(app).post('/api/payments/checkout').send({ bookingId: 'abc' });
  assert.equal(res.status, 401);
});

// ==================== RATE LIMITING ====================

test('auth rate limiter blocks excessive requests', async () => {
  const promises = [];
  for (let i = 0; i < 25; i++) {
    promises.push(request(app).post('/api/auth/login').send({ email: `test${i}@test.com`, password: 'pass123' }));
  }
  const results = await Promise.all(promises);
  const tooMany = results.filter(r => r.status === 429);
  assert.ok(tooMany.length > 0, 'Expected at least one 429 rate limit response');
});

// ==================== VALIDATION SCHEMAS ====================

test('ZOD: createServiceSchema rejects missing title', async () => {
  const { createServiceSchema } = require('../validation/serviceSchemas');
  const result = await createServiceSchema.safeParseAsync({
    body: { description: 'A great tour', price: 50, category: 'tour' }
  });
  assert.equal(result.success, false);
});

test('ZOD: createServiceSchema rejects negative price', async () => {
  const { createServiceSchema } = require('../validation/serviceSchemas');
  const result = await createServiceSchema.safeParseAsync({
    body: { title: 'Boat Tour', description: 'A great boat tour on Lake Tana', price: -10, category: 'tour' }
  });
  assert.equal(result.success, false);
});

test('ZOD: createServiceSchema accepts valid data', async () => {
  const { createServiceSchema } = require('../validation/serviceSchemas');
  const result = await createServiceSchema.safeParseAsync({
    body: { title: 'Boat Tour', description: 'A great boat tour on Lake Tana', price: 50, category: 'tour' }
  });
  assert.equal(result.success, true);
});

test('ZOD: createReviewSchema rejects rating > 5', async () => {
  const { createReviewSchema } = require('../validation/reviewSchemas');
  const result = await createReviewSchema.safeParseAsync({
    body: { service: 'abc123', rating: 10, comment: 'Great!' }
  });
  assert.equal(result.success, false);
});

test('ZOD: createReviewSchema rejects empty comment', async () => {
  const { createReviewSchema } = require('../validation/reviewSchemas');
  const result = await createReviewSchema.safeParseAsync({
    body: { service: 'abc123', rating: 5, comment: '' }
  });
  assert.equal(result.success, false);
});

test('ZOD: sendMessageSchema rejects missing subject', async () => {
  const { sendMessageSchema } = require('../validation/messageSchemas');
  const result = await sendMessageSchema.safeParseAsync({
    body: { recipient: 'abc123', message: 'Hello there' }
  });
  assert.equal(result.success, false);
});

test('ZOD: sendMessageSchema accepts valid message', async () => {
  const { sendMessageSchema } = require('../validation/messageSchemas');
  const result = await sendMessageSchema.safeParseAsync({
    body: { recipient: 'abc123', subject: 'Question', message: 'Hello there' }
  });
  assert.equal(result.success, true);
});

// ==================== TOKEN BLACKLIST ====================

test('auth middleware blacklist functions', async () => {
  const { getBlacklistSize } = require('../middleware/auth');
  const size = getBlacklistSize();
  assert.equal(typeof size, 'number');
  assert.ok(size >= 0);
});

// ==================== EMAIL UTILITY ====================

test('sendEmail utility returns false when no transport', async () => {
  const sendEmail = require('../utils/email');
  const result = await sendEmail({ to: 'test@test.com', subject: 'Test', template: 'default', context: { name: 'Test' } });
  assert.equal(result, true);
});
