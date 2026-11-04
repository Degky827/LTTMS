const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a category name'],
    unique: true,
    trim: true,
    maxlength: [100, 'Category name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: [true, 'Please add a category slug'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    default: null
  },
  icon: {
    type: String,
    default: null
  },
  image: {
    type: String,
    default: null
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentCategory'
});

categorySchema.index({ parentCategory: 1, isActive: 1, displayOrder: 1 });

module.exports = mongoose.model('Category', categorySchema);
