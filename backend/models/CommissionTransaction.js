const mongoose = require('mongoose');

const commissionTransactionSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Commission must belong to a booking'],
    index: true
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    default: null,
    index: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: [true, 'Commission must specify the vendor'],
    index: true
  },
  totalBookingAmount: {
    type: Number,
    required: [true, 'Total booking amount is required'],
    min: [0, 'Amount cannot be negative'],
    alias: 'grossAmount'
  },
  commissionRate: {
    type: Number,
    required: [true, 'Commission rate is required'],
    default: 0.08,
    min: [0, 'Rate cannot be negative'],
    max: [1, 'Rate cannot exceed 100%']
  },
  commissionAmount: {
    type: Number,
    required: [true, 'Commission amount is required'],
    min: [0, 'Commission cannot be negative']
  },
  vendorEarning: {
    type: Number,
    required: [true, 'Vendor earning amount is required'],
    min: [0, 'Vendor earning cannot be negative'],
    alias: 'vendorPayoutAmount'
  },
  currency: {
    type: String,
    default: 'ETB',
    uppercase: true,
    trim: true
  },
  calculationRule: {
    type: String,
    default: 'standard_default',
    trim: true
  },
  ruleSnapshot: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'earned', 'collected', 'settled', 'reversed'],
      message: '{VALUE} is not a valid commission status'
    },
    default: 'pending',
    index: true
  },
  settledAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-validate normalization for aliases
commissionTransactionSchema.pre('validate', function(next) {
  if (this.totalBookingAmount === undefined && this.grossAmount !== undefined) {
    this.totalBookingAmount = this.grossAmount;
  }
  if (this.vendorEarning === undefined && this.vendorPayoutAmount !== undefined) {
    this.vendorEarning = this.vendorPayoutAmount;
  }
  next();
});

commissionTransactionSchema.virtual('vendorShare').get(function() {
  return this.vendorEarning;
});

commissionTransactionSchema.index({ vendor: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('CommissionTransaction', commissionTransactionSchema);
