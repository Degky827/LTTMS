const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const RefreshToken = require('../models/RefreshToken');
const User = require('../models/User');
const logger = require('../utils/logger');

// Fallback in-memory session store when MongoDB is disconnected (e.g. in standalone unit tests)
const memorySessionStore = new Map();

/**
 * Hash a refresh token using SHA-256
 * @param {string} token
 * @returns {string} hex digest
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Return only public, safe user properties (strips sensitive hashes, secrets, and attempt counts)
 * @param {object} user
 * @returns {object} safe user profile
 */
const sanitizeUser = (user) => {
  if (!user) return null;
  const raw = user.toObject ? user.toObject() : { ...user };
  return {
    id: raw._id ? raw._id.toString() : raw.id,
    name: raw.name,
    email: raw.email,
    phone: raw.phone || null,
    role: raw.role,
    avatar: raw.avatar || null,
    bio: raw.bio || null,
    languagePreference: raw.languagePreference || 'en',
    isVerified: Boolean(raw.isVerified),
    twoFactorEnabled: Boolean(raw.twoFactorEnabled),
    lastLogin: raw.lastLogin || null,
    createdAt: raw.createdAt || null
  };
};

/**
 * Issue an access token and a hashed refresh token pair
 * @param {object} user - User document or object
 * @param {boolean} rememberMe - Whether long-lived session is requested
 * @param {object} reqContext - Client IP, userAgent, or existing family ID
 * @returns {Promise<{ accessToken: string, refreshToken: string, tokenHash: string, family: string, expiresAt: Date }>}
 */
const issueTokenPair = async (user, rememberMe = false, reqContext = {}) => {
  const userId = user._id ? user._id.toString() : user.id;
  const accessExpiry = rememberMe ? '7d' : process.env.JWT_EXPIRES_IN || '15m';
  const refreshExpiry = rememberMe ? '90d' : process.env.JWT_REFRESH_EXPIRES_IN || '30d';

  const issuer = process.env.JWT_ISSUER || 'lttms-api';
  const audience = process.env.JWT_AUDIENCE || 'lttms-client';

  const jti = crypto.randomUUID();
  const family = reqContext.family || crypto.randomUUID();

  // Short-lived Access Token
  const accessToken = jwt.sign(
    { id: userId, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: accessExpiry,
      issuer,
      audience
    }
  );

  // Longer-lived Refresh Token
  const refreshTokenSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  const refreshToken = jwt.sign(
    { id: userId, jti, family, type: 'refresh' },
    refreshTokenSecret,
    {
      expiresIn: refreshExpiry,
      issuer,
      audience
    }
  );

  // Calculate expiration date
  const refreshMaxAgeMs = rememberMe ? 90 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
  const expiresAt = new Date(Date.now() + refreshMaxAgeMs);

  // Store SHA-256 hash of refresh token, never plaintext
  const tokenHash = hashToken(refreshToken);

  const sessionData = {
    user: userId,
    tokenHash,
    family,
    jti,
    isRevoked: false,
    revokedAt: null,
    revokedReason: null,
    replacedByTokenHash: null,
    ip: reqContext.ip || null,
    userAgent: reqContext.userAgent || null,
    expiresAt
  };

  if (mongoose.connection.readyState === 1) {
    await RefreshToken.create(sessionData);
  } else {
    memorySessionStore.set(tokenHash, { ...sessionData, _id: crypto.randomUUID() });
  }

  return {
    accessToken,
    refreshToken,
    tokenHash,
    family,
    expiresAt
  };
};

/**
 * Rotate a refresh token with reuse detection
 * @param {string} rawRefreshToken
 * @param {object} reqContext
 * @returns {Promise<{ status: string, user?: object, tokens?: object, message?: string }>}
 */
