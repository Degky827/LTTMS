const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const { config } = require('../config/env');
const logger = require('../utils/logger');

// In-memory token blacklist (short-lived access tokens revoked before expiration)
const tokenBlacklist = new Map();
const BLACKLIST_CLEANUP_INTERVAL = 15 * 60 * 1000; // 15 min

const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, expiry] of tokenBlacklist) {
    if (expiry < now) tokenBlacklist.delete(key);
  }
}, BLACKLIST_CLEANUP_INTERVAL);
if (cleanupTimer.unref) {
  cleanupTimer.unref();
}

const isBlacklisted = (token) => {
  return tokenBlacklist.has(token);
};

const addToBlacklist = (token, expiresIn = 15 * 60 * 1000) => {
  tokenBlacklist.set(token, Date.now() + expiresIn);
};

/**
 * Protect routes: verify JWT access token, check blacklist, active/suspended status, and password changes
 */
const protect = async (req, res, next) => {
  let token;
  let isCookieAuth = false;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token && req.cookies?.accessToken) {
    token = req.cookies.accessToken;
    isCookieAuth = true;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  // CSRF protection for cookie-only authenticated state-changing requests
  if (isCookieAuth && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const origin = req.headers.origin;
    if (origin) {
      const isAllowed = config.ALLOWED_ORIGINS.includes('*') ||
        config.ALLOWED_ORIGINS.includes(origin) ||
        (config.isDevelopment && origin.includes('localhost'));
      if (!isAllowed) {
        return res.status(403).json({
          success: false,
          message: 'Cross-origin request blocked by CSRF policy'
        });
      }
    }
  }

  if (isBlacklisted(token)) {
    return res.status(401).json({ success: false, message: 'Token has been revoked. Please log in again.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Look up user (or use mockUser for disconnected unit tests if provided)
    let user = req.mockUser;
    if (!user) {
      user = await User.findById(decoded.id);
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ success: false, message: 'Account has been deactivated' });
    }

    if (user.isSuspended === true) {
      return res.status(403).json({
        success: false,
        message: `Account is suspended: ${user.suspendedReason || 'Contact support for more details'}`,
        code: 'ACCOUNT_SUSPENDED'
      });
    }

    // Invalidate access token if password was changed after token issuance
    if (user.changedPasswordAfter && user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        success: false,
        message: 'Password recently changed. Please log in again.'
      });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Access token expired. Please refresh your session.',
        code: 'TOKEN_EXPIRED'
      });
    }
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};

/**
 * Grant access to specific roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Super admin inherits authorization unless a route specifically restricts to other non-admin scopes
    const isAuthorized = roles.includes(req.user.role) || (req.user.role === 'super_admin' && roles.includes('admin'));

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

/**
 * Require verified email address for sensitive operations
 */
const requireVerifiedEmail = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Email verification required. Please verify your email before proceeding.',
      code: 'EMAIL_NOT_VERIFIED'
    });
  }
  next();
};

/**
 * Restrict vendor functionality until administrator approval
 */
const requireApprovedVendor = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  // Admins and super_admins bypass vendor-specific approval checks
  if (req.user.role === 'admin' || req.user.role === 'super_admin') {
    return next();
  }

  if (req.user.role !== 'vendor') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Vendor role required'
    });
  }

  // If mock vendor is attached in testing environment
  if (req.vendor && req.vendor.status === 'approved') {
    return next();
  }

  try {
    const vendor = await Vendor.findOne({ user: req.user._id || req.user.id });
    if (!vendor || vendor.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Access restricted: Vendor account must be approved by an administrator to access vendor features',
        code: 'VENDOR_NOT_APPROVED',
        vendorStatus: vendor ? vendor.status : 'not_registered'
      });
    }

    req.vendor = vendor;
    next();
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * Resource ownership verification middleware generator
 * @param {Function} getOwnerIdFn - Async function (req) => Promise<string|ObjectId>
 */
const requireOwnership = (getOwnerIdFn) => async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  // Administrative roles bypass ownership restrictions
  if (req.user.role === 'admin' || req.user.role === 'super_admin') {
    return next();
  }

  try {
    const ownerId = await getOwnerIdFn(req);
    if (!ownerId) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    const currentUserId = (req.user._id || req.user.id).toString();
    if (ownerId.toString() !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to access or modify this resource'
      });
    }

    next();
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * Helper to blacklist an access token on logout / password change
 */
const blacklistToken = (token) => {
  if (token && process.env.JWT_BLACKLIST_ENABLED !== 'false') {
    try {
      const decoded = jwt.decode(token);
      const expiresIn = decoded?.exp ? (decoded.exp * 1000 - Date.now()) : 15 * 60 * 1000;
      if (expiresIn > 0) addToBlacklist(token, expiresIn);
    } catch {
      addToBlacklist(token);
    }
  }
};

const getBlacklistSize = () => tokenBlacklist.size;
const clearBlacklist = () => tokenBlacklist.clear();

module.exports = {
  protect,
  authenticate: protect,
  authorize,
  authorizeRoles: authorize,
  requireVerifiedEmail,
  requireApprovedVendor,
  requireOwnership,
  blacklistToken,
  getBlacklistSize,
  clearBlacklist
};
