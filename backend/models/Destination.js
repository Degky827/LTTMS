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
  description: {
    type: String,
    required: [true, 'Please add a description of the destination'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
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
    address: {
      type: String,
      default: null
    },
    region: {
      type: String,
      default: 'Lake Tana, Amhara, Ethiopia'
    }
  },
  images: {
    type: [String],
    default: []
  },
  highlights: {
    type: [String],
    default: []
  },
  travelTips: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published',
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

destinationSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Destination', destinationSchema);
