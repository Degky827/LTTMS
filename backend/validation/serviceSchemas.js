const { z } = require('zod');

const serviceQuerySchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(50).optional(),
    category: z.enum(['tour', 'hotel', 'food', 'monastery', 'boat', 'waterfall']).optional(),
    sortBy: z.enum(['featured', 'price-low', 'price-high', 'rating']).optional(),
    ecoFriendly: z.enum(['true', 'false']).optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    search: z.string().max(100).optional()
  }).optional()
});

module.exports = { serviceQuerySchema };
