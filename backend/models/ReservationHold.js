const mongoose = require('mongoose');
const crypto = require('crypto');

const reservationHoldSchema = new mongoose.Schema({
  holdReference: {
    type: String,
    unique: true,
    index: true,
    default: () => {
      const timestamp = Date.now().toString(36).toUpperCase();
      const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
      return `HOLD-${timestamp}-${randomHex}`;
    }
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null,
    index: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Service reference is required'],
    index: true
  },
  serviceDate: {
    type: Date,
    required: [true, 'Service date is required'],
    index: true
  },
  timeSlot: {
    type: String,
    default: 'all_day',
    trim: true
  },
  reservedCapacity: {
    type: Number,
    required: [true, 'Reserved capacity is required'],
    min: [1, 'Reserved capacity must be at least 1']
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'converted', 'released', 'expired'],
      message: '{VALUE} is not a valid hold status'
    },
    default: 'active',
    index: true
  },
  expiresAt: {
    type: Date,
    required: [true, 'Expiration timestamp is required'],
    index: true,
    default: () => new Date(Date.now() + 15 * 60 * 1000)
  },
  convertedAt: {
    type: Date,
    default: null
  },
  releasedAt: {
    type: Date,
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

reservationHoldSchema.pre('validate', function (next) {
  if (!this.holdReference) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    this.holdReference = `HOLD-${timestamp}-${randomHex}`;
  }
  if (!this.expiresAt) {
    // Default 15 minutes hold window
    this.expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  }
  next();
});

reservationHoldSchema.index({ status: 1, expiresAt: 1 });
reservationHoldSchema.index({ service: 1, serviceDate: 1, status: 1 });

module.exports = mongoose.model('ReservationHold', reservationHoldSchema);
