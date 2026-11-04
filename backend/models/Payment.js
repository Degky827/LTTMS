const mongoose = require('mongoose');
const crypto = require('crypto');

const paymentSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Payment must be associated with a booking'],
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Payment must belong to a user'],
    index: true,
    alias: 'tourist'
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    default: null,
    index: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    default: null,
    index: true
  },
  txRef: {
    type: String,
    required: [true, 'Transaction reference is required'],
    unique: true,
    trim: true,
    index: true,
    alias: 'localTransactionReference'
  },
  merchantReference: {
    type: String,
    trim: true,
    default: null,
    index: true
  },
  chapaReference: {
    type: String,
    trim: true,
    default: null,
    index: true
  },
  processorReference: {
    type: String,
    trim: true,
    default: null
  },
  provider: {
    type: String,
    default: 'chapa',
    trim: true
  },
  providerApiVersion: {
    type: String,
    default: 'v1',
    trim: true
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
  providerAmount: {
    type: Number,
    default: null
  },
  providerCurrency: {
    type: String,
    default: 'ETB',
    uppercase: true,
    trim: true
  },
  serviceFee: {
    type: Number,
    default: 0,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['telebirr', 'cbe', 'amole', 'paypal', 'stripe', 'chapa'],
    default: 'chapa'
  },
  status: {
    type: String,
    enum: {
      values: [
        'initiated',
        'pending',
        'successful',
        'success',
        'failed',
        'cancelled',
        'expired',
        'partially_refunded',
        'refunded'
      ],
      message: '{VALUE} is not a valid payment status'
    },
    default: 'pending',
    index: true
  },
  checkoutUrl: {
    type: String,
    default: null
  },
  receiptNumber: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  idempotencyKey: {
    type: String,
    trim: true,
    default: null
  },
  initializedAt: {
    type: Date,
    default: Date.now
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  paidAt: {
    type: Date,
    default: null
  },
  failedAt: {
    type: Date,
    default: null
  },
  failureReason: {
    type: String,
    default: null
  },
  providerResponseMetadata: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  rawWebhookPayload: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
    select: false
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

// Auto-generate unique receipt number if missing and payment is successful
paymentSchema.pre('validate', function(next) {
  if (!this.receiptNumber && ['successful', 'success'].includes(this.status)) {
    const year = new Date().getFullYear();
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    this.receiptNumber = `RCP-${year}-${randomHex}`;
  }
  next();
});

paymentSchema.index({ vendor: 1, status: 1, createdAt: -1 });
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ booking: 1, createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
