const { z } = require('zod');

const vendorProfileSchema = z.object({
  body: z.object({
    businessName: z.string().min(2, 'Business name must be at least 2 characters').max(100),
    businessType: z.enum(['boat_operator', 'hotel', 'lodge', 'restaurant', 'guide', 'tour_operator', 'other']).optional(),
    businessDescription: z.string().max(3000).optional(),
    description: z.string().max(2000).optional(),
    location: z.string().min(2).max(200),
    address: z.string().max(300).optional(),
    city: z.string().max(100).optional(),
    region: z.string().max(100).optional(),
    zone: z.string().max(100).optional(),
    woreda: z.string().max(100).optional(),
    coordinates: z.object({
      latitude: z.number().optional(),
      longitude: z.number().optional()
    }).optional(),
    phone: z.string().min(6).max(20),
    altPhone: z.string().max(20).optional(),
    businessEmail: z.string().email().optional(),
    website: z.string().url().optional().or(z.literal('')),
    socialLinks: z.object({
      facebook: z.string().optional(),
      instagram: z.string().optional(),
      twitter: z.string().optional(),
      linkedin: z.string().optional()
    }).optional(),
    registrationNumber: z.string().optional(),
    licenseNumber: z.string().optional(),
    taxId: z.string().optional(),
    logo: z.string().optional(),
    coverImage: z.string().optional(),
    gallery: z.array(z.string()).optional(),
    establishedDate: z.string().optional(),
    operatingHours: z.string().optional(),
    languages: z.array(z.string()).optional(),
    servicesOffered: z.array(z.string()).optional(),
    destinations: z.array(z.string()).optional(),
    ecoTourismInfo: z.object({
      practices: z.array(z.string()).optional(),
      certifications: z.array(z.string()).optional(),
      communityInitiatives: z.string().optional()
    }).optional()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const updateVendorProfileSchema = z.object({
  body: z.object({
    businessName: z.string().min(2).max(100).optional(),
    businessType: z.enum(['boat_operator', 'hotel', 'lodge', 'restaurant', 'guide', 'tour_operator', 'other']).optional(),
    businessDescription: z.string().max(3000).optional(),
    description: z.string().max(2000).optional(),
    location: z.string().min(2).max(200).optional(),
    address: z.string().max(300).optional(),
    city: z.string().max(100).optional(),
    region: z.string().max(100).optional(),
    zone: z.string().max(100).optional(),
    woreda: z.string().max(100).optional(),
    coordinates: z.object({
      latitude: z.number().optional(),
      longitude: z.number().optional()
    }).optional(),
    phone: z.string().min(6).max(20).optional(),
    altPhone: z.string().max(20).optional(),
    businessEmail: z.string().email().optional(),
    website: z.string().url().optional().or(z.literal('')),
    socialLinks: z.object({
      facebook: z.string().optional(),
      instagram: z.string().optional(),
      twitter: z.string().optional(),
      linkedin: z.string().optional()
    }).optional(),
    registrationNumber: z.string().optional(),
    licenseNumber: z.string().optional(),
    taxId: z.string().optional(),
    logo: z.string().optional(),
    coverImage: z.string().optional(),
    gallery: z.array(z.string()).optional(),
    establishedDate: z.string().optional(),
    operatingHours: z.string().optional(),
    languages: z.array(z.string()).optional(),
    servicesOffered: z.array(z.string()).optional(),
    destinations: z.array(z.string()).optional(),
    ecoTourismInfo: z.object({
      practices: z.array(z.string()).optional(),
      certifications: z.array(z.string()).optional(),
      communityInitiatives: z.string().optional()
    }).optional()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const uploadDocumentSchema = z.object({
  body: z.object({
    documentType: z.enum(['business_license', 'registration_certificate', 'id_card', 'operating_permit', 'tax_certificate', 'other']),
    fileUrl: z.string().min(1, 'File URL is required'),
    originalFilename: z.string().min(1, 'Original filename is required'),
    mimeType: z.string().min(1, 'MIME type is required'),
    fileSize: z.number().positive('File size must be positive')
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const reviewDocumentSchema = z.object({
  body: z.object({
    status: z.enum(['approved', 'rejected']),
    rejectionReason: z.string().optional()
  }),
  params: z.object({
    documentId: z.string()
  }).optional(),
  query: z.object({}).optional()
});

const vendorStatusUpdateSchema = z.object({
  body: z.object({
    reason: z.string().optional(),
    notes: z.string().optional()
  }),
  params: z.object({
    id: z.string()
  }).optional(),
  query: z.object({}).optional()
});

module.exports = {
  vendorProfileSchema,
  updateVendorProfileSchema,
  uploadDocumentSchema,
  reviewDocumentSchema,
  vendorStatusUpdateSchema
};
