const { z } = require('zod');

const categoryQuerySchema = z.object({
  query: z.object({
    isActive: z.enum(['true', 'false']).optional(),
    parent: z.string().optional(),
    tree: z.enum(['true', 'false']).optional()
  }).optional(),
  params: z.object({}).optional(),
  body: z.object({}).optional()
});

const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Category name must be at least 2 characters').max(100),
    slug: z.string().min(2).max(100).optional(),
    description: z.string().max(1000).optional(),
    icon: z.string().optional(),
    image: z.string().optional(),
    parentCategory: z.string().nullable().optional(),
    isActive: z.boolean().optional(),
    displayOrder: z.number().int().optional()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    slug: z.string().min(2).max(100).optional(),
    description: z.string().max(1000).optional(),
    icon: z.string().optional(),
    image: z.string().optional(),
    parentCategory: z.string().nullable().optional(),
    isActive: z.boolean().optional(),
    displayOrder: z.number().int().optional()
  }),
  params: z.object({
    id: z.string()
  }).optional(),
  query: z.object({}).optional()
});

module.exports = {
  categoryQuerySchema,
  createCategorySchema,
  updateCategorySchema
};
