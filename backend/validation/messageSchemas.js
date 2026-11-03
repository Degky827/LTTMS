const { z } = require('zod');

const sendMessageSchema = z.object({
  body: z.object({
    receiver: z.string().min(1).optional(),
    recipient: z.string().min(1).optional(),
    content: z.string().min(1).max(5000).optional(),
    message: z.string().min(1).max(5000).optional(),
    subject: z.string().optional()
  }).refine((data) => Boolean((data.receiver || data.recipient) && (data.content || data.message)), {
    message: 'Receiver and content are required'
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

module.exports = { sendMessageSchema };
