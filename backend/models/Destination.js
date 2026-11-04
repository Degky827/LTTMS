const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a destination name'],
    unique: true,
    trim: true,
    maxlength: [150, 'Destination name cannot exceed 150 characters']
  },
  slug: {
    type: String,
    required: [true, 'Please add a destination slug'],
    unique: true,
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
    required: [true, 'Please add a description of the destination'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  destinationType: {
    type: String,
    enum: {
      values: ['lake', 'monastery', 'waterfall', 'peninsula', 'cultural_site', 'island', 'city', 'other'],
      message: '{VALUE} is not a valid destination type'
    },
    default: 'other',
    index: true
  },
  location: {
    latitude: {
      type: Number,
      default: null
    },
    longitude: {
      type: Number,
      default: null
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: undefined
    },
    address: {
      type: String,
      default: null
    },
    region: {
      type: String,
      default: 'Lake Tana, Amhara, Ethiopia'
    },
    zone: {
      type: String,
      default: null
    },
    woreda: {
      type: String,
      default: null
    },
    specificLocation: {
      type: String,
      default: null
    }
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
    url: { type: String, required: true },
    caption: { type: String, default: '' },
    displayOrder: { type: Number, default: 0 }
  }],
  culturalHistoricalInfo: {
    type: String,
    default: null
  },
  ecologicalInfo: {
    type: String,
    default: null
  },
  activities: {
    type: [String],
    default: []
  },
  accessibility: {
    type: String,
    default: null
  },
  bestSeasons: {
    type: [String],
    default: []
  },
  estimatedDuration: {
    type: String,
    default: null
  },
  entryFee: {
    amount: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'ETB', uppercase: true }
  },
  highlights: {
    type: [String],
    default: []
  },
  travelTips: {
    type: [String],
    default: []
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published',
    index: true
  },
  seoMetadata: {
    title: { type: String, default: null },
    description: { type: String, default: null },
    keywords: { type: [String], default: [] }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

destinationSchema.index({ name: 'text', description: 'text', highlights: 'text' });
destinationSchema.index({ status: 1, isFeatured: -1, destinationType: 1 });

module.exports = mongoose.model('Destination', destinationSchema);
