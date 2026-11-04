const mongoose = require('mongoose');

const ecoBadgeHistorySchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: [true, 'Vendor reference is required'],
    index: true
  },
  badge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EcoBadge',
    required: [true, 'EcoBadge reference is required']
  },
  action: {
    type: String,
    enum: ['applied', 'approved', 'rejected', 'revoked', 'renewed'],
    required: [true, 'Action is required']
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Actor reference is required']
  },
  notes: {
    type: String,
    default: null
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

ecoBadgeHistorySchema.index({ vendor: 1, createdAt: -1 });

module.exports = mongoose.model('EcoBadgeHistory', ecoBadgeHistorySchema);
