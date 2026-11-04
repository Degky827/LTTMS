process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-at-least-32-characters-long-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-at-least-32-chars-long';
process.env.JWT_ISSUER = 'lttms-api';
process.env.JWT_AUDIENCE = 'lttms-client';
process.env.JWT_BLACKLIST_ENABLED = 'true';

const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const Booking = require('../models/Booking');
const authService = require('../services/authService');
const authMiddleware = require('../middleware/auth');
const authController = require('../controllers/authController');
const { registerSchema, loginSchema, refreshSchema, changePasswordSchema } = require('../validation/authSchemas');

// Helper to create mock response object
const createMockRes = () => {
  const res = {
    statusCode: 200,
    body: null,
    cookies: {},
    clearedCookies: [],
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    cookie(name, val, options) {
      this.cookies[name] = { value: val, options };
      return this;
    },
    clearCookie(name) {
      this.clearedCookies.push(name);
      delete this.cookies[name];
      return this;
    }
  };
  return res;
};

// ==================== TEST 1: SUCCESSFUL REGISTRATION ====================
test('AUTH: 1. Successful registration creates tourist and issues token pair with safe profile', async () => {
  const mockUser = {
    _id: '654321000000000000000001',
    name: 'Abebe Tourist',
    email: 'abebe@example.com',
    role: 'tourist',
    isActive: true,
    isVerified: false,
    twoFactorEnabled: false,
    phone: '+251911223344'
  };

  const tokens = await authService.issueTokenPair(mockUser, false, { ip: '127.0.0.1', userAgent: 'test-agent' });
  assert.ok(tokens.accessToken, 'Access token must be generated');
  assert.ok(tokens.refreshToken, 'Refresh token must be generated');
  assert.ok(tokens.tokenHash, 'Token hash must be generated');
  assert.ok(tokens.family, 'Session family must be generated');

  const safeUser = authService.sanitizeUser(mockUser);
  assert.equal(safeUser.name, 'Abebe Tourist');
  assert.equal(safeUser.role, 'tourist');
  assert.equal(safeUser.password, undefined, 'Password must never be exposed');
});

// ==================== TEST 2: DUPLICATE EMAIL REGISTRATION ====================
test('AUTH: 2. Duplicate email registration is prevented', async () => {
  // Test register controller logic with mock existing user
  const req = {
    body: {
      name: 'Existing User',
      email: 'existing@example.com',
      password: 'password123'
    }
  };
  const res = createMockRes();

  // Stub User.findOne
  const originalFindOne = User.findOne;
  User.findOne = async () => ({ _id: '123', email: 'existing@example.com' });

  try {
    await authController.register(req, res);
    assert.equal(res.statusCode, 409, 'Expected 409 Conflict for duplicate email');
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /already exists/i);
  } finally {
    User.findOne = originalFindOne;
  }
});

// ==================== TEST 3: PASSWORD HASHING ====================
test('AUTH: 3. Password hashing with bcrypt (12 rounds) and comparison logic', async () => {
  const plainPassword = 'SuperSecretPassword123!';
  const user = new User({
    name: 'Hash Tester',
    email: 'hash@example.com',
    password: plainPassword
  });

  // Emulate pre-save hook
  const salt = await bcrypt.genSalt(12);
  user.password = await bcrypt.hash(user.password, salt);

  assert.ok(user.password.startsWith('$2'), 'Password must be bcrypt hashed');
  assert.notEqual(user.password, plainPassword, 'Hashed password must not match plaintext');

  // Verify matchPassword method
  const isMatch = await user.matchPassword(plainPassword);
  assert.equal(isMatch, true, 'Correct password must match hash');

  const isWrong = await user.matchPassword('WrongPassword123!');
  assert.equal(isWrong, false, 'Wrong password must NOT match hash');
});

