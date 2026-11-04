const mongoose = require('mongoose');

const vendorLedgerSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: [true, 'Vendor is required for ledger entry'],
    index: true
  },
  entryType: {
    type: String,
    enum: {
      values: [
        'booking_credit',
        'platform_commission',
        'refund_debit',
        'commission_reversal',
        'settlement_debit',
        'settlement_adjustment'
      ],
      message: '{VALUE} is not a valid ledger entry type'
    },
    required: [true, 'Entry type is required'],
    index: true,
    alias: 'type'
  },
  amount: {
    type: Number,
    required: [true, 'Ledger entry amount is required'],
    min: [0, 'Entry amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'ETB',
    uppercase: true,
    trim: true
  },
  balanceAfter: {
    type: Number,
    required: [true, 'Balance after entry is required']
  },
  reference: {
    type: String,
    trim: true,
    default: null,
    index: true
  },
  description: {
    type: String,
    trim: true,
    default: null
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    default: null,
    index: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null,
    index: true
  },
  settlement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Settlement',
    default: null,
    index: true
  },
  refundRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RefundRequest',
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
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

vendorLedgerSchema.index({ vendor: 1, createdAt: -1 });
vendorLedgerSchema.index({ vendor: 1, entryType: 1 });

module.exports = mongoose.model('VendorLedger', vendorLedgerSchema);
