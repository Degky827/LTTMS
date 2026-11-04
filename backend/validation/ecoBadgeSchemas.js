const { z } = require('zod');

const createBadgeSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    slug: z.string().optional(),
    tier: z.enum(['bronze', 'silver', 'gold', 'platinum']).optional(),
    description: z.string().min(10).max(1000),
    criteria: z.array(z.string()).optional(),
    icon: z.string().optional(),
    isActive: z.boolean().optional()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const applyBadgeSchema = z.object({
  body: z.object({
    badgeId: z.string().min(1, 'Badge ID is required'),
    sustainabilityPractices: z.object({
      wasteManagement: z.string().optional(),
      waterConservation: z.string().optional(),
      energyEfficiency: z.string().optional(),
      communityEngagement: z.string().optional(),
      environmentalProtection: z.string().optional(),
      culturalPreservation: z.string().optional(),
      localEmployment: z.string().optional()
    }).optional(),
    evidenceDocuments: z.array(z.object({
      title: z.string().min(1),
      fileUrl: z.string().min(1),
      description: z.string().optional()
    })).min(1, 'At least one evidence document must be attached')
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const reviewBadgeApplicationSchema = z.object({
  body: z.object({
    rejectionReason: z.string().optional(),
    validUntilMonths: z.number().int().min(1).max(36).optional(),
    notes: z.string().optional()
  }),
  params: z.object({
    id: z.string()
  }).optional(),
  query: z.object({}).optional()
});

module.exports = {
  createBadgeSchema,
  applyBadgeSchema,
  reviewBadgeApplicationSchema
};
