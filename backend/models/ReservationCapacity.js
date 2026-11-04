const mongoose = require('mongoose');

const reservationCapacitySchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Service reference is required'],
    index: true
  },
  date: {
    type: Date,
    required: [true, 'Service date is required'],
    index: true
  },
  timeSlot: {
    type: String,
    default: 'all_day',
    trim: true,
    index: true
  },
  totalCapacity: {
    type: Number,
    required: [true, 'Total capacity is required'],
    min: [0, 'Total capacity cannot be negative']
  },
  reservedCapacity: {
    type: Number,
    default: 0,
    min: [0, 'Reserved capacity cannot be negative']
  },
  heldCapacity: {
    type: Number,
    default: 0,
    min: [0, 'Held capacity cannot be negative']
  },
  remainingCapacity: {
    type: Number,
    required: true,
    min: [0, 'Remaining capacity cannot be negative']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Enforce unique capacity slot per service, date, and time slot
reservationCapacitySchema.index({ service: 1, date: 1, timeSlot: 1 }, { unique: true });
reservationCapacitySchema.index({ service: 1, date: 1 });

module.exports = mongoose.model('ReservationCapacity', reservationCapacitySchema);
