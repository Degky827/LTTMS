const rateLimit = require('express-rate-limit');

/**
 * Authentication rate limiter
 * Protects login, registration, and 2FA verification from brute-force attempts
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Max 20 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

/**
 * Password recovery & reset rate limiter
 * Restricts password recovery initiation and resets
 */
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many password recovery attempts. Please try again after 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

/**
 * Email verification rate limiter
 * Prevents spamming verification links and resend triggers
 */
const verificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many email verification attempts. Please try again after 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

/**
 * Refresh token rate limiter
 * Protects the token exchange endpoint from aggressive polling
 */
const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // Max 60 refreshes per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many session refresh requests. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

/**
 * Public API general rate limiter
 */
const publicLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'test' ? 10000 : 120, // High throughput in test runner, restricted in production
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

module.exports = {
  authLimiter,
  passwordResetLimiter,
  verificationLimiter,
  refreshLimiter,
  publicLimiter
};