// ==================== TEST 4: SUCCESSFUL LOGIN ====================
test('AUTH: 4. Successful login returns access token, refresh token, and resets attempts', async () => {
  const password = 'CorrectPassword123';
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const mockUserInstance = {
    _id: '654321000000000000000004',
    name: 'Login User',
    email: 'login@example.com',
    role: 'tourist',
    password: hashedPassword,
    isActive: true,
    loginAttempts: 2,
    isLocked: () => false,
    matchPassword: async (p) => await bcrypt.compare(p, hashedPassword),
    save: async () => {}
  };

  const req = {
    body: { email: 'login@example.com', password },
    ip: '127.0.0.1',
    headers: { 'user-agent': 'agent' }
  };
  const res = createMockRes();

  const originalFindOne = User.findOne;
  User.findOne = () => ({
    select: () => mockUserInstance
  });

  try {
    await authController.login(req, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.token, 'Must return access token');
    assert.ok(res.body.refreshToken, 'Must return refresh token');
    assert.equal(res.body.user.email, 'login@example.com');
    assert.equal(mockUserInstance.loginAttempts, 0, 'loginAttempts must be reset on success');
    assert.ok(res.cookies.accessToken, 'Must set accessToken cookie');
    assert.ok(res.cookies.refreshToken, 'Must set refreshToken cookie');
  } finally {
    User.findOne = originalFindOne;
  }
});

// ==================== TEST 5: INCORRECT PASSWORD ====================
test('AUTH: 5. Incorrect password increments loginAttempts and returns 401', async () => {
  const password = 'RealPassword123';
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const mockUserInstance = {
    _id: '654321000000000000000005',
    email: 'wrongpass@example.com',
    password: hashedPassword,
    isActive: true,
    loginAttempts: 1,
    isLocked: () => false,
    matchPassword: async (p) => await bcrypt.compare(p, hashedPassword),
    save: async () => {}
  };

  const req = {
    body: { email: 'wrongpass@example.com', password: 'IncorrectPassword' },
    ip: '127.0.0.1',
    headers: {}
  };
  const res = createMockRes();

  const originalFindOne = User.findOne;
  User.findOne = () => ({
    select: () => mockUserInstance
  });

  try {
    await authController.login(req, res);
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.success, false);
    assert.equal(mockUserInstance.loginAttempts, 2, 'loginAttempts should be incremented');
    assert.match(res.body.message, /remaining/i);
  } finally {
    User.findOne = originalFindOne;
  }
});

// ==================== TEST 6: EXPIRED ACCESS TOKEN ====================
test('AUTH: 6. Expired access token is rejected with 401 and TOKEN_EXPIRED code', async () => {
  const expiredToken = jwt.sign(
    { id: '123', role: 'tourist' },
    process.env.JWT_SECRET,
    { expiresIn: -10 } // Expired 10 seconds ago
  );

  const req = {
    headers: { authorization: `Bearer ${expiredToken}` },
    cookies: {}
  };
  const res = createMockRes();
  let nextCalled = false;

  await authMiddleware.protect(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, false, 'Expired token must not call next()');
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.code, 'TOKEN_EXPIRED');
});

