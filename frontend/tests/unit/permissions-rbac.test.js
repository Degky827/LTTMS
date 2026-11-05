const { describe, it } = require('node:test')
const assert = require('node:assert/strict')

// Test RBAC Role matrix and permissions logic
const PERMISSIONS = {
  SERVICES_CREATE: 'services:create',
  SERVICES_UPDATE: 'services:update',
  SERVICES_DELETE: 'services:delete',
  SERVICES_MANAGE_OWN: 'services:manage_own',
  BOOKINGS_CREATE: 'bookings:create',
  BOOKINGS_VIEW_OWN: 'bookings:view_own',
  BOOKINGS_MANAGE_VENDOR: 'bookings:manage_vendor',
  BOOKINGS_MANAGE_ALL: 'bookings:manage_all',
  REVIEWS_CREATE: 'reviews:create',
  REVIEWS_MODERATE: 'reviews:moderate',
  FINANCE_VIEW_OWN: 'finance:view_own',
  FINANCE_REQUEST_PAYOUT: 'finance:request_payout',
  FINANCE_MANAGE_ALL: 'finance:manage_all',
  VENDORS_APPLY: 'vendors:apply',
  VENDORS_APPROVE: 'vendors:approve',
  VENDORS_MANAGE: 'vendors:manage',
  USERS_MANAGE: 'users:manage',
  ROLES_ASSIGN: 'roles:assign',
  AUDIT_LOGS_VIEW: 'audit_logs:view',
  SYSTEM_CONFIG: 'system:config',
  SUPPORT_CREATE_TICKET: 'support:create_ticket',
  SUPPORT_HANDLE_TICKETS: 'support:handle_tickets',
}

const ROLE_PERMISSIONS = {
  tourist: [
    PERMISSIONS.BOOKINGS_CREATE,
    PERMISSIONS.BOOKINGS_VIEW_OWN,
    PERMISSIONS.REVIEWS_CREATE,
    PERMISSIONS.SUPPORT_CREATE_TICKET,
    PERMISSIONS.VENDORS_APPLY,
  ],
  vendor: [
    PERMISSIONS.SERVICES_CREATE,
    PERMISSIONS.SERVICES_UPDATE,
    PERMISSIONS.SERVICES_DELETE,
    PERMISSIONS.SERVICES_MANAGE_OWN,
    PERMISSIONS.BOOKINGS_MANAGE_VENDOR,
    PERMISSIONS.FINANCE_VIEW_OWN,
    PERMISSIONS.FINANCE_REQUEST_PAYOUT,
    PERMISSIONS.SUPPORT_CREATE_TICKET,
  ],
  support: [
    PERMISSIONS.SUPPORT_HANDLE_TICKETS,
    PERMISSIONS.BOOKINGS_MANAGE_ALL,
    PERMISSIONS.REVIEWS_MODERATE,
    PERMISSIONS.AUDIT_LOGS_VIEW,
  ],
  admin: [
    PERMISSIONS.SERVICES_CREATE,
    PERMISSIONS.SERVICES_UPDATE,
    PERMISSIONS.SERVICES_DELETE,
    PERMISSIONS.BOOKINGS_MANAGE_ALL,
    PERMISSIONS.REVIEWS_MODERATE,
    PERMISSIONS.FINANCE_MANAGE_ALL,
    PERMISSIONS.VENDORS_APPROVE,
    PERMISSIONS.VENDORS_MANAGE,
    PERMISSIONS.USERS_MANAGE,
    PERMISSIONS.AUDIT_LOGS_VIEW,
    PERMISSIONS.SUPPORT_HANDLE_TICKETS,
  ],
  super_admin: Object.values(PERMISSIONS),
}

function hasPermission(user, permission) {
  if (!user || !user.role) return false
  const granted = ROLE_PERMISSIONS[user.role] || []
  return granted.includes(permission)
}

