const { z } = require('zod');

const serviceQuerySchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(50).optional(),
    category: z.string().optional(),
    categoryRef: z.string().optional(),
    subcategory: z.string().optional(),
    destination: z.string().optional(),
    serviceType: z.string().optional(),
    vendor: z.string().optional(),
    status: z.enum(['draft', 'pending_review', 'published', 'rejected', 'suspended', 'archived']).optional(),
    sortBy: z.enum(['featured', 'newest', 'oldest', 'price-low', 'price-high', 'rating', 'alpha']).optional(),
    ecoFriendly: z.enum(['true', 'false']).optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    currency: z.string().optional(),
    duration: z.string().optional(),
    rating: z.coerce.number().min(0).max(5).optional(),
    search: z.string().max(100).optional()
  }).optional()
});

const createServiceSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(200),
    slug: z.string().optional(),
    shortDescription: z.string().max(300).optional(),
    description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
    price: z.number().min(0, 'Price cannot be negative'),
    currency: z.string().optional(),
    category: z.string().min(1, 'Category is required'),
    categoryRef: z.string().optional(),
    subcategory: z.string().optional(),
    destination: z.string().optional(),
    serviceType: z.enum([
      'tour', 'boat', 'hotel', 'food', 'monastery', 'waterfall',
      'boat_tour', 'guided_tour', 'accommodation', 'cultural_experience',
      'nature_wildlife', 'other'
    ]).optional(),
    pricingUnit: z.enum(['per_person', 'per_group', 'per_hour', 'per_day', 'per_night']).optional(),
    adultPrice: z.number().min(0).optional(),
    childPrice: z.number().min(0).optional(),
    groupPricing: z.array(z.object({
      minGroupSize: z.number().min(1),
      maxGroupSize: z.number().min(1),
      pricePerGroup: z.number().min(0)
    })).optional(),
    extraCharges: z.array(z.object({
      name: z.string(),
      amount: z.number().min(0)
    })).optional(),
    duration: z.string().optional(),
    location: z.string().optional(),
    coordinates: z.object({
      latitude: z.number().optional(),
      longitude: z.number().optional()
    }).optional(),
    dailyCapacity: z.number().int().positive().optional(),
    minBookingCapacity: z.number().int().min(1).optional(),
    maxBookingCapacity: z.number().int().min(1).optional(),
    operatingDays: z.array(z.string()).optional(),
    timeSlots: z.array(z.object({
      startTime: z.string(),
      endTime: z.string(),
      maxCapacity: z.number().int().positive().optional()
    })).optional(),
    included: z.array(z.string()).optional(),
    excluded: z.array(z.string()).optional(),
    requirements: z.array(z.string()).optional(),
    whatToBring: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional(),
    accessibility: z.string().optional(),
    cancellationPolicy: z.string().optional(),
    safetyInfo: z.string().optional(),
    ecoFriendly: z.boolean().optional(),
    ecoFeatures: z.array(z.string()).optional(),
    images: z.array(z.string()).optional(),
    coverImage: z.string().optional(),
    highlights: z.array(z.string()).optional(),
    status: z.enum(['draft', 'pending_review', 'published', 'archived']).optional()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const updateServiceSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(200).optional(),
    slug: z.string().optional(),
    shortDescription: z.string().max(300).optional(),
    description: z.string().min(10).max(5000).optional(),
    price: z.number().min(0).optional(),
    currency: z.string().optional(),
    category: z.string().optional(),
    categoryRef: z.string().optional(),
    subcategory: z.string().optional(),
    destination: z.string().optional(),
    serviceType: z.enum([
      'tour', 'boat', 'hotel', 'food', 'monastery', 'waterfall',
      'boat_tour', 'guided_tour', 'accommodation', 'cultural_experience',
      'nature_wildlife', 'other'
    ]).optional(),
    pricingUnit: z.enum(['per_person', 'per_group', 'per_hour', 'per_day', 'per_night']).optional(),
    adultPrice: z.number().min(0).optional(),
    childPrice: z.number().min(0).optional(),
    groupPricing: z.array(z.object({
      minGroupSize: z.number().min(1),
      maxGroupSize: z.number().min(1),
      pricePerGroup: z.number().min(0)
    })).optional(),
    extraCharges: z.array(z.object({
      name: z.string(),
      amount: z.number().min(0)
    })).optional(),
    duration: z.string().optional(),
    location: z.string().optional(),
    coordinates: z.object({
      latitude: z.number().optional(),
      longitude: z.number().optional()
    }).optional(),
    dailyCapacity: z.number().int().positive().optional(),
    minBookingCapacity: z.number().int().min(1).optional(),
    maxBookingCapacity: z.number().int().min(1).optional(),
    operatingDays: z.array(z.string()).optional(),
    timeSlots: z.array(z.object({
      startTime: z.string(),
      endTime: z.string(),
      maxCapacity: z.number().int().positive().optional()
    })).optional(),
    included: z.array(z.string()).optional(),
    excluded: z.array(z.string()).optional(),
    requirements: z.array(z.string()).optional(),
    whatToBring: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional(),
    accessibility: z.string().optional(),
    cancellationPolicy: z.string().optional(),
    safetyInfo: z.string().optional(),
    ecoFriendly: z.boolean().optional(),
    ecoFeatures: z.array(z.string()).optional(),
    images: z.array(z.string()).optional(),
    coverImage: z.string().optional(),
    highlights: z.array(z.string()).optional(),
    status: z.enum(['draft', 'pending_review', 'published', 'archived']).optional()
  }),
  params: z.object({
    id: z.string()
  }).optional(),
  query: z.object({}).optional()
});

