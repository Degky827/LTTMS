const { z } = require('zod');

const initializePaymentSchema = z.object({
  body: z.object({
    bookingId: z.string().min(1, 'Booking ID is required'),
    callbackUrl: z.string().url().optional(),
    returnUrl: z.string().url().optional()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const verifyPaymentSchema = z.object({
  params: z.object({
    tx_ref: z.string().min(1, 'Transaction reference is required').optional(),
    txRef: z.string().min(1, 'Transaction reference is required').optional()
  }).refine(data => data.tx_ref || data.txRef, {
    message: 'Transaction reference is required in route params'
  }),
  body: z.object({}).optional(),
  query: z.object({}).optional()
});

const settlementRequestSchema = z.object({
  body: z.object({
    amount: z.number().positive('Settlement amount must be greater than zero').min(50, 'Minimum settlement amount is 50 ETB'),
    payoutMethod: z.enum(['bank_transfer', 'telebirr', 'cbe_birr', 'manual_cash']).default('bank_transfer'),
    payoutDetails: z.object({
      accountName: z.string().optional(),
      accountNumber: z.string().optional(),
      bankName: z.string().optional(),
      phone: z.string().optional(),
      notes: z.string().optional()
    }).optional(),
    notes: z.string().max(500).optional()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const reviewSettlementSchema = z.object({
  params: z.object({
    settlementId: z.string().min(1, 'Settlement ID is required')
  }),
  body: z.object({
    action: z.enum(['approve', 'reject'], {
      errorMap: () => ({ message: "Action must be either 'approve' or 'reject'" })
    }),
    rejectionReason: z.string().optional(),
    notes: z.string().optional()
  }),
  query: z.object({}).optional()
});

const completeSettlementSchema = z.object({
  params: z.object({
    settlementId: z.string().min(1, 'Settlement ID is required')
  }),
  body: z.object({
    providerReference: z.string().optional(),
    notes: z.string().optional()
  }),
  query: z.object({}).optional()
});

const commissionRuleSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Rule name must be at least 2 characters'),
    description: z.string().optional(),
    serviceCategory: z.string().optional().nullable(),
    vendor: z.string().optional().nullable(),
    rate: z.number().min(0, 'Commission rate cannot be negative').max(1, 'Commission rate cannot exceed 1.0 (100%)'),
    isActive: z.boolean().default(true),
    effectiveStartDate: z.string().optional(),
    effectiveEndDate: z.string().optional().nullable()
  }),
  params: z.object({
    ruleId: z.string().optional()
  }).optional(),
  query: z.object({}).optional()
});

module.exports = {
  initializePaymentSchema,
  verifyPaymentSchema,
  settlementRequestSchema,
  reviewSettlementSchema,
  completeSettlementSchema,
  commissionRuleSchema
};
