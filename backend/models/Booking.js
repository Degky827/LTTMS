const mongoose = require('mongoose');
const crypto = require('crypto');

const bookingSchema = new mongoose.Schema({
  bookingReference: {
    type: String,
    unique: true,
    index: true,
    default: () => {
      const year = new Date().getFullYear();
      const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
      return `LTTMS-${year}-${randomHex}`;
    }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a tourist user'],
    index: true,
    alias: 'tourist'
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
  destination: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination',
    default: null,
    index: true
  },
  date: {
    type: Date,
    required: [true, 'Please add a booking date'],
    index: true,
    alias: 'bookingDate'
  },
  startTime: {
    type: String,
    default: null,
    trim: true
  },
  endTime: {
    type: String,
    default: null,
    trim: true
  },
  timezone: {
    type: String,
    default: 'Africa/Addis_Ababa',
    trim: true
  },
  timeSlot: {
    type: String,
    default: 'all_day',
    trim: true
  },
  adults: {
    type: Number,
    default: 1,
    min: [0, 'Adults cannot be negative']
  },
  children: {
    type: Number,
    default: 0,
    min: [0, 'Children cannot be negative']
  },
  guests: {
    type: Number,
    required: [true, 'Please specify the number of guests'],
    default: 1,
    min: [1, 'Number of guests must be at least 1'],
    max: [100, 'Guests cannot exceed 100 per booking'],
    alias: 'totalParticipants'
  },
  selectedOptions: [{
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, default: 1, min: 1 }
  }],
  specialRequests: {
    type: String,
    maxlength: [1000, 'Special requests cannot exceed 1000 characters'],
    default: null
  },
  contactInformation: {
    fullName: { type: String, default: null },
    email: { type: String, default: null },
    phone: { type: String, default: null }
  },
  // Pricing Snapshot: authoritative breakdown calculated on backend
  pricingSnapshot: {
    unitPrice: { type: Number, default: 0 },
    adultPrice: { type: Number, default: 0 },
    childPrice: { type: Number, default: 0 },
    groupDiscount: { type: Number, default: 0 },
    extraCharges: [{
      name: { type: String },
      amount: { type: Number, min: 0 }
    }],
    subtotal: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    currency: { type: String, default: 'ETB' }
  },
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
  confirmationType: {
    type: String,
    enum: ['instant', 'vendor_confirmation'],
    default: 'instant'
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'confirmed', 'completed', 'cancelled', 'rejected', 'expired'],
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
  holdExpiresAt: {
    type: Date,
    default: null,
    index: true
  },
  cancellationPolicySnapshot: {
    type: String,
    default: null
  },
  idempotencyKey: {
    type: String,
    trim: true,
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
  },
  rejectionReason: {
    type: String,
    default: null
  },
  rejectedAt: {
    type: Date,
    default: null
  },
  rejectedBy: {
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
    const year = new Date().getFullYear();
    const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
    this.bookingReference = `LTTMS-${year}-${randomHex}`;
  }
  if (this.totalAmount === undefined && this.totalPrice !== undefined) {
    this.totalAmount = this.totalPrice;
  }
  if (this.priceSnapshot === undefined && this.totalAmount !== undefined) {
    this.priceSnapshot = this.totalAmount / (this.guests || 1);
  }
  if (this.adults !== undefined && this.children !== undefined) {
    const calculatedGuests = (this.adults || 0) + (this.children || 0);
    if (calculatedGuests > 0) {
      this.guests = calculatedGuests;
    }
  }
  next();
});

// Status history virtual populate
bookingSchema.virtual('statusHistory', {
  ref: 'BookingStatusHistory',
  localField: '_id',
  foreignField: 'booking'
});

// Compound indexes for high-frequency queries
bookingSchema.index({ service: 1, date: 1, status: 1 });
bookingSchema.index({ vendor: 1, status: 1, date: -1 });
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ holdExpiresAt: 1, status: 1 });

// Authoritative idempotency constraint: Enforce unique idempotency keys only for non-empty strings.
bookingSchema.index(
  { idempotencyKey: 1 },
  {
    unique: true,
    partialFilterExpression: {
      idempotencyKey: { $type: 'string', $gt: '' }
    }
  }
);

module.exports = mongoose.model('Booking', bookingSchema);
