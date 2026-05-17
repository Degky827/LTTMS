const { z } = require('zod');

const createReviewSchema = z.object({
  body: z.object({
    service: z.string().min(1, 'Service ID is required'),
    rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
    comment: z.string().min(3, 'Comment must be at least 3 characters').max(1000)
  }).strict(),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

module.exports = { createReviewSchema };
