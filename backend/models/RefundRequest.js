const mongoose = require('mongoose');

const refundRequestSchema = new mongoose.Schema({
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
      values: ['requested', 'under_review', 'approved', 'rejected', 'processed'],
      message: '{VALUE} is not a valid refund status'
    },
    default: 'requested',
    index: true
  },
  adminNote: {
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

refundRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('RefundRequest', refundRequestSchema);
