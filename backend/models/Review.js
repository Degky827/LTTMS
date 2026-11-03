const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to a tourist user'],
    index: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Review must specify a tourism service'],
    index: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null
  },
  rating: {
    type: Number,
    required: [true, 'Please add a rating between 1 and 5'],
    min: [1, 'Rating must be at least 1 star'],
    max: [5, 'Rating cannot exceed 5 stars'],
    index: true
  },
  categories: {
    cleanliness: { type: Number, min: 1, max: 5, default: 5 },
    ecoFriendly: { type: Number, min: 1, max: 5, default: 5 },
    hospitality: { type: Number, min: 1, max: 5, default: 5 },
    value: { type: Number, min: 1, max: 5, default: 5 }
  },
  comment: {
    type: String,
    required: [true, 'Please add review comments'],
    trim: true,
    minlength: [5, 'Review must be at least 5 characters'],
    maxlength: [2000, 'Review cannot exceed 2000 characters']
  },
  vendorReply: {
    type: String,
    trim: true,
    maxlength: [2000, 'Vendor reply cannot exceed 2000 characters'],
    default: null
  },
  repliedAt: {
    type: Date,
    default: null
  },
  isVerifiedBuyer: {
    type: Boolean,
    default: false
  },
  flagged: {
    type: Boolean,
    default: false,
    index: true
  },
  flagReason: {
    type: String,
    default: null
  },
  flaggedAt: {
    type: Date,
    default: null
  },
  flaggedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isApproved: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// CRITICAL ANTI-SPAM & INTEGRITY CONSTRAINT:
// Prevent a single user from spamming multiple reviews for the same service
reviewSchema.index({ user: 1, service: 1 }, { unique: true });
reviewSchema.index({ service: 1, rating: -1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
