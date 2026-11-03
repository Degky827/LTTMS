const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Payment must be associated with a booking'],
    unique: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Payment must belong to a user'],
    index: true
  },
  txRef: {
    type: String,
    required: [true, 'Transaction reference is required'],
    unique: true,
    trim: true,
    index: true
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'ETB',
    uppercase: true,
    trim: true
  },
  paymentMethod: {
    type: String,
    enum: ['telebirr', 'cbe', 'amole', 'paypal', 'stripe', 'chapa'],
    default: 'chapa'
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'success', 'failed', 'refunded'],
      message: '{VALUE} is not a valid transaction status'
    },
    default: 'pending',
    index: true
  },
  chapaReference: {
    type: String,
    default: null
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  rawWebhookPayload: {
    type: mongoose.Schema.Types.Mixed,
    default: null
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

module.exports = mongoose.model('Payment', paymentSchema);
