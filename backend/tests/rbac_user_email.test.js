process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-at-least-32-characters-long-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-at-least-32-chars-long';
process.env.JWT_ISSUER = 'lttms-api';
process.env.JWT_AUDIENCE = 'lttms-client';
process.env.JWT_BLACKLIST_ENABLED = 'true';

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Vendor = require('../models/Vendor');
const authMiddleware = require('../middleware/auth');
const permissions = require('../middleware/permissions');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const serviceController = require('../controllers/serviceController');
const authService = require('../services/authService');
const sendEmail = require('../utils/email');

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

// ============================================================================
// SECTION 1: ROLE-BASED ACCESS CONTROL (RBAC) & ROLE ISOLATION
// ============================================================================

test('RBAC: 1. Tourist cannot access vendor administration or vendor-only routes', async () => {
  const req = {
    user: {
      _id: '654321000000000000000001',
      role: 'tourist',
      isActive: true,
      isVerified: true
    }
  };
  const res = createMockRes();
  let nextCalled = false;

  const vendorMiddleware = authMiddleware.authorize('vendor');
  vendorMiddleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false, 'Tourist must not be allowed on vendor-only route');
  assert.equal(res.statusCode, 403);
  assert.match(res.body.message, /not authorized/i);

  // Permission matrix check
  assert.equal(permissions.hasPermission('tourist', 'services:create:own'), false);
  assert.equal(permissions.hasPermission('tourist', 'vendor:profile:manage'), false);
  assert.equal(permissions.hasPermission('tourist', 'bookings:read:own'), true);
});

test('RBAC: 2. Unapproved vendor is blocked by requireApprovedVendor and service controller', async () => {
  const req = {
    user: {
      id: '654321000000000000000002',
      _id: '654321000000000000000002',
      role: 'vendor',
      isActive: true
    },
    body: { title: 'Boat Tour', price: 100 }
  };
  const res = createMockRes();
  let nextCalled = false;

  const originalFindOne = Vendor.findOne;
  // Mock vendor with status 'pending'
  Vendor.findOne = async () => ({
    _id: 'vendor_001',
    user: '654321000000000000000002',
    status: 'pending',
    businessName: 'Tana Boats'
  });

  try {
    await authMiddleware.requireApprovedVendor(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false, 'Unapproved vendor must not proceed');
    assert.equal(res.statusCode, 403);
    assert.equal(res.body.code, 'VENDOR_NOT_APPROVED');
    assert.equal(res.body.vendorStatus, 'pending');

    // Also test serviceController defense-in-depth
    const serviceRes = createMockRes();
    await serviceController.createService(req, serviceRes);
    assert.equal(serviceRes.statusCode, 403);
    assert.equal(serviceRes.body.code, 'VENDOR_NOT_APPROVED');
  } finally {
    Vendor.findOne = originalFindOne;
  }
});

test('RBAC: 3. Approved vendor is permitted through requireApprovedVendor', async () => {
  const req = {
    user: {
      id: '654321000000000000000003',
      _id: '654321000000000000000003',
      role: 'vendor',
      isActive: true
    }
  };
  const res = createMockRes();
  let nextCalled = false;

  const originalFindOne = Vendor.findOne;
  Vendor.findOne = async () => ({
    _id: 'vendor_002',
    user: '654321000000000000000003',
    status: 'approved',
    businessName: 'Approved Tana Tours'
  });

  try {
    await authMiddleware.requireApprovedVendor(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true, 'Approved vendor must be allowed through');
    assert.ok(req.vendor);
    assert.equal(req.vendor.status, 'approved');
  } finally {
    Vendor.findOne = originalFindOne;
  }
});

test('RBAC: 4. Admin and super_admin bypass vendor approval check', async () => {
  for (const role of ['admin', 'super_admin']) {
    const req = {
      user: {
        id: `65432100000000000000000${role === 'admin' ? '4' : '5'}`,
        role,
        isActive: true
      }
    };
    const res = createMockRes();
    let nextCalled = false;

    await authMiddleware.requireApprovedVendor(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true, `${role} must bypass vendor approval check`);
  }
});

