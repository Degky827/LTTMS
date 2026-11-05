const { z } = require('zod');

const createTicketSchema = z.object({
  body: z.object({
    subject: z.string().min(5, 'Subject must be at least 5 characters').max(200),
    description: z.string().min(5, 'Description must be at least 5 characters').max(5000).optional(),
    message: z.string().min(5, 'Message must be at least 5 characters').max(5000).optional(),
    category: z.enum([
      'booking',
      'payment',
      'refund',
      'vendor',
      'service_quality',
      'account',
      'technical',
      'safety',
      'eco_guideline',
      'general'
    ]).default('general'),
    priority: z.enum(['low', 'normal', 'medium', 'high', 'urgent']).optional().default('medium'),
    relatedBooking: z.string().optional().nullable(),
    relatedPayment: z.string().optional().nullable(),
    relatedVendor: z.string().optional().nullable()
  }).refine(data => Boolean(data.description || data.message), {
    message: 'Either description or message is required',
    path: ['description']
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const addTicketMessageSchema = z.object({
  params: z.object({
    ticketId: z.string().min(1, 'Ticket ID is required')
  }),
  body: z.object({
    message: z.string().min(1, 'Message text is required').max(5000),
    attachments: z.array(z.object({
      url: z.string().optional(),
      filename: z.string().optional()
    })).optional(),
    visibility: z.enum(['public', 'internal']).optional().default('public')
  }),
  query: z.object({}).optional()
});

const assignTicketSchema = z.object({
  params: z.object({
    ticketId: z.string().min(1, 'Ticket ID is required')
  }),
  body: z.object({
    assignedTo: z.string().min(1, 'Assigned user ID is required')
  }),
  query: z.object({}).optional()
});

const updateTicketStatusSchema = z.object({
  params: z.object({
    ticketId: z.string().min(1, 'Ticket ID is required')
  }),
  body: z.object({
    status: z.enum([
      'open',
      'assigned',
      'in_progress',
      'waiting_for_user',
      'waiting_on_user',
      'waiting_for_vendor',
      'resolved',
      'closed',
      'reopened'
    ]),
    resolutionNote: z.string().max(2000).optional()
  }),
  query: z.object({}).optional()
});

const updateTicketPrioritySchema = z.object({
  params: z.object({
    ticketId: z.string().min(1, 'Ticket ID is required')
  }),
  body: z.object({
    priority: z.enum(['low', 'normal', 'medium', 'high', 'urgent'])
  }),
  query: z.object({}).optional()
});

module.exports = {
  createTicketSchema,
  addTicketMessageSchema,
  assignTicketSchema,
  updateTicketStatusSchema,
  updateTicketPrioritySchema
};
