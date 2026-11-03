const test = require('node:test');
const assert = require('node:assert/strict');
const {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError
} = require('../shared/errors/AppError');
const { errorHandler, notFound } = require('../middleware/errorHandlers');

test('ERRORS: AppError subclasses set correct status codes and operational flags', () => {
  const badReq = new BadRequestError('Bad input', [{ field: 'email', message: 'invalid' }]);
  assert.equal(badReq.statusCode, 400);
  assert.equal(badReq.isOperational, true);
  assert.equal(badReq.errors.length, 1);

  const unauth = new UnauthorizedError();
  assert.equal(unauth.statusCode, 401);

  const forb = new ForbiddenError();
  assert.equal(forb.statusCode, 403);

  const notF = new NotFoundError('Service not found');
  assert.equal(notF.statusCode, 404);
  assert.equal(notF.message, 'Service not found');

  const conf = new ConflictError();
  assert.equal(conf.statusCode, 409);

  const valErr = new ValidationError();
  assert.equal(valErr.statusCode, 422);
});

test('ERRORS: notFound middleware returns 404 with requestId', () => {
  const req = { originalUrl: '/api/v1/unknown', method: 'GET', requestId: 'test-req-123' };
  let responseStatus = null;
  let responseBody = null;
  const res = {
    status(code) {
      responseStatus = code;
      return this;
    },
    json(body) {
      responseBody = body;
      return this;
    }
  };

  notFound(req, res);

  assert.equal(responseStatus, 404);
  assert.equal(responseBody.success, false);
  assert.equal(responseBody.requestId, 'test-req-123');
  assert.ok(responseBody.message.includes('/api/v1/unknown'));
});

test('ERRORS: errorHandler middleware transforms Mongoose CastError to 400', () => {
  const castErr = new Error('Cast to ObjectId failed');
  castErr.name = 'CastError';
  castErr.value = 'invalid-id-xyz';

  const req = { originalUrl: '/api/v1/services/invalid-id-xyz', method: 'GET', requestId: 'test-req-456' };
  let responseStatus = null;
  let responseBody = null;
  const res = {
    status(code) {
      responseStatus = code;
      return this;
    },
    json(body) {
      responseBody = body;
      return this;
    }
  };

  errorHandler(castErr, req, res, () => {});

  assert.equal(responseStatus, 400);
  assert.equal(responseBody.success, false);
  assert.ok(responseBody.message.includes('Invalid resource identifier'));
  assert.equal(responseBody.requestId, 'test-req-456');
});

test('ERRORS: errorHandler middleware transforms Mongoose duplicate key 11000 to 409', () => {
  const dupErr = new Error('E11000 duplicate key error');
  dupErr.code = 11000;
  dupErr.keyValue = { email: 'duplicate@test.com' };

  const req = { originalUrl: '/api/v1/auth/register', method: 'POST', requestId: 'test-req-789' };
  let responseStatus = null;
  let responseBody = null;
  const res = {
    status(code) {
      responseStatus = code;
      return this;
    },
    json(body) {
      responseBody = body;
      return this;
    }
  };

  errorHandler(dupErr, req, res, () => {});

  assert.equal(responseStatus, 409);
  assert.equal(responseBody.success, false);
  assert.ok(responseBody.message.includes('Duplicate value entered for email'));
});