test('RBAC: 5. Support role cannot access unrestricted admin routes', async () => {
  const req = {
    user: {
      _id: '654321000000000000000006',
      role: 'support',
      isActive: true
    }
  };
  const res = createMockRes();
  let nextCalled = false;

  const adminMiddleware = authMiddleware.authorize('admin', 'super_admin');
  adminMiddleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false, 'Support must be forbidden from admin routes');
  assert.equal(res.statusCode, 403);
  assert.match(res.body.message, /not authorized/i);

  // Permission matrix check
  assert.equal(permissions.hasPermission('support', 'users:role:assign'), false);
  assert.equal(permissions.hasPermission('support', 'support:tickets:manage'), true);
  assert.equal(permissions.hasPermission('support', 'bookings:read:support'), true);
});

test('RBAC: 6. Admin cannot assign admin or super_admin roles, nor modify existing admins', async () => {
  const originalFindById = User.findById;

  try {
    // Attempt 1: Regular admin attempts to promote user to 'admin'
    User.findById = async () => ({
      _id: 'user_target_01',
      role: 'tourist',
      save: async () => {}
    });

    const req1 = {
      user: { _id: 'admin_01', role: 'admin' },
      params: { id: 'user_target_01' },
      body: { role: 'admin' }
    };
    const res1 = createMockRes();

    await adminController.assignRole(req1, res1);
    assert.equal(res1.statusCode, 403);
    assert.match(res1.body.message, /Only super administrators can assign admin or super_admin/i);

    // Attempt 2: Regular admin attempts to promote user to 'super_admin'
    const req2 = {
      user: { _id: 'admin_01', role: 'admin' },
      params: { id: 'user_target_01' },
      body: { role: 'super_admin' }
    };
    const res2 = createMockRes();

    await adminController.assignRole(req2, res2);
    assert.equal(res2.statusCode, 403);

    // Attempt 3: Regular admin attempts to modify an existing admin's role
    User.findById = async () => ({
      _id: 'admin_02',
      role: 'admin',
      save: async () => {}
    });

    const req3 = {
      user: { _id: 'admin_01', role: 'admin' },
      params: { id: 'admin_02' },
      body: { role: 'tourist' }
    };
    const res3 = createMockRes();

    await adminController.assignRole(req3, res3);
    assert.equal(res3.statusCode, 403);
    assert.match(res3.body.message, /Only super administrators can alter administrator roles/i);
  } finally {
    User.findById = originalFindById;
  }
});

