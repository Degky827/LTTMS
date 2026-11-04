const mongoose = require('mongoose');

const ecoBadgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add an eco badge name'],
    unique: true,
    trim: true,
    maxlength: [100, 'Badge name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: [true, 'Please add a slug'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  tier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze',
    index: true
  },
  description: {
    type: String,
    required: [true, 'Please add a badge description'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  criteria: {
    type: [String],
    default: []
  },
  icon: {
    type: String,
    default: 'leaf'
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('EcoBadge', ecoBadgeSchema);
