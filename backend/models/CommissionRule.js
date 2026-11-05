const mongoose = require('mongoose');

const commissionRuleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Rule name is required'],
    trim: true
  },
  description: {
    type: String,
    default: null,
    trim: true
  },
  serviceCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
    index: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    default: null,
    index: true
  },
  rate: {
    type: Number,
    required: [true, 'Commission rate is required'],
    min: [0, 'Rate cannot be negative'],
    max: [1, 'Rate cannot exceed 1.0 (100%)'],
    default: 0.08 // 8% default platform rate (within 5-10% proposal)
  },
  effectiveStartDate: {
    type: Date,
    default: Date.now
  },
  effectiveEndDate: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

commissionRuleSchema.index({ isActive: 1, vendor: 1, serviceCategory: 1 });

module.exports = mongoose.model('CommissionRule', commissionRuleSchema);
