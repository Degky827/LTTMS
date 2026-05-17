const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

// In-memory token blacklist (use Redis in production)
const tokenBlacklist = new Map();
const BLACKLIST_CLEANUP_INTERVAL = 15 * 60 * 1000; // 15 min

setInterval(() => {
  const now = Date.now();
  for (const [key, expiry] of tokenBlacklist) {
    if (expiry < now) tokenBlacklist.delete(key);
  }
}, BLACKLIST_CLEANUP_INTERVAL);

const isBlacklisted = (token) => {
  return tokenBlacklist.has(token);
};

const addToBlacklist = (token, expiresIn = 15 * 60 * 1000) => {
  tokenBlacklist.set(token, Date.now() + expiresIn);
};

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token && req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  if (isBlacklisted(token)) {
    return res.status(401).json({ success: false, message: 'Token has been revoked. Please log in again.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }

    if (!req.user.isActive) {
      return res.status(403).json({ success: false, message: 'Account has been deactivated' });
    }

    req.token = token;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};

// Grant access to specific roles
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

// Logout helper - call from auth controller
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

// Rate limiting info exporter
exports.getBlacklistSize = () => tokenBlacklist.size;
