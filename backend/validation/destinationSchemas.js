const { z } = require('zod');

const destinationQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(50).optional(),
    search: z.string().max(100).optional(),
    type: z.enum(['lake', 'monastery', 'waterfall', 'peninsula', 'cultural_site', 'island', 'city', 'other']).optional(),
    isFeatured: z.enum(['true', 'false']).optional(),
    status: z.enum(['draft', 'published', 'archived']).optional()
  }).optional(),
  params: z.object({}).optional(),
  body: z.object({}).optional()
});

const createDestinationSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(150),
    slug: z.string().min(2).max(150).optional(),
    shortDescription: z.string().max(300).optional(),
    description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
    destinationType: z.enum(['lake', 'monastery', 'waterfall', 'peninsula', 'cultural_site', 'island', 'city', 'other']).optional(),
    location: z.object({
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      coordinates: z.array(z.number()).length(2).optional(),
      address: z.string().optional(),
      region: z.string().optional(),
      zone: z.string().optional(),
      woreda: z.string().optional(),
      specificLocation: z.string().optional()
    }).optional(),
    coverImage: z.string().optional(),
    images: z.array(z.string()).optional(),
    gallery: z.array(z.object({
      url: z.string(),
      caption: z.string().optional(),
      displayOrder: z.number().optional()
    })).optional(),
    culturalHistoricalInfo: z.string().optional(),
    ecologicalInfo: z.string().optional(),
    activities: z.array(z.string()).optional(),
    accessibility: z.string().optional(),
    bestSeasons: z.array(z.string()).optional(),
    estimatedDuration: z.string().optional(),
    entryFee: z.object({
      amount: z.number().min(0).optional(),
      currency: z.string().optional()
    }).optional(),
    highlights: z.array(z.string()).optional(),
    travelTips: z.array(z.string()).optional(),
    isFeatured: z.boolean().optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    seoMetadata: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional()
    }).optional()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const updateDestinationSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(150).optional(),
    slug: z.string().min(2).max(150).optional(),
    shortDescription: z.string().max(300).optional(),
    description: z.string().min(10).max(5000).optional(),
    destinationType: z.enum(['lake', 'monastery', 'waterfall', 'peninsula', 'cultural_site', 'island', 'city', 'other']).optional(),
    location: z.object({
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      coordinates: z.array(z.number()).length(2).optional(),
      address: z.string().optional(),
      region: z.string().optional(),
      zone: z.string().optional(),
      woreda: z.string().optional(),
      specificLocation: z.string().optional()
    }).optional(),
    coverImage: z.string().optional(),
    images: z.array(z.string()).optional(),
    gallery: z.array(z.object({
      url: z.string(),
      caption: z.string().optional(),
      displayOrder: z.number().optional()
    })).optional(),
    culturalHistoricalInfo: z.string().optional(),
    ecologicalInfo: z.string().optional(),
    activities: z.array(z.string()).optional(),
    accessibility: z.string().optional(),
    bestSeasons: z.array(z.string()).optional(),
    estimatedDuration: z.string().optional(),
    entryFee: z.object({
      amount: z.number().min(0).optional(),
      currency: z.string().optional()
    }).optional(),
    highlights: z.array(z.string()).optional(),
    travelTips: z.array(z.string()).optional(),
    isFeatured: z.boolean().optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    seoMetadata: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional()
    }).optional()
  }),
  params: z.object({
    id: z.string()
  }).optional(),
  query: z.object({}).optional()
});

module.exports = {
  destinationQuerySchema,
  createDestinationSchema,
  updateDestinationSchema
};
