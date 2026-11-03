const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  action: {
    type: String,
    required: [true, 'Audit log requires an action'],
    trim: true,
    uppercase: true,
    index: true
  },
  targetType: {
    type: String,
    required: [true, 'Audit log requires a target resource type'],
    trim: true,
    index: true
  },
  targetId: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
    index: true
  },
  previousState: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  newState: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now,
    immutable: true,
    index: true
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: false },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Immutability Guard: Prevent updating or deleting audit trail entries
const forbidModification = function(next) {
  const err = new Error('AuditLog records are immutable and cannot be updated or deleted.');
  err.statusCode = 403;
  if (typeof next === 'function') {
    return next(err);
  }
  throw err;
};

// Document-level guards
auditLogSchema.pre('save', function(next) {
  if (!this.isNew) {
    return forbidModification(next);
  }
  next();
});
auditLogSchema.pre('deleteOne', { document: true, query: true }, forbidModification);

// Query-level guards
auditLogSchema.pre('updateOne', forbidModification);
auditLogSchema.pre('updateMany', forbidModification);
auditLogSchema.pre('findOneAndUpdate', forbidModification);
auditLogSchema.pre('deleteMany', forbidModification);
auditLogSchema.pre('findOneAndDelete', forbidModification);
auditLogSchema.pre('findOneAndRemove', forbidModification);

// Compound indexes for investigation and compliance reviews
auditLogSchema.index({ targetType: 1, targetId: 1, timestamp: -1 });
auditLogSchema.index({ actor: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
