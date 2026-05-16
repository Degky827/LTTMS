const rolePermissions = {
  admin: new Set(['bookings:read:any', 'bookings:update:any', 'bookings:create:own', 'services:manage:any']),
  vendor: new Set(['bookings:update:own', 'services:manage:own']),
  tourist: new Set(['bookings:create:own', 'bookings:read:own'])
};

const requirePermission = (permission) => (req, res, next) => {
  const role = req.user?.role;
  const permissions = rolePermissions[role] || new Set();
  if (!permissions.has(permission)) {
    return res.status(403).json({
      success: false,
      message: `Missing required permission: ${permission}`
    });
  }
  return next();
};

module.exports = { requirePermission, rolePermissions };
