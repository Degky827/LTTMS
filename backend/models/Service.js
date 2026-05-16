const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['tour', 'hotel', 'food', 'monastery', 'boat', 'waterfall']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  dailyCapacity: {
    type: Number,
    default: 20,
    min: 1
  },
  availability: {
    type: Boolean,
    default: true
  },
  images: [String],
  rating: {
    type: Number,
    default: 0
  },
  ecoFriendly: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

serviceSchema.index({ title: 'text', description: 'text' });
serviceSchema.index({ category: 1, ecoFriendly: 1, price: 1, rating: -1 });

module.exports = mongoose.model('Service', serviceSchema);