function canAccessRoute(user, pathname) {
  const isPublicRoute =
    pathname === '/' ||
    pathname === '/about' ||
    pathname === '/contact' ||
    pathname === '/eco-tourism' ||
    pathname === '/history' ||
    pathname === '/services' ||
    pathname === '/vendors' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register')

  if (isPublicRoute) return { allowed: true }
  if (!user) return { allowed: false, redirectUrl: '/login' }

  const role = user.role
  if (pathname.startsWith('/admin')) {
    if (role === 'admin' || role === 'super_admin' || role === 'support') return { allowed: true }
    return { allowed: false, redirectUrl: '/forbidden' }
  }

  if (pathname.startsWith('/vendor')) {
    if (pathname === '/vendor/login' || pathname === '/vendor/register') return { allowed: true }
    if (role === 'vendor' || role === 'admin' || role === 'super_admin') return { allowed: true }
    return { allowed: false, redirectUrl: '/forbidden' }
  }

  if (pathname.startsWith('/tourist')) {
    if (role === 'tourist' || role === 'admin' || role === 'super_admin') return { allowed: true }
    return { allowed: false, redirectUrl: '/forbidden' }
  }

  return { allowed: true }
}

describe('LTTMS Authorization & RBAC Foundation Tests', () => {
  it('Tourist role has booking creation and viewing permissions', () => {
    const tourist = { role: 'tourist' }
    assert.equal(hasPermission(tourist, PERMISSIONS.BOOKINGS_CREATE), true)
    assert.equal(hasPermission(tourist, PERMISSIONS.BOOKINGS_VIEW_OWN), true)
    assert.equal(hasPermission(tourist, PERMISSIONS.USERS_MANAGE), false)
    assert.equal(hasPermission(tourist, PERMISSIONS.VENDORS_APPROVE), false)
  })

  it('Vendor role has service and finance payout permissions', () => {
    const vendor = { role: 'vendor' }
    assert.equal(hasPermission(vendor, PERMISSIONS.SERVICES_CREATE), true)
    assert.equal(hasPermission(vendor, PERMISSIONS.FINANCE_REQUEST_PAYOUT), true)
    assert.equal(hasPermission(vendor, PERMISSIONS.USERS_MANAGE), false)
  })

  it('Admin and Super Admin have elevated management permissions', () => {
    const admin = { role: 'admin' }
    const superAdmin = { role: 'super_admin' }
    assert.equal(hasPermission(admin, PERMISSIONS.USERS_MANAGE), true)
    assert.equal(hasPermission(admin, PERMISSIONS.VENDORS_APPROVE), true)
    assert.equal(hasPermission(superAdmin, PERMISSIONS.ROLES_ASSIGN), true)
    assert.equal(hasPermission(superAdmin, PERMISSIONS.SYSTEM_CONFIG), true)
  })

  it('Support role has support and ticket moderation permissions but not finance', () => {
    const support = { role: 'support' }
    assert.equal(hasPermission(support, PERMISSIONS.SUPPORT_HANDLE_TICKETS), true)
    assert.equal(hasPermission(support, PERMISSIONS.FINANCE_MANAGE_ALL), false)
  })

  it('Protects portal routes: tourist cannot access /admin or /vendor', () => {
    const tourist = { role: 'tourist' }
    const adminAccess = canAccessRoute(tourist, '/admin/dashboard')
    assert.equal(adminAccess.allowed, false)
    assert.equal(adminAccess.redirectUrl, '/forbidden')

    const vendorAccess = canAccessRoute(tourist, '/vendor/dashboard')
    assert.equal(vendorAccess.allowed, false)
    assert.equal(vendorAccess.redirectUrl, '/forbidden')

    const touristAccess = canAccessRoute(tourist, '/tourist')
    assert.equal(touristAccess.allowed, true)
  })

  it('Unauthenticated user is redirected to /login for protected routes', () => {
    const access = canAccessRoute(null, '/tourist')
    assert.equal(access.allowed, false)
    assert.equal(access.redirectUrl, '/login')
  })

  it('Public routes are accessible to all users', () => {
    assert.equal(canAccessRoute(null, '/').allowed, true)
    assert.equal(canAccessRoute(null, '/services').allowed, true)
    assert.equal(canAccessRoute(null, '/about').allowed, true)
  })
})
