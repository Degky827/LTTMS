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
  slug: {
    type: String,
    lowercase: true,
    trim: true,
    index: true
  },
  shortDescription: {
    type: String,
    maxlength: [300, 'Short description cannot exceed 300 characters'],
    default: null
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  serviceType: {
    type: String,
    enum: {
      values: [
        'tour', 'boat', 'hotel', 'food', 'monastery', 'waterfall',
        'boat_tour', 'guided_tour', 'accommodation', 'cultural_experience',
        'nature_wildlife', 'other'
      ],
      message: '{VALUE} is not a valid service type'
    },
    default: 'tour',
    index: true
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    index: true
  },
  categoryRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
    index: true
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
    index: true
  },
  destination: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination',
    default: null,
    index: true
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
  pricingUnit: {
    type: String,
    enum: ['per_person', 'per_group', 'per_hour', 'per_day', 'per_night'],
    default: 'per_person'
  },
  adultPrice: {
    type: Number,
    min: 0,
    default: null
  },
  childPrice: {
    type: Number,
    min: 0,
    default: null
  },
  groupPricing: [{
    minGroupSize: { type: Number, min: 1 },
    maxGroupSize: { type: Number, min: 1 },
    pricePerGroup: { type: Number, min: 0 }
  }],
  extraCharges: [{
    name: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 }
  }],
  dailyCapacity: {
    type: Number,
    default: 20,
    min: [1, 'Daily capacity must be at least 1']
  },
  minBookingCapacity: {
    type: Number,
    default: 1,
    min: [1, 'Minimum booking capacity must be at least 1']
  },
  maxBookingCapacity: {
    type: Number,
    default: 20,
    min: [1, 'Maximum booking capacity must be at least 1']
  },
  operatingDays: {
    type: [String],
    default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  },
  timeSlots: [{
    startTime: { type: String, required: true }, // e.g. "09:00"
    endTime: { type: String, required: true },   // e.g. "12:00"
    maxCapacity: { type: Number, default: 20, min: 1 }
  }],
  unavailableDates: {
    type: [Date],
    default: []
  },
  seasonalAvailability: {
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    isAvailable: { type: Boolean, default: true }
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
  coordinates: {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null }
  },
  included: {
    type: [String],
    default: []
  },
  excluded: {
    type: [String],
    default: []
  },
  requirements: {
    type: [String],
    default: []
  },
  whatToBring: {
    type: [String],
    default: []
  },
  languages: {
    type: [String],
    default: ['Amharic', 'English']
  },
  accessibility: {
    type: String,
    default: null
  },
  cancellationPolicy: {
    type: String,
    default: 'Free cancellation up to 24 hours before experience start time.'
  },
  safetyInfo: {
    type: String,
    default: 'Life jackets provided for boat tours; certified first-aid trained guides.'
  },
  highlights: {
    type: [String],
    default: []
  },
  coverImage: {
    type: String,
    default: null
  },
  images: {
    type: [String],
    default: []
  },
  gallery: [{
    id: { type: String, required: true },
    url: { type: String, required: true },
    caption: { type: String, default: '' },
    displayOrder: { type: Number, default: 0 },
    isCover: { type: Boolean, default: false }
  }],
  availability: {
    type: Boolean,
    default: true,
    index: true
  },
  status: {
    type: String,
    enum: ['draft', 'pending_review', 'published', 'rejected', 'suspended', 'archived'],
    default: 'published',
    index: true
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  moderationFeedback: {
    type: String,
    default: null
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot exceed 5'],
    set: (v) => Math.round(v * 10) / 10
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
  },
  ecoBadge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EcoBadge',
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for catalog search, filtering, and sorting performance
serviceSchema.index({ title: 'text', description: 'text', highlights: 'text', location: 'text' });
serviceSchema.index({ category: 1, ecoFriendly: 1, price: 1, rating: -1, status: 1 });
serviceSchema.index({ vendor: 1, status: 1 });
serviceSchema.index({ destination: 1, status: 1 });

module.exports = mongoose.model('Service', serviceSchema);
