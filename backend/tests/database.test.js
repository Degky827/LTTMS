const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { checkDBHealth, connectDB, disconnectDB } = require('../config/database');

test('DATABASE: checkDBHealth returns status and readyState when disconnected', () => {
  const health = checkDBHealth();
  assert.equal(typeof health.status, 'string');
  assert.equal(typeof health.readyState, 'number');
  assert.equal(typeof health.stateLabel, 'string');
  if (mongoose.connection.readyState === 0) {
    assert.equal(health.status, 'down');
    assert.equal(health.stateLabel, 'disconnected');
  }
});

test('DATABASE: disconnectDB handles already disconnected state gracefully', async () => {
  // Should not throw even when already disconnected
  await assert.doesNotReject(async () => {
    await disconnectDB();
  });
});
