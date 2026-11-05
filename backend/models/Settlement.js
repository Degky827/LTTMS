const mongoose = require('mongoose');
const crypto = require('crypto');

const settlementSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: [true, 'Vendor is required for settlement'],
    index: true
  },
  settlementReference: {
    type: String,
    unique: true,
    index: true,
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Settlement amount is required'],
    min: [1, 'Settlement amount must be at least 1 ETB']
  },
  currency: {
    type: String,
    default: 'ETB',
    uppercase: true,
    trim: true
  },
  status: {
    type: String,
    enum: {
      values: ['requested', 'approved', 'processing', 'completed', 'rejected', 'failed'],
      message: '{VALUE} is not a valid settlement status'
    },
    default: 'requested',
    index: true
  },
  payoutMethod: {
    type: String,
    enum: ['bank_transfer', 'telebirr', 'cbe_birr', 'manual_cash'],
    default: 'bank_transfer'
  },
  payoutDetails: {
    accountName: { type: String, trim: true, default: null },
    accountNumber: { type: String, trim: true, default: null },
    bankName: { type: String, trim: true, default: null },
    phone: { type: String, trim: true, default: null },
    notes: { type: String, trim: true, default: null }
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User who requested settlement is required']
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  processedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  rejectedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null,
    trim: true
  },
  providerReference: {
    type: String,
    default: null,
    trim: true
  },
  ledgerEntry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VendorLedger',
    default: null
  },
  notes: {
    type: String,
    default: null,
    trim: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

settlementSchema.pre('validate', function(next) {
  if (!this.settlementReference) {
    const year = new Date().getFullYear();
    const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
    this.settlementReference = `SET-${year}-${randomHex}`;
  }
  next();
});

settlementSchema.index({ vendor: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Settlement', settlementSchema);
