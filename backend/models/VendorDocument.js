const mongoose = require('mongoose');

const vendorDocumentSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: [true, 'Vendor reference is required'],
    index: true
  },
  documentType: {
    type: String,
    enum: {
      values: ['business_license', 'registration_certificate', 'id_card', 'operating_permit', 'tax_certificate', 'other'],
      message: '{VALUE} is not a valid document type'
    },
    required: [true, 'Document type is required'],
    index: true
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required']
  },
  originalFilename: {
    type: String,
    required: [true, 'Original filename is required']
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type is required']
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required']
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected'],
    default: 'submitted',
    index: true
  },
  rejectionReason: {
    type: String,
    default: null
  },
  reviewer: {
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

vendorDocumentSchema.index({ vendor: 1, documentType: 1, status: 1 });

module.exports = mongoose.model('VendorDocument', vendorDocumentSchema);
