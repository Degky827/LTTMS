const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Vendor must belong to a user account'],
    unique: true
  },
  businessName: {
    type: String,
    required: [true, 'Please add a business name'],
    unique: true,
    trim: true,
    minlength: [2, 'Business name must be at least 2 characters'],
    maxlength: [100, 'Business name cannot exceed 100 characters']
  },
  businessType: {
    type: String,
    enum: {
      values: ['boat_operator', 'hotel', 'lodge', 'restaurant', 'guide', 'tour_operator', 'other'],
      message: '{VALUE} is not a valid business type'
    },
    default: 'tour_operator',
    index: true
  },
  location: {
    type: String,
    required: [true, 'Please add a primary business location'],
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  address: {
    type: String,
    trim: true,
    maxlength: [300, 'Address cannot exceed 300 characters'],
    default: null
  },
  city: {
    type: String,
    default: 'Bahir Dar',
    trim: true
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone cannot exceed 20 characters']
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  ecoCertification: {
    type: Boolean,
    default: false,
    index: true
  },
  ecoBadgeTier: {
    type: String,
    enum: ['none', 'bronze', 'silver', 'gold', 'platinum'],
    default: 'none'
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'approved', 'rejected', 'suspended', 'blacklisted'],
      message: '{VALUE} is not a valid vendor status'
    },
    default: 'pending',
    index: true
  },
  licenseFile: {
    type: String,
    default: null
  },
  taxId: {
    type: String,
    trim: true,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  suspendedAt: {
    type: Date,
    default: null
  },
  suspendedReason: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for query performance
vendorSchema.index({ status: 1, ecoCertification: 1 });

module.exports = mongoose.model('Vendor', vendorSchema);
