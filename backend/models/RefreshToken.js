const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required for session refresh token'],
    index: true
  },
  tokenHash: {
    type: String,
    required: [true, 'Token hash is required'],
    unique: true,
    index: true
  },
  family: {
    type: String,
    required: [true, 'Session family identifier is required'],
    index: true
  },
  jti: {
    type: String,
    required: [true, 'JWT ID identifier is required'],
    index: true
  },
  isRevoked: {
    type: Boolean,
    default: false,
    index: true
  },
  revokedAt: {
    type: Date,
    default: null
  },
  revokedReason: {
    type: String,
    default: null
  },
  replacedByTokenHash: {
    type: String,
    default: null
  },
  ip: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  expiresAt: {
    type: Date,
    required: [true, 'Token expiration date is required']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Authoritative automatic session expiration via MongoDB TTL index
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound indexes for high-frequency queries
refreshTokenSchema.index({ user: 1, isRevoked: 1 });
refreshTokenSchema.index({ family: 1, isRevoked: 1 });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
