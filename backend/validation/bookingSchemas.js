const { z } = require('zod');

const createBookingSchema = z.object({
  body: z.object({
    service: z.string().min(1, 'Service ID is required'),
    date: z.string().min(1, 'Booking date is required'),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    timeSlot: z.string().optional(),
    adults: z.number().int().min(0).optional(),
    children: z.number().int().min(0).optional(),
    guests: z.number().int().min(1).max(100).optional(),
    selectedOptions: z.array(z.object({
      name: z.string().min(1),
      price: z.number().min(0),
      quantity: z.number().int().min(1).default(1)
    })).optional(),
    specialRequests: z.string().max(1000).optional(),
    contactInformation: z.object({
      fullName: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional()
    }).optional(),
    idempotencyKey: z.string().min(8).optional()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const updateBookingSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'confirmed', 'completed', 'cancelled', 'rejected', 'expired']).optional(),
    paymentStatus: z.enum(['unpaid', 'paid', 'refunded', 'processing', 'failed']).optional(),
    transactionId: z.string().optional(),
    adminNote: z.string().optional(),
    reason: z.string().optional()
  }),
  params: z.object({
    id: z.string().min(1)
  }),
  query: z.object({}).optional()
});

const cancelBookingSchema = z.object({
  body: z.object({
    reason: z.string().max(500).optional().default('Cancelled by tourist')
  }),
  params: z.object({
    id: z.string().min(1)
  }),
  query: z.object({}).optional()
});

const rejectBookingSchema = z.object({
  body: z.object({
    reason: z.string().min(3, 'Rejection reason is required').max(500)
  }),
  params: z.object({
    id: z.string().min(1)
  }),
  query: z.object({}).optional()
});

const refundRequestSchema = z.object({
  body: z.object({
    reason: z.enum([
      'cancellation',
      'service_not_provided',
      'bad_weather',
      'vendor_cancelled',
      'duplicate_charge',
      'other'
    ]),
    amount: z.number().positive().optional(),
    description: z.string().max(2000).optional()
  }),
  params: z.object({
    id: z.string().min(1)
  }),
  query: z.object({}).optional()
});

const reviewRefundRequestSchema = z.object({
  body: z.object({
    decision: z.enum(['approved', 'rejected', 'under_review']),
    adminNote: z.string().max(1000).optional(),
    rejectionReason: z.string().max(500).optional()
  }),
  params: z.object({
    id: z.string().min(1)
  }),
  query: z.object({}).optional()
});

module.exports = {
  createBookingSchema,
  updateBookingSchema,
  cancelBookingSchema,
  rejectBookingSchema,
  refundRequestSchema,
  reviewRefundRequestSchema
};
