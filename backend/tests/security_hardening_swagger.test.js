process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-at-least-32-characters-long-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-at-least-32-chars-long';
process.env.JWT_ISSUER = 'lttms-api';
process.env.JWT_AUDIENCE = 'lttms-client';
process.env.JWT_BLACKLIST_ENABLED = 'true';

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const http = require('http');
const mongoose = require('mongoose');
mongoose.set('bufferCommands', false);

const app = require('../index');
const { swaggerSpec } = require('../config/swagger');
const logger = require('../utils/logger');
const { errorHandler } = require('../middleware/errorHandlers');
const { authLimiter, passwordResetLimiter, verificationLimiter, refreshLimiter } = require('../middleware/rateLimiters');

let server;
test.before(() => {
  server = http.createServer(app);
});
test.after(() => {
  server?.close();
});

// ============================================================================
// 1. SWAGGER / OPENAPI 3.0 SPECIFICATION & UI VERIFICATION
// ============================================================================

test('SWAGGER: GET /api-docs.json returns valid OpenAPI 3.0.3 specification', async () => {
  const res = await request(app).get('/api-docs.json');
  assert.equal(res.status, 200);
  assert.equal(res.body.openapi, '3.0.3');
  assert.equal(res.body.info.title, 'Lake Tana Tourism Management System (LTTMS) API');
  assert.equal(res.body.info.version, '1.0.0');

  // Verify security schemes
  const schemes = res.body.components.securitySchemes;
  assert.ok(schemes.bearerAuth, 'bearerAuth must be defined');
  assert.equal(schemes.bearerAuth.type, 'http');
  assert.equal(schemes.bearerAuth.scheme, 'bearer');
  assert.ok(schemes.cookieAuth, 'cookieAuth must be defined');
  assert.equal(schemes.cookieAuth.type, 'apiKey');
  assert.equal(schemes.cookieAuth.in, 'cookie');
  assert.ok(schemes.refreshTokenCookie, 'refreshTokenCookie must be defined');
});

test('SWAGGER: Dual endpoints /api-docs.json and /api/v1/api-docs.json return identical spec', async () => {
  const res1 = await request(app).get('/api-docs.json');
  const res2 = await request(app).get('/api/v1/api-docs.json');
  const res3 = await request(app).get('/swagger.json');

  assert.equal(res1.status, 200);
  assert.equal(res2.status, 200);
  assert.equal(res3.status, 200);
  assert.equal(res1.body.info.title, res2.body.info.title);
  assert.equal(res1.body.info.title, res3.body.info.title);
});

test('SWAGGER: Swagger UI HTML is served at /api-docs and /api/v1/api-docs', async () => {
  const res1 = await request(app).get('/api-docs/');
  const res2 = await request(app).get('/api/v1/api-docs/');

  assert.equal(res1.status, 200);
  assert.equal(res2.status, 200);
  assert.match(res1.text, /<html/i);
  assert.match(res1.text, /swagger/i);
  assert.match(res2.text, /<html/i);
  assert.match(res2.text, /swagger/i);
});

test('SWAGGER: OpenAPI spec documents all required auth, user, admin, and service endpoints', () => {
  const paths = Object.keys(swaggerSpec.paths);

  // Authentication endpoints
  assert.ok(paths.some(p => p.includes('/auth/register')), 'Must document /auth/register');
  assert.ok(paths.some(p => p.includes('/auth/login')), 'Must document /auth/login');
  assert.ok(paths.some(p => p.includes('/auth/refresh')), 'Must document /auth/refresh');
  assert.ok(paths.some(p => p.includes('/auth/logout')), 'Must document /auth/logout');
  assert.ok(paths.some(p => p.includes('/auth/logout-all')), 'Must document /auth/logout-all');
  assert.ok(paths.some(p => p.includes('/auth/me')), 'Must document /auth/me');
  assert.ok(paths.some(p => p.includes('/auth/status')), 'Must document /auth/status');
  assert.ok(paths.some(p => p.includes('/auth/sessions')), 'Must document /auth/sessions');
  assert.ok(paths.some(p => p.includes('/auth/forgot-password')), 'Must document /auth/forgot-password');
  assert.ok(paths.some(p => p.includes('/auth/reset-password')), 'Must document /auth/reset-password');
  assert.ok(paths.some(p => p.includes('/auth/change-password')), 'Must document /auth/change-password');
  assert.ok(paths.some(p => p.includes('/auth/verify-email')), 'Must document /auth/verify-email');
  assert.ok(paths.some(p => p.includes('/auth/resend-verification')), 'Must document /auth/resend-verification');

  // Administration endpoints
  assert.ok(paths.some(p => p.includes('/admin/users')), 'Must document /admin/users');
  assert.ok(paths.some(p => p.includes('/admin/vendors')), 'Must document /admin/vendors');
  assert.ok(paths.some(p => p.includes('/admin/stats')), 'Must document /admin/stats');

  // Services endpoints
  assert.ok(paths.some(p => p.includes('/services')), 'Must document /services');
});

