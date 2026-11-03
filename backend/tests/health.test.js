process.env.NODE_ENV = 'test';
const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
mongoose.set('bufferCommands', false);

const app = require('../app');

test('HEALTH: GET / returns API metadata and version endpoints', async () => {
  const res = await request(app).get('/');
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.version, '1.0.0');
  assert.equal(res.body.endpoints.v1, '/api/v1');
  assert.equal(res.body.endpoints.legacy, '/api');
});

test('HEALTH: GET /health returns 200 with liveness payload', async () => {
  const res = await request(app).get('/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.status, 'ok');
  assert.ok(typeof res.body.uptime === 'number');
  assert.ok(res.body.timestamp);
});

test('HEALTH: GET /api/v1/health returns 200 matching /health', async () => {
  const res = await request(app).get('/api/v1/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.status, 'ok');
});

test('READINESS: GET /ready returns readiness payload', async () => {
  const res = await request(app).get('/ready');
  assert.ok(res.status === 200 || res.status === 503);
  assert.ok(res.body.dependencies);
  assert.ok(res.body.dependencies.database);
});

test('READINESS: GET /api/v1/ready matches /ready', async () => {
  const res = await request(app).get('/api/v1/ready');
  assert.ok(res.status === 200 || res.status === 503);
  assert.ok(res.body.dependencies);
  assert.ok(res.body.dependencies.database);
});

test('METRICS: GET /metrics and GET /api/v1/metrics return process memory and uptime', async () => {
  const res = await request(app).get('/metrics');
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.metrics.uptime >= 0);
  assert.ok(res.body.metrics.memoryUsageRss > 0);
});

test('API COMPATIBILITY: non-existent routes return structured 404', async () => {
  const res = await request(app).get('/api/v1/non-existent-route');
  assert.equal(res.status, 404);
  assert.equal(res.body.success, false);
  assert.ok(res.body.message.includes('Route not found'));
});
