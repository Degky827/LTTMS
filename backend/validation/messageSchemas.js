const { z } = require('zod');

const sendMessageSchema = z.object({
  body: z.object({
    receiver: z.string().min(1).optional(),
    recipient: z.string().min(1).optional(),
    content: z.string().min(1).max(5000).optional(),
    message: z.string().min(1).max(5000).optional(),
    subject: z.string().min(1).optional()
  }).refine((data) => {
    if (data.receiver && data.content) return true;
    if (data.recipient && data.message && data.subject) return true;
    return false;
  }, {
    message: 'Either receiver and content or recipient, subject, and message are required'
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

module.exports = { sendMessageSchema };
