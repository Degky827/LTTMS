const test = require('node:test');
const assert = require('node:assert/strict');
const logger = require('../utils/logger');
const { requestContext } = require('../middleware/requestContext');

test('LOGGER: exports a valid Pino logger instance', () => {
  assert.equal(typeof logger.info, 'function');
  assert.equal(typeof logger.error, 'function');
  assert.equal(typeof logger.warn, 'function');
  assert.equal(typeof logger.debug, 'function');
});

test('REQUEST CONTEXT: attaches requestId to req and X-Request-Id header to res', () => {
  const req = { headers: {} };
  const res = {
    headers: {},
    setHeader(key, value) {
      this.headers[key] = value;
    }
  };
  let nextCalled = false;

  requestContext(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.ok(req.requestId);
  assert.equal(res.headers['X-Request-Id'], req.requestId);
});

test('REQUEST CONTEXT: preserves existing x-request-id from incoming client header', () => {
  const customId = 'custom-client-uuid-12345';
  const req = { headers: { 'x-request-id': customId } };
  const res = {
    headers: {},
    setHeader(key, value) {
      this.headers[key] = value;
    }
  };

  requestContext(req, res, () => {});

  assert.equal(req.requestId, customId);
  assert.equal(res.headers['X-Request-Id'], customId);
});