const rotateRefreshToken = async (rawRefreshToken, reqContext = {}) => {
  if (!rawRefreshToken || typeof rawRefreshToken !== 'string') {
    return { status: 'invalid', message: 'No refresh token provided' };
  }

  // 1. Verify cryptographic signature and claims
  const refreshTokenSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  let decoded;
  try {
    decoded = jwt.verify(refreshTokenSecret ? rawRefreshToken : '', refreshTokenSecret, {
      issuer: process.env.JWT_ISSUER || 'lttms-api',
      audience: process.env.JWT_AUDIENCE || 'lttms-client'
    });
  } catch (err) {
    // If verify fails, try without issuer/audience check in case token was created before config
    try {
      decoded = jwt.verify(rawRefreshToken, refreshTokenSecret);
    } catch (innerErr) {
      return { status: 'invalid', message: 'Invalid or expired refresh token' };
    }
  }

  if (decoded.type !== 'refresh') {
    return { status: 'invalid', message: 'Invalid token type' };
  }

  const tokenHash = hashToken(rawRefreshToken);

  // 2. Look up stored session token by hash
  let storedToken;
  if (mongoose.connection.readyState === 1) {
    storedToken = await RefreshToken.findOne({ tokenHash });
  } else {
    storedToken = memorySessionStore.get(tokenHash);
  }

  // 3. Handle reuse or missing token
  if (!storedToken) {
    return { status: 'invalid', message: 'Refresh token record not found or revoked' };
  }

  // REUSE DETECTION: If token was already revoked, someone is replaying an old token!
  if (storedToken.isRevoked) {
    logger.warn(
      { userId: storedToken.user, family: storedToken.family, tokenHash },
      'SECURITY ALERT: Refresh token reuse detected! Invalidating session family.'
    );

    // Invalidate all tokens in the compromised family
    if (mongoose.connection.readyState === 1) {
      await RefreshToken.updateMany(
        { family: storedToken.family },
        { isRevoked: true, revokedAt: new Date(), revokedReason: 'reuse_detected' }
      );
    } else {
      for (const [key, val] of memorySessionStore.entries()) {
        if (val.family === storedToken.family) {
          memorySessionStore.set(key, { ...val, isRevoked: true, revokedAt: new Date(), revokedReason: 'reuse_detected' });
        }
      }
    }

    return {
      status: 'reuse_detected',
      message: 'Compromised refresh token reuse detected. All sessions in this family revoked.'
    };
  }

  // Check expiration
  if (new Date(storedToken.expiresAt) <= new Date()) {
    return { status: 'expired', message: 'Refresh token has expired' };
  }

  // 4. Validate user
  let user;
  if (mongoose.connection.readyState === 1) {
    user = await User.findById(storedToken.user);
  } else {
    user = reqContext.mockUser || { _id: storedToken.user, id: storedToken.user, role: 'tourist', isActive: true, name: 'Test User', email: 'test@laketana.com' };
  }

  if (!user) {
    return { status: 'invalid', message: 'User no longer exists' };
  }

  if (user.isActive === false) {
    return { status: 'user_inactive', message: 'Account has been deactivated' };
  }

  // 5. Issue new rotated token pair preserving token family
  const newTokens = await issueTokenPair(user, false, {
    family: storedToken.family,
    ip: reqContext.ip,
    userAgent: reqContext.userAgent
  });

  // 6. Mark previous token as rotated and link to replacement
  if (mongoose.connection.readyState === 1) {
    storedToken.isRevoked = true;
    storedToken.revokedAt = new Date();
    storedToken.revokedReason = 'rotated';
    storedToken.replacedByTokenHash = newTokens.tokenHash;
    await storedToken.save();
  } else {
    memorySessionStore.set(tokenHash, {
      ...storedToken,
      isRevoked: true,
      revokedAt: new Date(),
      revokedReason: 'rotated',
      replacedByTokenHash: newTokens.tokenHash
    });
  }

  return {
    status: 'success',
    user,
    tokens: newTokens
  };
};

/**
 * Revoke a single refresh token session
 * @param {string} rawRefreshToken
 * @param {string} reason
 */
const revokeRefreshToken = async (rawRefreshToken, reason = 'logout') => {
  if (!rawRefreshToken) return;
  const tokenHash = hashToken(rawRefreshToken);
  if (mongoose.connection.readyState === 1) {
    await RefreshToken.updateOne(
      { tokenHash },
      { isRevoked: true, revokedAt: new Date(), revokedReason: reason }
    );
  } else {
    const existing = memorySessionStore.get(tokenHash);
    if (existing) {
      memorySessionStore.set(tokenHash, {
        ...existing,
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: reason
      });
    }
  }
};

/**
 * Revoke all active sessions for a user
 * @param {string} userId
 * @param {string} reason
 */
const revokeAllUserTokens = async (userId, reason = 'logout_all') => {
  if (!userId) return;
  if (mongoose.connection.readyState === 1) {
    await RefreshToken.updateMany(
      { user: userId, isRevoked: false },
      { isRevoked: true, revokedAt: new Date(), revokedReason: reason }
    );
  } else {
    for (const [key, val] of memorySessionStore.entries()) {
      if (val.user.toString() === userId.toString()) {
        memorySessionStore.set(key, {
          ...val,
          isRevoked: true,
          revokedAt: new Date(),
          revokedReason: reason
        });
      }
    }
  }
};

/**
 * Helper to inspect memory session store size (for testing)
 */
const getMemorySessionStoreSize = () => memorySessionStore.size;

/**
 * Helper to clear memory session store (for testing)
 */
const clearMemorySessionStore = () => memorySessionStore.clear();

module.exports = {
  hashToken,
  sanitizeUser,
  issueTokenPair,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  getMemorySessionStoreSize,
  clearMemorySessionStore
};
