process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../index');

test('returns health payload', async () => {
  const res = await request(app).get('/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.dependencies);
});

test('validates register payload', async () => {
  const res = await request(app).post('/api/auth/register').send({ email: 'not-enough' });
  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
});
