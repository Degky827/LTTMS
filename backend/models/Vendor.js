const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  businessName: {
    type: String,
    required: [true, 'Please add a business name'],
    unique: true,
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Please add a location']
  },
  ecoCertification: {
    type: Boolean,
    default: false
  },
  description: String,
  phone: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended', 'blacklisted'],
    default: 'pending'
  },
  licenseFile: String,
  rejectionReason: String,
  approvedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Vendor', vendorSchema);