const servicePricingSchema = z.object({
  body: z.object({
    price: z.number().min(0, 'Base price must be positive'),
    currency: z.string().optional(),
    pricingUnit: z.enum(['per_person', 'per_group', 'per_hour', 'per_day', 'per_night']).optional(),
    adultPrice: z.number().min(0).nullable().optional(),
    childPrice: z.number().min(0).nullable().optional(),
    groupPricing: z.array(z.object({
      minGroupSize: z.number().min(1),
      maxGroupSize: z.number().min(1),
      pricePerGroup: z.number().min(0)
    })).optional(),
    extraCharges: z.array(z.object({
      name: z.string(),
      amount: z.number().min(0)
    })).optional()
  }),
  params: z.object({
    id: z.string()
  }).optional(),
  query: z.object({}).optional()
});

const serviceAvailabilitySchema = z.object({
  body: z.object({
    dailyCapacity: z.number().int().min(1).optional(),
    minBookingCapacity: z.number().int().min(1).optional(),
    maxBookingCapacity: z.number().int().min(1).optional(),
    operatingDays: z.array(z.string()).optional(),
    timeSlots: z.array(z.object({
      startTime: z.string(),
      endTime: z.string(),
      maxCapacity: z.number().int().min(1).optional()
    })).optional(),
    unavailableDates: z.array(z.string().or(z.date())).optional(),
    seasonalAvailability: z.object({
      startDate: z.string().or(z.date()).nullable().optional(),
      endDate: z.string().or(z.date()).nullable().optional(),
      isAvailable: z.boolean().optional()
    }).optional()
  }),
  params: z.object({
    id: z.string()
  }).optional(),
  query: z.object({}).optional()
});

const serviceImageSchema = z.object({
  body: z.object({
    url: z.string().min(1, 'Image URL is required'),
    caption: z.string().max(200).optional(),
    displayOrder: z.number().int().optional(),
    isCover: z.boolean().optional()
  }),
  params: z.object({
    id: z.string()
  }).optional(),
  query: z.object({}).optional()
});

const serviceImageUpdateSchema = z.object({
  body: z.object({
    caption: z.string().max(200).optional(),
    displayOrder: z.number().int().optional(),
    isCover: z.boolean().optional()
  }),
  params: z.object({
    id: z.string(),
    imageId: z.string()
  }).optional(),
  query: z.object({}).optional()
});

const serviceImageReorderSchema = z.object({
  body: z.object({
    orderedImageIds: z.array(z.string()).min(1)
  }),
  params: z.object({
    id: z.string()
  }).optional(),
  query: z.object({}).optional()
});

const serviceModerationSchema = z.object({
  body: z.object({
    reason: z.string().optional(),
    feedback: z.string().optional()
  }),
  params: z.object({
    id: z.string()
  }).optional(),
  query: z.object({}).optional()
});

module.exports = {
  serviceQuerySchema,
  createServiceSchema,
  updateServiceSchema,
  servicePricingSchema,
  serviceAvailabilitySchema,
  serviceImageSchema,
  serviceImageUpdateSchema,
  serviceImageReorderSchema,
  serviceModerationSchema
};
