const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-at-least-32-characters-long-key';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-at-least-32-chars-long';

// Standard deterministic ObjectIds for consistent testing
const FIXTURE_IDS = {
  tourist: '654321000000000000000201',
  otherTourist: '654321000000000000000202',
  vendorUser: '654321000000000000000203',
  vendorProfile: '654321000000000000000204',
  otherVendorUser: '654321000000000000000205',
  otherVendorProfile: '654321000000000000000206',
  support: '654321000000000000000207',
  admin: '654321000000000000000208',
  superAdmin: '654321000000000000000209',
  service: '654321000000000000000210',
  booking: '654321000000000000000211',
  payment: '654321000000000000000212',
  review: '654321000000000000000213',
  ticket: '654321000000000000000214',
  notification: '654321000000000000000215'
};

/**
 * Generate authenticated JWT tokens for testing
 */
function createTestToken(payload, options = {}) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m', ...options });
}

const TOKENS = {
  tourist: createTestToken({ id: FIXTURE_IDS.tourist, role: 'tourist' }),
  otherTourist: createTestToken({ id: FIXTURE_IDS.otherTourist, role: 'tourist' }),
  vendor: createTestToken({ id: FIXTURE_IDS.vendorUser, role: 'vendor', vendorId: FIXTURE_IDS.vendorProfile }),
  otherVendor: createTestToken({ id: FIXTURE_IDS.otherVendorUser, role: 'vendor', vendorId: FIXTURE_IDS.otherVendorProfile }),
  support: createTestToken({ id: FIXTURE_IDS.support, role: 'support' }),
  admin: createTestToken({ id: FIXTURE_IDS.admin, role: 'admin' }),
  superAdmin: createTestToken({ id: FIXTURE_IDS.superAdmin, role: 'super_admin' }),
  expired: createTestToken({ id: FIXTURE_IDS.tourist, role: 'tourist' }, { expiresIn: '-10s' }),
  invalid: 'invalid.jwt.token.structure',
  tampered: jwt.sign({ id: FIXTURE_IDS.tourist, role: 'tourist' }, 'wrong-secret-key-signature')
};

/**
 * Standard test user objects matching User model
 */
const TEST_USERS = {
  tourist: {
    _id: FIXTURE_IDS.tourist,
    id: FIXTURE_IDS.tourist,
    name: 'Abebe Tourist',
    email: 'abebe.tourist@example.com',
    role: 'tourist',
    isActive: true,
    isSuspended: false,
    isEmailVerified: true
  },
  vendorUser: {
    _id: FIXTURE_IDS.vendorUser,
    id: FIXTURE_IDS.vendorUser,
    name: 'Kassahun Vendor',
    email: 'kassahun.vendor@example.com',
    role: 'vendor',
    vendorId: FIXTURE_IDS.vendorProfile,
    isActive: true,
    isSuspended: false,
    isEmailVerified: true
  },
  support: {
    _id: FIXTURE_IDS.support,
    id: FIXTURE_IDS.support,
    name: 'Lake Tana Support Staff',
    email: 'support@laketana.gov.et',
    role: 'support',
    isActive: true,
    isSuspended: false,
    isEmailVerified: true
  },
  admin: {
    _id: FIXTURE_IDS.admin,
    id: FIXTURE_IDS.admin,
    name: 'Administrator',
    email: 'admin@laketana.gov.et',
    role: 'admin',
    isActive: true,
    isSuspended: false,
    isEmailVerified: true
  },
  superAdmin: {
    _id: FIXTURE_IDS.superAdmin,
    id: FIXTURE_IDS.superAdmin,
    name: 'Super Administrator',
    email: 'superadmin@laketana.gov.et',
    role: 'super_admin',
    isActive: true,
    isSuspended: false,
    isEmailVerified: true
  }
};

module.exports = {
  FIXTURE_IDS,
  TOKENS,
  TEST_USERS,
  createTestToken
};