test('RBAC: 7. Super admin can assign admin role and invalidates user sessions', async () => {
  const originalFindById = User.findById;
  let targetSaved = false;

  const targetUser = {
    _id: '654321000000000000000010',
    name: 'Promoted Admin',
    email: 'newadmin@example.com',
    role: 'tourist',
    save: async () => {
      targetSaved = true;
    }
  };

  User.findById = async () => targetUser;

  // Issue a token session for targetUser first
  await authService.issueTokenPair(targetUser, false, { ip: '1.2.3.4', userAgent: 'test' });
  const activeBefore = await authService.getUserActiveSessions(targetUser._id);
  assert.ok(activeBefore.length > 0, 'Target user must have active session before role change');

  try {
    const req = {
      user: { _id: 'super_admin_01', role: 'super_admin' },
      params: { id: targetUser._id },
      body: { role: 'admin' }
    };
    const res = createMockRes();

    await adminController.assignRole(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(targetSaved, true);
    assert.equal(targetUser.role, 'admin');

    // Verify all active sessions were invalidated upon role change
    const activeAfter = await authService.getUserActiveSessions(targetUser._id);
    assert.equal(activeAfter.length, 0, 'Target user active sessions must be invalidated upon role change');
  } finally {
    User.findById = originalFindById;
  }
});

test('RBAC: 8. Ownership verification permits owner and blocks unauthorized users', async () => {
  const ownerId = '654321000000000000000020';
  const otherUserId = '654321000000000000000021';
  const adminId = '654321000000000000000022';

  const mockBooking = { _id: 'booking_001', user: ownerId };
  const getBookingOwner = async (req) => mockBooking.user;
  const ownershipMiddleware = authMiddleware.requireOwnership(getBookingOwner);

  // Case A: Owner accessing their booking -> ALLOWED
  const reqOwner = { user: { id: ownerId, role: 'tourist' } };
  const resOwner = createMockRes();
  let ownerPassed = false;
  await ownershipMiddleware(reqOwner, resOwner, () => { ownerPassed = true; });
  assert.equal(ownerPassed, true);

  // Case B: Another user accessing booking -> REJECTED (403)
  const reqOther = { user: { id: otherUserId, role: 'tourist' } };
  const resOther = createMockRes();
  let otherPassed = false;
  await ownershipMiddleware(reqOther, resOther, () => { otherPassed = true; });
  assert.equal(otherPassed, false);
  assert.equal(resOther.statusCode, 403);
  assert.match(resOther.body.message, /denied|permission/i);

  // Case C: Admin accessing booking -> ALLOWED (bypass)
  const reqAdmin = { user: { id: adminId, role: 'admin' } };
  const resAdmin = createMockRes();
  let adminPassed = false;
  await ownershipMiddleware(reqAdmin, resAdmin, () => { adminPassed = true; });
  assert.equal(adminPassed, true);
});

test('RBAC: 9. requireVerifiedEmail blocks unverified users and allows verified users', () => {
  // Unverified user
  const reqUnverified = { user: { id: 'u1', isVerified: false } };
  const resUnverified = createMockRes();
  let unverifiedPassed = false;
  authMiddleware.requireVerifiedEmail(reqUnverified, resUnverified, () => { unverifiedPassed = true; });
  assert.equal(unverifiedPassed, false);
  assert.equal(resUnverified.statusCode, 403);
  assert.equal(resUnverified.body.code, 'EMAIL_NOT_VERIFIED');

  // Verified user
  const reqVerified = { user: { id: 'u2', isVerified: true } };
  const resVerified = createMockRes();
  let verifiedPassed = false;
  authMiddleware.requireVerifiedEmail(reqVerified, resVerified, () => { verifiedPassed = true; });
  assert.equal(verifiedPassed, true);
});

// ============================================================================
// SECTION 2: PRIVILEGE ESCALATION & MASS ASSIGNMENT DEFENSE
// ============================================================================

test('PRIVILEGE ESCALATION: 10. Profile update strictly ignores privileged fields (role, status, password)', async () => {
  const originalFindById = User.findById;

  const mockUser = {
    _id: '654321000000000000000030',
    id: '654321000000000000000030',
    name: 'Initial Name',
    email: 'user@example.com',
    role: 'tourist',
    isActive: true,
    isSuspended: false,
    phone: '+251911000000',
    bio: 'Initial Bio',
    save: async function() { return this; }
  };

  User.findById = () => ({ select: () => mockUser, then: (resolve, reject) => Promise.resolve(mockUser).then(resolve, reject) });

  try {
    // Malicious payload attempting to escalate role to super_admin, modify status, and overwrite password
    const req = {
      user: { id: mockUser.id, role: 'tourist' },
      body: {
        name: 'Updated Name',
        phone: '+251922334455',
        bio: 'Updated Bio',
        // Malicious fields:
        role: 'super_admin',
        isActive: false,
        isSuspended: true,
        password: 'hacked_password_hash',
        loginAttempts: 99,
        lockUntil: new Date()
      }
    };
    const res = createMockRes();

    await authController.updateProfile(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(mockUser.name, 'Updated Name', 'Safe field name must be updated');
    assert.equal(mockUser.phone, '+251922334455', 'Safe field phone must be updated');
    assert.equal(mockUser.bio, 'Updated Bio', 'Safe field bio must be updated');

    // Privileged fields MUST remain intact
    assert.equal(mockUser.role, 'tourist', 'Role must NEVER be changed via profile update');
    assert.equal(mockUser.isActive, true, 'isActive must NEVER be changed via profile update');
    assert.equal(mockUser.isSuspended, false, 'isSuspended must NEVER be changed via profile update');
    assert.equal(mockUser.password, undefined, 'Password must not be overwritten via profile update');
  } finally {
    User.findById = originalFindById;
  }
});

// ============================================================================
// SECTION 3: USER & SESSION MANAGEMENT
// ============================================================================

test('USER MANAGEMENT: 11. Profile retrieval (/me) returns sanitized user with safe fields only', async () => {
  const originalFindById = User.findById;

  const sensitiveDbUser = {
    _id: '654321000000000000000040',
    name: 'Secure User',
    email: 'secure@example.com',
    role: 'tourist',
    password: '$2a$12$hashedPasswordShouldNeverBeReturnedInApiPayload',
    verificationToken: 'token_hash_123',
    resetPasswordToken: 'reset_hash_456',
    twoFactorSecret: 'TOTP_SECRET_ABC',
    isActive: true,
    isSuspended: false,
    isVerified: true
  };

  User.findById = async () => sensitiveDbUser;

  try {
    const req = { user: { id: sensitiveDbUser._id } };
    const res = createMockRes();

    await authController.getMe(req, res);

    assert.equal(res.statusCode, 200);
    assert.ok(res.body.success);
    const data = res.body.data;

    assert.equal(data.name, 'Secure User');
    assert.equal(data.email, 'secure@example.com');
    assert.equal(data.password, undefined, 'Password hash must be stripped');
    assert.equal(data.verificationToken, undefined, 'Verification token hash must be stripped');
    assert.equal(data.resetPasswordToken, undefined, 'Reset password hash must be stripped');
    assert.equal(data.twoFactorSecret, undefined, '2FA secret must be stripped');
  } finally {
    User.findById = originalFindById;
  }
});

test('USER MANAGEMENT: 12. Account status retrieval returns safe diagnostic state', async () => {
  const originalFindById = User.findById;

  const mockUser = {
    _id: '654321000000000000000041',
    id: '654321000000000000000041',
    email: 'status@example.com',
    role: 'tourist',
    isActive: true,
    isSuspended: false,
    suspendedReason: null,
    isVerified: true,
    twoFactorEnabled: false,
    isLocked: () => false,
    loginAttempts: 0,
    createdAt: new Date('2026-01-01')
  };

  User.findById = async () => mockUser;

  try {
    const req = { user: { id: mockUser.id } };
    const res = createMockRes();

    await authController.getAccountStatus(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.data.email, 'status@example.com');
    assert.equal(res.body.data.isActive, true);
    assert.equal(res.body.data.isSuspended, false);
    assert.equal(res.body.data.isLocked, false);
    assert.equal(res.body.data.isVerified, true);
  } finally {
    User.findById = originalFindById;
  }
});

test('USER MANAGEMENT: 13. Session listing and single session revocation', async () => {
  const mockUser = {
    _id: '654321000000000000000050',
    email: 'sessionuser@example.com',
    role: 'tourist',
    isActive: true
  };

  // Issue two sessions for this user
  await authService.issueTokenPair(mockUser, false, { ip: '10.0.0.1', userAgent: 'Chrome on Mac' });
  await authService.issueTokenPair(mockUser, false, { ip: '10.0.0.2', userAgent: 'Safari on iPhone' });

  // List active sessions
  const reqList = { user: mockUser };
  const resList = createMockRes();
  await authController.getActiveSessions(reqList, resList);

  assert.equal(resList.statusCode, 200);
  const activeSessions = resList.body.data;
  assert.ok(activeSessions.length >= 2, 'Must list all active sessions');

  // Find first session id
  const targetSessionId = activeSessions[0].id;
  assert.ok(targetSessionId, 'Session ID must exist in session items');

  // Revoke first session
  const reqRevoke = { user: mockUser, params: { id: targetSessionId } };
  const resRevoke = createMockRes();
  await authController.revokeSession(reqRevoke, resRevoke);

  assert.equal(resRevoke.statusCode, 200);
  assert.equal(resRevoke.body.success, true);

  // Revoking the same session again returns 404
  const resRevokeAgain = createMockRes();
  await authController.revokeSession(reqRevoke, resRevokeAgain);
  assert.equal(resRevokeAgain.statusCode, 404);
});

test('USER MANAGEMENT: 14. Admin account suspension revokes sessions and blocks login & protected routes', async () => {
  const originalFindById = User.findById;
  const originalFindOne = User.findOne;

  const hashedPassword = await bcrypt.hash('Password123!', 10);
  const mockUser = {
    _id: '654321000000000000000060',
    name: 'Suspended User',
    email: 'suspended@example.com',
    password: hashedPassword,
    role: 'tourist',
    isActive: true,
    isSuspended: false,
    suspendedReason: null,
    isLocked: () => false,
    matchPassword: async (pwd) => bcrypt.compare(pwd, hashedPassword),
    save: async function() { return this; }
  };

  User.findById = async () => mockUser;
  User.findOne = (query) => {
    let target = null;
    if (query?.email === mockUser.email || query?._id === mockUser._id) target = mockUser;
    return {
      select: () => target,
      then: (resolve, reject) => Promise.resolve(target).then(resolve, reject)
    };
  };

  try {
    // 1. Issue an active session for the user
    const tokens = await authService.issueTokenPair(mockUser, false, { ip: '1.1.1.1', userAgent: 'Agent' });
    const sessionsBefore = await authService.getUserActiveSessions(mockUser._id);
    assert.ok(sessionsBefore.length > 0);

    // 2. Admin suspends the user account
    const reqSuspend = {
      user: { _id: 'admin_master', role: 'admin' },
      params: { id: mockUser._id },
      body: { isSuspended: true, suspendedReason: 'Terms of service violation' }
    };
    const resSuspend = createMockRes();

    await adminController.updateUserStatus(reqSuspend, resSuspend);
    assert.equal(resSuspend.statusCode, 200);
    assert.equal(mockUser.isSuspended, true);
    assert.equal(mockUser.suspendedReason, 'Terms of service violation');

    // 3. Verify all sessions were automatically revoked on suspension
    const sessionsAfter = await authService.getUserActiveSessions(mockUser._id);
    assert.equal(sessionsAfter.length, 0, 'All sessions must be revoked on account suspension');

    // 4. Attempt login with suspended account -> REJECTED (403)
    const reqLogin = {
      body: { email: mockUser.email, password: 'Password123!' },
      headers: { 'user-agent': 'test' },
      ip: '127.0.0.1'
    };
    const resLogin = createMockRes();

    await authController.login(reqLogin, resLogin);
    assert.equal(resLogin.statusCode, 403);
    assert.match(resLogin.body.message, /Account is suspended/i);

    // 5. Attempt accessing protected route with access token -> REJECTED (403)
    const reqProtect = {
      headers: { authorization: `Bearer ${tokens.accessToken}` }
    };
    const resProtect = createMockRes();
    let protectPassed = false;

    await authMiddleware.protect(reqProtect, resProtect, () => {
      protectPassed = true;
    });

    assert.equal(protectPassed, false, 'Suspended user must not pass protect middleware');
    assert.equal(resProtect.statusCode, 403);
    assert.equal(resProtect.body.code, 'ACCOUNT_SUSPENDED');

    // 6. Admin reactivates the account
    const reqReactivate = {
      user: { _id: 'admin_master', role: 'admin' },
      params: { id: mockUser._id },
      body: { isSuspended: false }
    };
    const resReactivate = createMockRes();
    await adminController.updateUserStatus(reqReactivate, resReactivate);
    assert.equal(resReactivate.statusCode, 200);
    assert.equal(mockUser.isSuspended, false);

    // 7. Login now succeeds
    const resLogin2 = createMockRes();
    await authController.login(reqLogin, resLogin2);
    assert.equal(resLogin2.statusCode, 200);
    assert.ok(resLogin2.body.token);
  } finally {
    User.findById = originalFindById;
    User.findOne = originalFindOne;
  }
});

test('USER MANAGEMENT: 15. Admin user search, role filtering, status filtering, and sensitive field exclusion', async () => {
  const originalFind = User.find;
  const originalCountDocuments = User.countDocuments;

  let capturedFilter = null;
  let capturedSelect = null;

  const mockUsersList = [
    {
      _id: 'u1',
      name: 'Abebe Bikila',
      email: 'abebe@example.com',
      role: 'tourist',
      isActive: true,
      isSuspended: false,
      isVerified: true
    },
    {
      _id: 'u2',
      name: 'Kebede Vendor',
      email: 'kebede@example.com',
      role: 'vendor',
      isActive: true,
      isSuspended: false,
      isVerified: true
    }
  ];

  User.find = (filter) => {
    capturedFilter = filter;
    return {
      sort: () => ({
        skip: () => ({
          limit: () => ({
            select: (fields) => {
              capturedSelect = fields;
              return mockUsersList;
            }
          })
        })
      })
    };
  };
  User.countDocuments = async () => mockUsersList.length;

  try {
    const req = {
      query: {
        role: 'vendor',
        status: 'active',
        search: 'Kebede',
        page: '1',
        limit: '10'
      }
    };
    const res = createMockRes();

    await adminController.getUsers(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.total, 2);

    // Check filter construction
    assert.equal(capturedFilter.role, 'vendor');
    assert.equal(capturedFilter.isActive, true);
    assert.ok(capturedFilter.$or, 'Search filter must build regex on name and email');

    // Check sensitive field exclusion in query
    assert.match(capturedSelect, /-password/);
    assert.match(capturedSelect, /-verificationToken/);
    assert.match(capturedSelect, /-resetPasswordToken/);
  } finally {
    User.find = originalFind;
    User.countDocuments = originalCountDocuments;
  }
});

// ============================================================================
// SECTION 4: EMAIL WORKFLOWS
// ============================================================================

test('EMAIL WORKFLOW: 16. Verification token generation, expiration, and single-use consumption', async () => {
  const rawToken = 'raw_verification_token_sample_123';
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  let userSaved = false;
  const mockUser = {
    _id: '654321000000000000000070',
    name: 'Unverified User',
    email: 'unverified@example.com',
    isVerified: false,
    verificationToken: hashedToken,
    verificationTokenExpire: new Date(Date.now() + 24 * 60 * 60 * 1000), // Valid for 24h
    save: async () => { userSaved = true; }
  };

  const originalFindOne = User.findOne;
  User.findOne = async (query) => {
    if (query?.verificationToken === hashedToken && query?.verificationTokenExpire?.$gt) {
      if (mockUser.verificationToken && mockUser.verificationTokenExpire && Date.now() < mockUser.verificationTokenExpire.getTime()) {
        return mockUser;
      }
    }
    return null;
  };

  try {
    // 1. Consume valid token
    const reqValid = { params: { token: rawToken } };
    const resValid = createMockRes();

    await authController.verifyEmail(reqValid, resValid);

    assert.equal(resValid.statusCode, 200);
    assert.equal(mockUser.isVerified, true, 'User should now be verified');
    assert.equal(mockUser.verificationToken, undefined, 'Verification token must be cleared upon use');
    assert.equal(mockUser.verificationTokenExpire, undefined, 'Expiration must be cleared upon use');

    // 2. Attempt to reuse already consumed token -> REJECTED (400)
    mockUser.verificationToken = undefined;
    const reqReuse = { params: { token: rawToken } };
    const resReuse = createMockRes();

    await authController.verifyEmail(reqReuse, resReuse);

    assert.equal(resReuse.statusCode, 400);
    assert.match(resReuse.body.message, /Invalid or expired/i);
  } finally {
    User.findOne = originalFindOne;
  }
});

test('EMAIL WORKFLOW: 17. Resend verification returns privacy-preserving 200 for existing and non-existing accounts', async () => {
  const originalFindOne = User.findOne;

  try {
    // Case A: Email does not exist
    User.findOne = async () => null;

    const reqNonExisting = { body: { email: 'nobody@example.com' } };
    const resNonExisting = createMockRes();

    await authController.resendVerification(reqNonExisting, resNonExisting);
    assert.equal(resNonExisting.statusCode, 200);
    assert.match(resNonExisting.body.message, /If an account with that email exists/i);

    // Case B: Email exists and is unverified
    let tokenGenerated = false;
    const unverifiedUser = {
      _id: 'user_unverified',
      email: 'real@example.com',
      isVerified: false,
      generateVerificationToken: () => {
        tokenGenerated = true;
        return 'new_token_123';
      },
      save: async () => {}
    };
    User.findOne = async () => unverifiedUser;

    const reqExisting = { body: { email: 'real@example.com' } };
    const resExisting = createMockRes();

    await authController.resendVerification(reqExisting, resExisting);
    assert.equal(resExisting.statusCode, 200);
    assert.equal(tokenGenerated, true, 'New token must be generated for unverified user');

    // Case C: Email exists and is already verified
    const verifiedUser = { _id: 'user_verified', email: 'verified@example.com', isVerified: true };
    User.findOne = async () => verifiedUser;

    const reqVerified = { body: { email: 'verified@example.com' } };
    const resVerified = createMockRes();

    await authController.resendVerification(reqVerified, resVerified);
    assert.equal(resVerified.statusCode, 400);
    assert.match(resVerified.body.message, /already been verified/i);
  } finally {
    User.findOne = originalFindOne;
  }
});

test('EMAIL WORKFLOW: 18. Forgot password returns generic 200 privacy response without user enumeration', async () => {
  const originalFindOne = User.findOne;

  try {
    // Non-existent user
    User.findOne = async () => null;
    const req1 = { body: { email: 'nonexistent@example.com' } };
    const res1 = createMockRes();
    await authController.forgotPassword(req1, res1);

    assert.equal(res1.statusCode, 200);
    assert.match(res1.body.message, /If an account with that email exists/i);

    // Existing user
    let resetGenerated = false;
    User.findOne = async () => ({
      _id: 'real_user',
      email: 'exists@example.com',
      name: 'Existing User',
      generateResetToken: () => {
        resetGenerated = true;
        return 'secure_reset_token';
      },
      save: async () => {}
    });

    const req2 = { body: { email: 'exists@example.com' } };
    const res2 = createMockRes();
    await authController.forgotPassword(req2, res2);

    assert.equal(res2.statusCode, 200);
    assert.equal(resetGenerated, true);
    assert.match(res2.body.message, /If an account with that email exists/i);
  } finally {
    User.findOne = originalFindOne;
  }
});

test('EMAIL WORKFLOW: 19. Password reset token single-use invalidation, session revocation, and security alert', async () => {
  const rawToken = 'sample_password_reset_raw_token';
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  const mockUser = {
    _id: '654321000000000000000080',
    name: 'Resetting User',
    email: 'resetme@example.com',
    resetPasswordToken: hashedToken,
    resetPasswordExpire: new Date(Date.now() + 10 * 60 * 1000), // Valid 10m
    password: 'old_hashed_password',
    loginAttempts: 4,
    save: async function() { return this; }
  };

  // Issue an active session for mockUser
  await authService.issueTokenPair(mockUser, false, { ip: '1.2.3.4', userAgent: 'Browser' });
  const activeBefore = await authService.getUserActiveSessions(mockUser._id);
  assert.ok(activeBefore.length > 0);

  const originalFindOne = User.findOne;
  User.findOne = async (query) => {
    if (query?.resetPasswordToken === hashedToken && query?.resetPasswordExpire?.$gt) {
      if (mockUser.resetPasswordToken && mockUser.resetPasswordExpire && Date.now() < mockUser.resetPasswordExpire.getTime()) {
        return mockUser;
      }
    }
    return null;
  };

  try {
    const req = {
      params: { token: rawToken },
      body: { password: 'BrandNewSecurePassword123!' }
    };
    const res = createMockRes();

    await authController.resetPassword(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(mockUser.resetPasswordToken, undefined, 'Reset token must be cleared');
    assert.equal(mockUser.resetPasswordExpire, undefined, 'Reset expiration must be cleared');
    assert.equal(mockUser.loginAttempts, 0, 'Login attempts must be reset');

    // All active sessions must be invalidated upon reset
    const activeAfter = await authService.getUserActiveSessions(mockUser._id);
    assert.equal(activeAfter.length, 0, 'All active sessions must be revoked on password reset');

    // Reusing the same reset token fails with 400
    mockUser.resetPasswordToken = undefined;
    const reqReuse = {
      params: { token: rawToken },
      body: { password: 'AnotherPassword123!' }
    };
    const resReuse = createMockRes();
    await authController.resetPassword(reqReuse, resReuse);

    assert.equal(resReuse.statusCode, 400);
    assert.match(resReuse.body.message, /Invalid or expired/i);
  } finally {
    User.findOne = originalFindOne;
  }
});

test('EMAIL WORKFLOW: 20. sendEmail utility handles missing or failing transport gracefully without crashing', async () => {
  const result = await sendEmail({
    to: 'fallback@example.com',
    subject: 'Test Subject',
    template: 'account-status-update',
    context: { name: 'Fallback User', status: 'Active' }
  });

  // Must not throw an unhandled exception and must return a boolean
  assert.equal(typeof result, 'boolean');
});