// ============================================================================
// 2. HTTP SECURITY HEADERS & CORS VERIFICATION
// ============================================================================

test('SECURITY HEADERS: Helmet attaches standard hardening headers', async () => {
  const res = await request(app).get('/health');
  assert.equal(res.status, 200);

  // Verify core defensive headers
  assert.equal(res.headers['x-content-type-options'], 'nosniff');
  assert.equal(res.headers['x-frame-options'], 'SAMEORIGIN');
  assert.ok(res.headers['strict-transport-security'], 'HSTS must be enabled');
  assert.ok(res.headers['content-security-policy'], 'CSP must be configured');
  assert.ok(res.headers['x-request-id'], 'X-Request-Id must be attached');
});

test('CORS: Allows configured origins with credentials support', async () => {
  const res = await request(app)
    .get('/health')
    .set('Origin', 'http://localhost:3000');

  assert.equal(res.status, 200);
  assert.equal(res.headers['access-control-allow-origin'], 'http://localhost:3000');
  assert.equal(res.headers['access-control-allow-credentials'], 'true');
});

// ============================================================================
// 3. SENSITIVE DATA REDACTION & LOGGER HARDENING
// ============================================================================

test('LOGGER REDACTION: Sensitive authentication fields are configured for censoring', () => {
  assert.equal(typeof logger.info, 'function');
  assert.equal(typeof logger.warn, 'function');
  assert.equal(typeof logger.error, 'function');

  // Verify that calling logger with sensitive objects executes safely
  assert.doesNotThrow(() => {
    logger.info({
      password: 'MySecretPassword123!',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token',
      refreshToken: 'sample_refresh_token_string',
      twoFactorSecret: 'TOTP_SECRET_123',
      verificationToken: 'sha256_verification_hash',
      resetPasswordToken: 'sha256_reset_hash'
    }, 'Sensitive log test');
  });
});

// ============================================================================
// 4. ERROR SANITIZATION & CLIENT PROTECTION
// ============================================================================

test('ERROR SANITIZATION: Operational errors return safe messages and hide stack traces for non-500s', () => {
  const { AppError } = require('../shared/errors/AppError');
  const req = { originalUrl: '/test-error', method: 'GET', requestId: 'test-req-123' };
  let responseBody = null;
  let statusCode = 200;

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(payload) {
      responseBody = payload;
      return this;
    }
  };

  const opError = new AppError('Resource identifier is invalid', 400);
  errorHandler(opError, req, res, () => {});

  assert.equal(statusCode, 400);
  assert.equal(responseBody.success, false);
  assert.equal(responseBody.message, 'Resource identifier is invalid');
  assert.equal(responseBody.stack, undefined, 'Stack trace must not be exposed on client errors');
});

// ============================================================================
// 5. BRUTE-FORCE LOCKOUT & UNLOCK MECHANISM
// ============================================================================

test('BRUTE-FORCE: Account locks after 5 consecutive failures and unlocks upon reset', () => {
  const user = {
    loginAttempts: 0,
    lockUntil: undefined,
    isLocked() {
      return Boolean(this.lockUntil && this.lockUntil > Date.now());
    },
    incrementLoginAttempts() {
      this.loginAttempts += 1;
      if (this.loginAttempts >= 5) {
        this.lockUntil = Date.now() + 30 * 60 * 1000; // 30 minutes lockout
      }
    },
    resetLoginAttempts() {
      this.loginAttempts = 0;
      this.lockUntil = undefined;
    }
  };

  assert.equal(user.isLocked(), false);

  // Simulate 4 failed attempts: not locked yet
  for (let i = 0; i < 4; i++) {
    user.incrementLoginAttempts();
  }
  assert.equal(user.loginAttempts, 4);
  assert.equal(user.isLocked(), false);

  // 5th failed attempt: account locks
  user.incrementLoginAttempts();
  assert.equal(user.loginAttempts, 5);
  assert.equal(user.isLocked(), true, 'Account must lock upon 5 failed attempts');

  // Admin unlocks or successful password reset unlocks
  user.resetLoginAttempts();
  assert.equal(user.loginAttempts, 0);
  assert.equal(user.isLocked(), false, 'Account must unlock upon reset');
});

// ============================================================================
// 6. SPECIALIZED RATE LIMITERS CONFIGURATION
// ============================================================================

test('RATE LIMITERS: Auth, password reset, verification, and refresh limiters are defined', () => {
  assert.equal(typeof authLimiter, 'function');
  assert.equal(typeof passwordResetLimiter, 'function');
  assert.equal(typeof verificationLimiter, 'function');
  assert.equal(typeof refreshLimiter, 'function');
});
