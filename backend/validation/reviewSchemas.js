const { z } = require('zod');

const createReviewSchema = z.object({
  body: z.object({
    service: z.string().optional(),
    serviceId: z.string().optional(),
    rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
    title: z.string().max(200).optional(),
    comment: z.string().min(3, 'Comment must be at least 3 characters').max(2000),
    booking: z.string().optional().nullable(),
    bookingId: z.string().optional().nullable(),
    images: z.array(z.string()).optional(),
    categories: z.object({
      cleanliness: z.number().min(1).max(5).optional(),
      ecoFriendly: z.number().min(1).max(5).optional(),
      hospitality: z.number().min(1).max(5).optional(),
      value: z.number().min(1).max(5).optional()
    }).optional()
  }).refine(data => Boolean(data.service || data.serviceId), {
    message: 'Service ID is required',
    path: ['service']
  }),
  params: z.object({
    serviceId: z.string().optional()
  }).optional(),
  query: z.object({}).optional()
});

const updateReviewSchema = z.object({
  params: z.object({
    reviewId: z.string().min(1, 'Review ID is required')
  }),
  body: z.object({
    rating: z.number().int().min(1).max(5).optional(),
    title: z.string().max(200).optional(),
    comment: z.string().min(3).max(2000).optional(),
    images: z.array(z.string()).optional(),
    categories: z.object({
      cleanliness: z.number().min(1).max(5).optional(),
      ecoFriendly: z.number().min(1).max(5).optional(),
      hospitality: z.number().min(1).max(5).optional(),
      value: z.number().min(1).max(5).optional()
    }).optional()
  }),
  query: z.object({}).optional()
});

const reportReviewSchema = z.object({
  params: z.object({
    reviewId: z.string().min(1, 'Review ID is required')
  }),
  body: z.object({
    reason: z.enum(['spam', 'harassment', 'fake_review', 'irrelevant', 'personal_info', 'other']),
    description: z.string().max(500).optional()
  }),
  query: z.object({}).optional()
});

const vendorResponseSchema = z.object({
  params: z.object({
    reviewId: z.string().min(1, 'Review ID is required')
  }),
  body: z.object({
    response: z.string().min(2, 'Response must be at least 2 characters').max(2000)
  }),
  query: z.object({}).optional()
});

const moderateReviewSchema = z.object({
  params: z.object({
    reviewId: z.string().min(1, 'Review ID is required')
  }),
  body: z.object({
    action: z.enum(['approve', 'reject', 'hide', 'restore', 'flag']),
    reason: z.string().max(500).optional()
  }),
  query: z.object({}).optional()
});

module.exports = {
  createReviewSchema,
  updateReviewSchema,
  reportReviewSchema,
  vendorResponseSchema,
  moderateReviewSchema
};
