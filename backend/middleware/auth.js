const jwt = require('jsonwebtoken');
const User = require('../models/User');
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
 * Protect routes: verify JWT access token, check blacklist, active status, and password changes
 */
exports.protect = async (req, res, next) => {
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

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account has been deactivated' });
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
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

/**
 * Helper to blacklist an access token on logout / password change
 */
exports.blacklistToken = (token) => {
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

exports.getBlacklistSize = () => tokenBlacklist.size;
exports.clearBlacklist = () => tokenBlacklist.clear();
