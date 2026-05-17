const { z } = require('zod');

const sendMessageSchema = z.object({
  body: z.object({
    receiver: z.string().min(1, 'Recipient ID is required'),
    content: z.string().min(1, 'Message content is required').max(5000)
  }).strict(),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

module.exports = { sendMessageSchema };
