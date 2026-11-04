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
  slug: {
    type: String,
    lowercase: true,
    trim: true,
    index: true
  },
  businessDescription: {
    type: String,
    maxlength: [3000, 'Description cannot exceed 3000 characters']
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
  registrationNumber: {
    type: String,
    trim: true,
    default: null
  },
  licenseNumber: {
    type: String,
    trim: true,
    default: null
  },
  taxId: {
    type: String,
    trim: true,
    default: null
  },
  logo: {
    type: String,
    default: null
  },
  coverImage: {
    type: String,
    default: null
  },
  gallery: {
    type: [String],
    default: []
  },
  establishedDate: {
    type: Date,
    default: null
  },
  businessEmail: {
    type: String,
    trim: true,
    lowercase: true,
    default: null
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone cannot exceed 20 characters']
  },
  altPhone: {
    type: String,
    trim: true,
    maxlength: [20, 'Alternate phone cannot exceed 20 characters'],
    default: null
  },
  website: {
    type: String,
    trim: true,
    default: null
  },
  socialLinks: {
    facebook: { type: String, default: null },
    instagram: { type: String, default: null },
    twitter: { type: String, default: null },
    linkedin: { type: String, default: null }
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
  region: {
    type: String,
    default: 'Amhara',
    trim: true
  },
  zone: {
    type: String,
    default: null,
    trim: true
  },
  woreda: {
    type: String,
    default: null,
    trim: true
  },
  coordinates: {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null }
  },
  operatingHours: {
    type: String,
    default: null
  },
  languages: {
    type: [String],
    default: ['Amharic', 'English']
  },
  servicesOffered: {
    type: [String],
    default: []
  },
  destinations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination'
  }],
  ecoTourismInfo: {
    practices: { type: [String], default: [] },
    certifications: { type: [String], default: [] },
    communityInitiatives: { type: String, default: null }
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
  ecoBadges: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EcoBadge'
  }],
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  verificationStatus: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected'],
    default: 'draft',
    index: true
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'approved', 'rejected', 'suspended', 'blacklisted', 'inactive'],
      message: '{VALUE} is not a valid vendor status'
    },
    default: 'pending',
    index: true
  },
  licenseFile: {
    type: String,
    default: null
  },
  adminNotes: {
    type: String,
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
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

vendorSchema.index({ businessName: 'text', description: 'text', location: 'text' });
vendorSchema.index({ status: 1, verificationStatus: 1, businessType: 1 });

module.exports = mongoose.model('Vendor', vendorSchema);
