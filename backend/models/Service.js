const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: [true, 'Service must belong to a vendor'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: {
      values: ['tour', 'hotel', 'food', 'monastery', 'boat', 'waterfall'],
      message: '{VALUE} is not a valid service category'
    },
    index: true
  },
  categoryRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  destination: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination',
    default: null
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price cannot be negative']
  },
  currency: {
    type: String,
    default: 'ETB',
    uppercase: true,
    trim: true
  },
  dailyCapacity: {
    type: Number,
    default: 20,
    min: [1, 'Daily capacity must be at least 1']
  },
  duration: {
    type: String,
    trim: true,
    default: null
  },
  location: {
    type: String,
    trim: true,
    default: null
  },
  highlights: {
    type: [String],
    default: []
  },
  availability: {
    type: Boolean,
    default: true,
    index: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published',
    index: true
  },
  images: {
    type: [String],
    default: []
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot exceed 5'],
    set: (v) => Math.round(v * 10) / 10 // Round to 1 decimal place
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  ecoFriendly: {
    type: Boolean,
    default: false,
    index: true
  },
  ecoFeatures: {
    type: [String],
    default: []
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for catalog search, filtering, and sorting performance
serviceSchema.index({ title: 'text', description: 'text' });
serviceSchema.index({ category: 1, ecoFriendly: 1, price: 1, rating: -1 });
serviceSchema.index({ vendor: 1, status: 1 });

module.exports = mongoose.model('Service', serviceSchema);
