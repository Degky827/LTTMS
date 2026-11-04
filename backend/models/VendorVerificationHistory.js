const mongoose = require('mongoose');

const vendorVerificationHistorySchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: [true, 'Vendor reference is required'],
    index: true
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: ['status_change', 'document_submitted', 'document_reviewed', 'profile_submitted', 'approved', 'rejected', 'suspended', 'reactivated']
  },
  previousStatus: {
    type: String,
    default: null
  },
  newStatus: {
    type: String,
    default: null
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Actor reference is required']
  },
  reason: {
    type: String,
    default: null
  },
  notes: {
    type: String,
    default: null
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

vendorVerificationHistorySchema.index({ vendor: 1, createdAt: -1 });

module.exports = mongoose.model('VendorVerificationHistory', vendorVerificationHistorySchema);
