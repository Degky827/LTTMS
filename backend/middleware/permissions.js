/**
 * Granular Role-Based Access Control (RBAC) Permissions Matrix
 * Supports all 5 platform roles: tourist, vendor, support, admin, super_admin
 */

const rolePermissions = {
  tourist: new Set([
    'profile:read:own',
    'profile:update:own',
    'bookings:create:own',
    'bookings:read:own',
    'bookings:cancel:own',
    'reviews:create:own',
    'reviews:delete:own',
    'services:browse'
  ]),
  vendor: new Set([
    'profile:read:own',
    'profile:update:own',
    'bookings:create:own',
    'bookings:read:own',
    'bookings:read:vendor',
    'bookings:update:vendor',
    'services:create:own',
    'services:update:own',
    'services:delete:own',
    'services:availability:manage',
    'revenue:read:own',
    'vendor:profile:manage'
  ]),
  support: new Set([
    'profile:read:own',
    'profile:update:own',
    'support:tickets:manage',
    'bookings:read:support',
    'users:read:support',
    'reviews:read:any'
  ]),
  admin: new Set([
    'admin:access',
    'users:read:any',
    'users:status:manage',
    'users:role:assign',
    'vendors:review',
    'vendors:status:update',
    'bookings:read:any',
    'bookings:override:any',
    'bookings:refund:approve',
    'services:manage:any',
    'reviews:moderate',
    'reports:view',
    'analytics:view',
    'announcements:send',
    'eco:compliance:manage'
  ]),
  super_admin: new Set([
    '*', // Full system wildcard
    'super_admin:access',
    'admin:access',
    'system:admin',
    'roles:manage:privileged',
    'audit:logs:view'
  ])
};

/**
 * Check whether a specific role possesses a given permission
 * @param {string} role - User role
 * @param {string} permission - Permission key
 * @returns {boolean}
 */
const hasPermission = (role, permission) => {
  if (!role || !permission) return false;
  if (role === 'super_admin') return true;
  const permissions = rolePermissions[role];
  if (!permissions) return false;
  return permissions.has('*') || permissions.has(permission);
};

/**
 * Middleware to enforce required permission on routes
 * @param {string} permission - e.g. 'bookings:create:own'
 */
const requirePermission = (permission) => (req, res, next) => {
  const role = req.user?.role;
  if (!role) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (hasPermission(role, permission)) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: `Missing required permission: ${permission}`
  });
};

module.exports = {
  rolePermissions,
  hasPermission,
  requirePermission
};
