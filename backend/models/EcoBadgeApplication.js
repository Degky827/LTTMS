const mongoose = require('mongoose');

const ecoBadgeApplicationSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: [true, 'Vendor reference is required'],
    index: true
  },
  badge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EcoBadge',
    required: [true, 'EcoBadge reference is required'],
    index: true
  },
  sustainabilityPractices: {
    wasteManagement: { type: String, default: null },
    waterConservation: { type: String, default: null },
    energyEfficiency: { type: String, default: null },
    communityEngagement: { type: String, default: null },
    environmentalProtection: { type: String, default: null },
    culturalPreservation: { type: String, default: null },
    localEmployment: { type: String, default: null }
  },
  evidenceDocuments: [{
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    description: { type: String, default: null }
  }],
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected'],
    default: 'submitted',
    index: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },
  validUntil: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

ecoBadgeApplicationSchema.index({ vendor: 1, badge: 1, status: 1 });

module.exports = mongoose.model('EcoBadgeApplication', ecoBadgeApplicationSchema);
