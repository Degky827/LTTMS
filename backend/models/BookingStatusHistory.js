const mongoose = require('mongoose');

const bookingStatusHistorySchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking reference is required'],
    index: true
  },
  previousStatus: {
    type: String,
    required: [true, 'Previous status is required']
  },
  newStatus: {
    type: String,
    required: [true, 'New status is required']
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  actorRole: {
    type: String,
    enum: ['tourist', 'vendor', 'support', 'admin', 'super_admin', 'system'],
    default: 'system'
  },
  reason: {
    type: String,
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

bookingStatusHistorySchema.index({ booking: 1, timestamp: -1 });

module.exports = mongoose.model('BookingStatusHistory', bookingStatusHistorySchema);
