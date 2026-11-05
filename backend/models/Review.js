const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to a tourist user'],
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
    required: [true, 'Review must specify a tourism service'],
    index: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null,
    index: true
  },
  rating: {
    type: Number,
    required: [true, 'Please add a rating between 1 and 5'],
    min: [1, 'Rating must be at least 1 star'],
    max: [5, 'Rating cannot exceed 5 stars'],
    index: true
  },
  title: {
    type: String,
    trim: true,
    maxlength: [200, 'Review title cannot exceed 200 characters'],
    default: null
  },
  comment: {
    type: String,
    required: [true, 'Please add review comments'],
    trim: true,
    minlength: [5, 'Review must be at least 5 characters'],
    maxlength: [2000, 'Review cannot exceed 2000 characters']
  },
  images: [{
    type: String,
    trim: true
  }],
  categories: {
    cleanliness: { type: Number, min: 1, max: 5, default: 5 },
    ecoFriendly: { type: Number, min: 1, max: 5, default: 5 },
    hospitality: { type: Number, min: 1, max: 5, default: 5 },
    value: { type: Number, min: 1, max: 5, default: 5 }
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'approved', 'rejected', 'hidden', 'flagged'],
      message: '{VALUE} is not a valid review status'
    },
    default: 'approved',
    index: true
  },
  isVerifiedBooking: {
    type: Boolean,
    default: false,
    alias: 'isVerifiedBuyer'
  },
  vendorResponse: {
    response: { type: String, trim: true, maxlength: 2000, default: null },
    respondedAt: { type: Date, default: null },
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
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
  helpfulCount: {
    type: Number,
    default: 0,
    min: 0
  },
  reportedCount: {
    type: Number,
    default: 0,
    min: 0
  },
  reports: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: {
      type: String,
      enum: ['spam', 'harassment', 'fake_review', 'irrelevant', 'personal_info', 'other'],
      default: 'other'
    },
    description: { type: String, trim: true, maxlength: 500 },
    reportedAt: { type: Date, default: Date.now }
  }],
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
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  moderationReason: {
    type: String,
    default: null
  },
  moderatedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-validate synchronization between vendorReply and vendorResponse
reviewSchema.pre('validate', function(next) {
  if (this.vendorReply && !this.vendorResponse?.response) {
    this.vendorResponse = {
      response: this.vendorReply,
      respondedAt: this.repliedAt || new Date(),
      respondedBy: null
    };
  } else if (this.vendorResponse?.response && !this.vendorReply) {
    this.vendorReply = this.vendorResponse.response;
    this.repliedAt = this.vendorResponse.respondedAt;
  }
  next();
});

// CRITICAL ANTI-SPAM & INTEGRITY CONSTRAINT:
// Prevent a single user from spamming multiple reviews for the same service
reviewSchema.index({ user: 1, service: 1 }, { unique: true });
reviewSchema.index({ service: 1, rating: -1, createdAt: -1 });
reviewSchema.index({ vendor: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
