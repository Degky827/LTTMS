const mongoose = require('mongoose');
const crypto = require('crypto');

const bookingSchema = new mongoose.Schema({
  bookingReference: {
    type: String,
    unique: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a tourist user'],
    index: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: [true, 'Booking must belong to a vendor'],
    index: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Booking must specify a tourism service'],
    index: true
  },
  date: {
    type: Date,
    required: [true, 'Please add a booking date'],
    index: true
  },
  timeSlot: {
    type: String,
    enum: ['morning', 'afternoon', 'sunset', 'full_day'],
    default: 'full_day'
  },
  guests: {
    type: Number,
    required: [true, 'Please specify the number of guests'],
    default: 1,
    min: [1, 'Number of guests must be at least 1'],
    max: [50, 'Guests cannot exceed 50 per booking']
  },
  // Historical Snapshots: Preserve price & title at booking time even if vendor edits service later
  priceSnapshot: {
    type: Number,
    required: [true, 'Price snapshot is required']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative'],
    alias: 'totalPrice'
  },
  currency: {
    type: String,
    default: 'ETB',
    uppercase: true,
    trim: true
  },
  serviceTitleSnapshot: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'confirmed', 'completed', 'cancelled'],
      message: '{VALUE} is not a valid booking status'
    },
    default: 'pending',
    index: true
  },
  paymentStatus: {
    type: String,
    enum: {
      values: ['unpaid', 'paid', 'refunded', 'processing', 'failed'],
      message: '{VALUE} is not a valid payment status'
    },
    default: 'unpaid',
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['telebirr', 'cbe', 'amole', 'paypal', 'stripe', 'chapa'],
    default: 'chapa'
  },
  transactionId: {
    type: String,
    index: true,
    default: null
  },
  idempotencyKey: {
    type: String,
    sparse: true,
    index: true,
    default: null
  },
  adminNote: {
    type: String,
    default: null
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  cancellationReason: {
    type: String,
    default: null
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Auto-generate unique booking reference prior to validation if missing
bookingSchema.pre('validate', function (next) {
  if (!this.bookingReference) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    this.bookingReference = `LTTMS-BKG-${timestamp}-${randomHex}`;
  }
  if (this.totalAmount === undefined && this.totalPrice !== undefined) {
    this.totalAmount = this.totalPrice;
  }
  if (this.priceSnapshot === undefined && this.totalAmount !== undefined) {
    this.priceSnapshot = this.totalAmount / (this.guests || 1);
  }
  next();
});

// Compound indexes for high-frequency queries
bookingSchema.index({ service: 1, date: 1, status: 1 });
bookingSchema.index({ vendor: 1, status: 1, date: -1 });
bookingSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