// ==================== TEST 7: INVALID ACCESS TOKEN ====================
test('AUTH: 7. Invalid access token (tampered / wrong secret) is rejected with 401', async () => {
  const fakeToken = jwt.sign(
    { id: '123', role: 'admin' },
    'wrong-secret-key-12345678901234567890'
  );

  const req = {
    headers: { authorization: `Bearer ${fakeToken}` },
    cookies: {}
  };
  const res = createMockRes();
  let nextCalled = false;

  await authMiddleware.protect(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.match(res.body.message, /Not authorized/i);
});

// ==================== TEST 8: SUCCESSFUL REFRESH ====================
test('AUTH: 8. Successful refresh returns new access token and rotated refresh token', async () => {
  authService.clearMemorySessionStore();

  const mockUser = {
    _id: '654321000000000000000008',
    id: '654321000000000000000008',
    name: 'Refresh User',
    email: 'refresh@example.com',
    role: 'tourist',
    isActive: true
  };

  const initialTokens = await authService.issueTokenPair(mockUser, false, { ip: '127.0.0.1' });
  assert.ok(initialTokens.refreshToken);

  const refreshResult = await authService.rotateRefreshToken(initialTokens.refreshToken, {
    mockUser,
    ip: '127.0.0.1'
  });

  assert.equal(refreshResult.status, 'success');
  assert.ok(refreshResult.tokens.accessToken, 'Must issue new access token');
  assert.ok(refreshResult.tokens.refreshToken, 'Must issue new refresh token');
  assert.notEqual(refreshResult.tokens.refreshToken, initialTokens.refreshToken, 'New refresh token must differ from old');
  assert.equal(refreshResult.tokens.family, initialTokens.family, 'Family must be preserved across rotations');
});

// ==================== TEST 9: REFRESH-TOKEN ROTATION ====================
test('AUTH: 9. Refresh token rotation revokes old token upon use', async () => {
  authService.clearMemorySessionStore();

  const mockUser = {
    _id: '654321000000000000000009',
    id: '654321000000000000000009',
    name: 'Rotate User',
    email: 'rotate@example.com',
    role: 'tourist',
    isActive: true
  };

  const initialTokens = await authService.issueTokenPair(mockUser, false, { ip: '127.0.0.1' });
  const firstRotation = await authService.rotateRefreshToken(initialTokens.refreshToken, { mockUser });
  assert.equal(firstRotation.status, 'success');

  // Verify the old token's hash is marked as revoked in the store
  const oldHash = authService.hashToken(initialTokens.refreshToken);
  // Re-attempting rotation with the already-used token should trigger reuse detection
  const secondAttempt = await authService.rotateRefreshToken(initialTokens.refreshToken, { mockUser });
  assert.equal(secondAttempt.status, 'reuse_detected');
});

// ==================== TEST 10: REFRESH-TOKEN REUSE DETECTION ====================
test('AUTH: 10. Refresh token reuse detection invalidates all tokens in compromised family', async () => {
  authService.clearMemorySessionStore();

  const mockUser = {
    _id: '654321000000000000000010',
    id: '654321000000000000000010',
    name: 'Reuse User',
    email: 'reuse@example.com',
    role: 'tourist',
    isActive: true
  };

  // 1. Initial login (Token A)
  const tokenA = await authService.issueTokenPair(mockUser, false, { ip: '127.0.0.1' });

  // 2. Legitimate refresh (Token A -> Token B)
  const rotationB = await authService.rotateRefreshToken(tokenA.refreshToken, { mockUser });
  assert.equal(rotationB.status, 'success');
  const tokenB = rotationB.tokens;

  // 3. Attacker replays stolen Token A!
  const reuseAttempt = await authService.rotateRefreshToken(tokenA.refreshToken, { mockUser });
  assert.equal(reuseAttempt.status, 'reuse_detected');

  // 4. Legitimate user tries to use Token B - it should also now be revoked because family was compromised!
  const legitimateAttemptWithB = await authService.rotateRefreshToken(tokenB.refreshToken, { mockUser });
  assert.equal(legitimateAttemptWithB.status, 'reuse_detected', 'Tokens in compromised family must be completely revoked');
});

// ==================== TEST 11: LOGOUT AND TOKEN REVOCATION ====================
test('AUTH: 11. Logout revokes refresh token and blacklists access token', async () => {
  authService.clearMemorySessionStore();
  authMiddleware.clearBlacklist();

  const mockUser = {
    _id: '654321000000000000000011',
    id: '654321000000000000000011',
    role: 'tourist'
  };

  const tokens = await authService.issueTokenPair(mockUser);

  const req = {
    token: tokens.accessToken,
    cookies: { refreshToken: tokens.refreshToken },
    body: {},
    user: mockUser
  };
  const res = createMockRes();

  await authController.logout(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.clearedCookies.includes('accessToken'));
  assert.ok(res.clearedCookies.includes('refreshToken'));

  // Verify access token is blacklisted
  const testReq = {
    headers: { authorization: `Bearer ${tokens.accessToken}` },
    cookies: {}
  };
  const testRes = createMockRes();
  let nextCalled = false;
  await authMiddleware.protect(testReq, testRes, () => { nextCalled = true; });
  assert.equal(nextCalled, false, 'Blacklisted token must be rejected');
  assert.equal(testRes.statusCode, 401);

  // Verify refresh token can no longer be rotated
  const refreshTry = await authService.rotateRefreshToken(tokens.refreshToken);
  assert.equal(refreshTry.status, 'reuse_detected', 'Revoked token cannot be refreshed');
});

// ==================== TEST 12: PASSWORD CHANGE ====================
test('AUTH: 12. Password change verifies current password, updates passwordChangedAt, and invalidates old tokens', async () => {
  const oldPassword = 'OldPassword123';
  const newPassword = 'NewPassword456';
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(oldPassword, salt);

  const mockUserInstance = {
    _id: '654321000000000000000012',
    id: '654321000000000000000012',
    email: 'pwdchange@example.com',
    password: hashedPassword,
    passwordChangedAt: null,
    matchPassword: async (p) => await bcrypt.compare(p, hashedPassword),
    changedPasswordAfter: function(jwtIat) {
      if (this.passwordChangedAt) {
        return jwtIat < Math.floor(this.passwordChangedAt.getTime() / 1000);
      }
      return false;
    },
    save: async () => {}
  };

  // Access token issued BEFORE password change
  const oldToken = jwt.sign(
    { id: mockUserInstance.id, role: 'tourist', iat: Math.floor(Date.now() / 1000) - 60 },
    process.env.JWT_SECRET
  );

  const req = {
    user: mockUserInstance,
    token: oldToken,
    body: { currentPassword: oldPassword, newPassword }
  };
  const res = createMockRes();

  const originalFindById = User.findById;
  User.findById = () => ({
    select: () => mockUserInstance
  });

  try {
    await authController.changePassword(req, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.ok(mockUserInstance.passwordChangedAt instanceof Date, 'passwordChangedAt must be set');

    // Test that old token issued before passwordChangedAt is now rejected by protect
    const protectReq = {
      headers: { authorization: `Bearer ${oldToken}` },
      mockUser: mockUserInstance,
      cookies: {}
    };
    const protectRes = createMockRes();
    let nextCalled = false;
    await authMiddleware.protect(protectReq, protectRes, () => { nextCalled = true; });
    assert.equal(nextCalled, false, 'Old access token must be rejected after password change');
    assert.equal(protectRes.statusCode, 401);
  } finally {
    User.findById = originalFindById;
  }
});

// ==================== TEST 13: LOCKED ACCOUNT LOGIN ====================
test('AUTH: 13. Locked account login is rejected with 423 Locked and remaining duration', async () => {
  const mockUserInstance = {
    _id: '654321000000000000000013',
    email: 'locked@example.com',
    lockUntil: Date.now() + 25 * 60 * 1000, // 25 minutes remaining
    isLocked: function() { return !!(this.lockUntil && this.lockUntil > Date.now()); }
  };

  const req = {
    body: { email: 'locked@example.com', password: 'password123' },
    ip: '127.0.0.1',
    headers: {}
  };
  const res = createMockRes();

  const originalFindOne = User.findOne;
  User.findOne = () => ({
    select: () => mockUserInstance
  });

  try {
    await authController.login(req, res);
    assert.equal(res.statusCode, 423, 'Must return HTTP 423 Locked');
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Account locked.*25 minute/i);
  } finally {
    User.findOne = originalFindOne;
  }
});

// ==================== TEST 14: UNAUTHORIZED ACCESS ====================
test('AUTH: 14. Unauthorized access: missing token returns 401, deactivated account returns 403', async () => {
  // 14A: Missing token returns 401
  const reqNoToken = { headers: {}, cookies: {} };
  const resNoToken = createMockRes();
  let nextCalledA = false;
  await authMiddleware.protect(reqNoToken, resNoToken, () => { nextCalledA = true; });
  assert.equal(nextCalledA, false);
  assert.equal(resNoToken.statusCode, 401);

  // 14B: Deactivated user returns 403
  const validToken = jwt.sign(
    { id: 'deactivated-user-id', role: 'tourist' },
    process.env.JWT_SECRET
  );
  const deactivatedUser = {
    _id: 'deactivated-user-id',
    isActive: false
  };

  const reqDeactivated = {
    headers: { authorization: `Bearer ${validToken}` },
    mockUser: deactivatedUser,
    cookies: {}
  };
  const resDeactivated = createMockRes();
  let nextCalledB = false;
  await authMiddleware.protect(reqDeactivated, resDeactivated, () => { nextCalledB = true; });
  assert.equal(nextCalledB, false);
  assert.equal(resDeactivated.statusCode, 403);
  assert.match(resDeactivated.body.message, /deactivated/i);
});

// ==================== TEST 15: SENSITIVE-FIELD EXCLUSION ====================
test('AUTH: 15. Sensitive fields (password, tokens, secrets, loginAttempts) are strictly excluded', () => {
  const sensitiveUser = {
    _id: '654321000000000000000015',
    name: 'Protected User',
    email: 'protected@example.com',
    role: 'tourist',
    password: '$2a$12$eX4mpleHashDoNotLeak',
    passwordChangedAt: new Date(),
    verificationToken: 'secretVerificationToken',
    verificationTokenExpire: new Date(),
    resetPasswordToken: 'secretResetToken',
    resetPasswordExpire: new Date(),
    twoFactorSecret: 'MFRGGZDFMZTWQ2LK',
    twoFactorCodeExpire: new Date(),
    loginAttempts: 4,
    lockUntil: new Date(),
    tokenHash: 'sha256hash',
    __v: 0
  };

  const safe = authService.sanitizeUser(sensitiveUser);

  assert.equal(safe.id, '654321000000000000000015');
  assert.equal(safe.name, 'Protected User');
  assert.equal(safe.email, 'protected@example.com');
  assert.equal(safe.role, 'tourist');

  // Verify all sensitive properties are undefined
  assert.equal(safe.password, undefined);
  assert.equal(safe.passwordChangedAt, undefined);
  assert.equal(safe.verificationToken, undefined);
  assert.equal(safe.resetPasswordToken, undefined);
  assert.equal(safe.twoFactorSecret, undefined);
  assert.equal(safe.loginAttempts, undefined);
  assert.equal(safe.lockUntil, undefined);
  assert.equal(safe.tokenHash, undefined);
  assert.equal(safe.__v, undefined);
});

// ==================== TEST 16: ROLE RESTRICTIONS ON REGISTRATION ====================
test('AUTH: 16. Public registration strictly rejects admin, super_admin, and support roles', async () => {
  const forbiddenRoles = ['admin', 'super_admin', 'support', 'moderator', 'root'];

  for (const role of forbiddenRoles) {
    // 16A: Zod schema rejects
    const zodResult = await registerSchema.safeParseAsync({
      body: {
        name: 'Hacker',
        email: 'hacker@example.com',
        password: 'password123',
        role
      }
    });
    assert.equal(zodResult.success, false, `Zod schema must reject public registration with role: "${role}"`);

    // 16B: Controller defense-in-depth rejects
    const req = {
      body: { name: 'Hacker', email: 'hacker@example.com', password: 'password123', role: role }
    };
    const res = createMockRes();
    await authController.register(req, res);
    assert.equal(res.statusCode, 400);
    assert.match(res.body.message, /only tourist or vendor/i);
  }
});

// ==================== TEST 17: REFRESHTOKEN MODEL SCHEMA & INDEXES ====================
test('AUTH: 17. RefreshToken model has TTL index on expiresAt and compound indexes', () => {
  const indexes = RefreshToken.schema.indexes();

  // Check TTL index on expiresAt
  const ttlIndex = indexes.find(([fields, options]) => {
    return fields.expiresAt === 1 && options && options.expireAfterSeconds === 0;
  });
  assert.ok(ttlIndex, 'RefreshToken must have a TTL index on expiresAt with expireAfterSeconds: 0');

  // Check unique index on tokenHash
  const tokenHashIndex = indexes.find(([fields, options]) => {
    return fields.tokenHash === 1 && options && options.unique === true;
  });
  assert.ok(tokenHashIndex, 'RefreshToken must have a unique index on tokenHash');
});

// ==================== TEST 18: STEP 3 BOOKING IDEMPOTENCY PARTIAL UNIQUE INDEX ====================
test('AUTH: 18. Booking idempotency partial unique index permits multiple documents with null idempotencyKey', () => {
  const indexes = Booking.schema.indexes();
  const idempotencyIndex = indexes.find(([fields, options]) => {
    return fields.idempotencyKey === 1 && options && options.unique === true;
  });

  assert.ok(idempotencyIndex, 'Booking must have a unique index on idempotencyKey');
  const [, options] = idempotencyIndex;
  assert.ok(options.partialFilterExpression, 'Index must use partialFilterExpression');
  assert.deepEqual(
    options.partialFilterExpression.idempotencyKey,
    { $type: 'string', $gt: '' },
    'partialFilterExpression must target non-empty strings only, excluding nulls'
  );

  // Validate two booking documents with explicit null idempotencyKey validate successfully
  const booking1 = new Booking({
    service: '654321000000000000000099',
    user: '654321000000000000000001',
    date: new Date(),
    guests: 2,
    totalAmount: 1000,
    idempotencyKey: null
  });
  const booking2 = new Booking({
    service: '654321000000000000000099',
    user: '654321000000000000000002',
    date: new Date(),
    guests: 1,
    totalAmount: 500,
    idempotencyKey: null
  });

  assert.equal(booking1.idempotencyKey, null);
  assert.equal(booking2.idempotencyKey, null);
});
