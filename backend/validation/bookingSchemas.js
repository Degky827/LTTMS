const { z } = require('zod');

const createBookingSchema = z.object({
  body: z.object({
    service: z.string().min(1),
    date: z.string().min(1),
    guests: z.number().int().min(1).max(20).optional(),
    idempotencyKey: z.string().min(8).optional()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const updateBookingSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
    paymentStatus: z.enum(['unpaid', 'paid']).optional(),
    transactionId: z.string().optional()
  }),
  params: z.object({
    id: z.string().min(1)
  }),
  query: z.object({}).optional()
});

module.exports = { createBookingSchema, updateBookingSchema };
