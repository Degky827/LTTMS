const mongoose = require('mongoose');
const crypto = require('crypto');

const refundRequestSchema = new mongoose.Schema({
  refundReference: {
    type: String,
    unique: true,
    index: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Refund request must specify a booking'],
    index: true
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    default: null
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    default: null,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Refund request must specify requesting user'],
    index: true
  },
  amount: {
    type: Number,
    required: [true, 'Refund amount is required'],
    min: [0, 'Refund amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'ETB',
    uppercase: true,
    trim: true
  },
  reason: {
    type: String,
    required: [true, 'Please provide a reason for the refund'],
    enum: {
      values: [
        'cancellation',
        'service_not_provided',
        'bad_weather',
        'vendor_cancelled',
        'duplicate_charge',
        'other'
      ],
      message: '{VALUE} is not a valid refund reason'
    }
  },
  description: {
    type: String,
    required: [true, 'Please provide additional details'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: {
      values: ['requested', 'submitted', 'under_review', 'approved', 'rejected', 'processing', 'processed', 'completed'],
      message: '{VALUE} is not a valid refund status'
    },
    default: 'requested',
    index: true
  },
  adminNote: {
    type: String,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  chapaRefundReference: {
    type: String,
    default: null
  },
  processedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

refundRequestSchema.pre('validate', function (next) {
  if (!this.refundReference) {
    const year = new Date().getFullYear();
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    this.refundReference = `REF-${year}-${randomHex}`;
  }
  next();
});

refundRequestSchema.index({ status: 1, createdAt: -1 });
refundRequestSchema.index({ user: 1, createdAt: -1 });
refundRequestSchema.index({ vendor: 1, status: 1 });

module.exports = mongoose.model('RefundRequest', refundRequestSchema);
