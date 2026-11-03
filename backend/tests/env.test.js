const test = require('node:test');
const assert = require('node:assert/strict');
const { loadConfig } = require('../config/env');

test('ENV: loads default development configuration with fallbacks', () => {
  const config = loadConfig({
    NODE_ENV: 'test',
    MONGODB_URI: 'mongodb://localhost:27017/test_db',
    JWT_SECRET: 'test-secret-at-least-32-characters-long-key'
  }, true);

  assert.equal(config.NODE_ENV, 'test');
  assert.equal(config.PORT, 5000);
  assert.equal(config.MONGODB_URI, 'mongodb://localhost:27017/test_db');
  assert.equal(config.JWT_REFRESH_SECRET, 'test-secret-at-least-32-characters-long-key');
  assert.ok(Array.isArray(config.ALLOWED_ORIGINS));
  assert.equal(config.isTest, true);
  assert.equal(config.isProduction, false);
});

test('ENV: validates invalid port format', () => {
  assert.throws(() => {
    loadConfig({
      NODE_ENV: 'test',
      PORT: 'invalid-port',
      MONGODB_URI: 'mongodb://localhost:27017/test_db'
    }, true);
  }, /Invalid environment configuration/);
});

test('ENV: validates invalid NODE_ENV value', () => {
  assert.throws(() => {
    loadConfig({
      NODE_ENV: 'staging',
      MONGODB_URI: 'mongodb://localhost:27017/test_db'
    }, true);
  }, /Invalid environment configuration/);
});

test('ENV: splits multiple allowed frontend origins', () => {
  const config = loadConfig({
    NODE_ENV: 'test',
    MONGODB_URI: 'mongodb://localhost:27017/test_db',
    FRONTEND_ORIGIN: 'http://localhost:3000, https://laketana.com, http://localhost:8080'
  }, true);

  assert.deepEqual(config.ALLOWED_ORIGINS, [
    'http://localhost:3000',
    'https://laketana.com',
    'http://localhost:8080'
  ]);
});
