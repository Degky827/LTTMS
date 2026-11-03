const test = require('node:test');
const assert = require('node:assert/strict');
const { z } = require('zod');
const validate = require('../middleware/validate');

test('VALIDATE: passes valid body and updates req.validated', () => {
  const schema = z.object({
    body: z.object({
      title: z.string().min(3),
      price: z.coerce.number().positive()
    })
  });

  const req = {
    body: { title: 'Boat Tour', price: '45.5' },
    query: {},
    params: {},
    requestId: 'test-req-val-1'
  };
  let responseStatus = null;
  let nextCalled = false;
  const res = {
    status(code) {
      responseStatus = code;
      return this;
    },
    json() {
      return this;
    }
  };

  const middleware = validate(schema);
  middleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(responseStatus, null);
  assert.equal(req.body.price, 45.5); // Coerced to number
  assert.equal(req.validated.body.title, 'Boat Tour');
});

test('VALIDATE: rejects invalid body with 400 and clear error paths', () => {
  const schema = z.object({
    body: z.object({
      email: z.string().email(),
      age: z.number().min(18)
    })
  });

  const req = {
    body: { email: 'not-an-email', age: 15 },
    query: {},
    params: {},
    requestId: 'test-req-val-2'
  };
  let responseStatus = null;
  let responseBody = null;
  let nextCalled = false;
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

  const middleware = validate(schema);
  middleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(responseStatus, 400);
  assert.equal(responseBody.success, false);
  assert.equal(responseBody.errors.length, 2);
  assert.equal(responseBody.errors[0].field, 'email');
  assert.equal(responseBody.errors[1].field, 'age');
  assert.equal(responseBody.requestId, 'test-req-val-2');
});
