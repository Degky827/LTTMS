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

const createServiceSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(200),
    description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
    price: z.number().positive('Price must be positive'),
    category: z.enum(['tour', 'hotel', 'food', 'monastery', 'boat', 'waterfall']),
    duration: z.string().optional(),
    location: z.string().optional(),
    dailyCapacity: z.number().int().positive().optional(),
    ecoFriendly: z.boolean().optional(),
    images: z.array(z.string()).optional(),
    highlights: z.array(z.string()).optional()
  }).strict(),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const updateServiceSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().min(10).max(5000).optional(),
    price: z.number().positive().optional(),
    category: z.enum(['tour', 'hotel', 'food', 'monastery', 'boat', 'waterfall']).optional(),
    duration: z.string().optional(),
    location: z.string().optional(),
    dailyCapacity: z.number().int().positive().optional(),
    ecoFriendly: z.boolean().optional(),
    images: z.array(z.string()).optional(),
    highlights: z.array(z.string()).optional()
  }).strict(),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

module.exports = { serviceQuerySchema, createServiceSchema, updateServiceSchema };
