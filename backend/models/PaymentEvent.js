const mongoose = require('mongoose');

const paymentEventSchema = new mongoose.Schema({
  eventId: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  deliveryId: {
    type: String,
    default: null
  },
  provider: {
    type: String,
    default: 'chapa',
    trim: true
  },
  eventType: {
    type: String,
    default: 'charge.completed',
    trim: true,
    index: true
  },
  txRef: {
    type: String,
    required: [true, 'Transaction reference is required for payment event tracking'],
    index: true
  },
  headers: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  signature: {
    type: String,
    default: null
  },
  signatureValid: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['received', 'processing', 'processed', 'failed', 'ignored'],
    default: 'received',
    index: true
  },
  error: {
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

paymentEventSchema.index({ txRef: 1, eventType: 1, createdAt: -1 });

module.exports = mongoose.model('PaymentEvent', paymentEventSchema);
