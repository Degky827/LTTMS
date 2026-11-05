const express = require('express');
const {
  createTicket,
  getMyTickets,
  getTicketById,
  addMessage,
  reopenTicket
} = require('../controllers/supportController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createTicketSchema, addTicketMessageSchema } = require('../validation/supportSchemas');

const router = express.Router();

router.use(protect);

/**
 * @openapi
 * /support/tickets:
 *   post:
 *     tags:
 *       - Support
 *     summary: Open a new customer support or grievance ticket
 *     description: Creates a support ticket with auto-generated TIK-YYYY-XXXX ticket number and appends initial inquiry message.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SupportTicketInput'
 *     responses:
 *       201:
 *         description: Support ticket created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/SupportTicketResponse' }
 *       400:
 *         description: Validation error
 *   get:
 *     tags:
 *       - Support
 *     summary: List authenticated user's support tickets
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [open, assigned, in_progress, waiting_for_user, waiting_for_vendor, resolved, closed, reopened] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Paginated support tickets
 */
router.post('/tickets', validate(createTicketSchema), createTicket);
router.get('/tickets', getMyTickets);
router.get('/tickets/my-tickets', getMyTickets);

/**
 * @openapi
 * /support/tickets/{ticketId}:
 *   get:
 *     tags:
 *       - Support
 *     summary: View support ticket details and conversation thread
 *     description: "Returns ticket metadata and message history. STRICT PRIVACY ENFORCED: Internal staff notes are completely omitted from tourist and vendor responses."
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Ticket details with public messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/SupportTicketResponse' }
 *       403:
 *         description: Not authorized to view this ticket
 *       404:
 *         description: Ticket not found
 */
router.get('/tickets/:ticketId', getTicketById);

/**
 * @openapi
 * /support/tickets/{ticketId}/messages:
 *   post:
 *     tags:
 *       - Support
 *     summary: Add public reply message to support ticket
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message: { type: string, minLength: 1, maxLength: 5000 }
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url: { type: string }
 *                     filename: { type: string }
 *     responses:
 *       200:
 *         description: Message added to ticket
 *       403:
 *         description: Not authorized to reply to this ticket
 */
router.post('/tickets/:ticketId/messages', validate(addTicketMessageSchema), addMessage);

/**
 * @openapi
 * /support/tickets/{ticketId}/reopen:
 *   patch:
 *     tags:
 *       - Support
 *     summary: Reopen a resolved or closed support ticket
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason: { type: string }
 *     responses:
 *       200:
 *         description: Ticket reopened successfully
 *       400:
 *         description: Ticket is already open
 */
router.patch('/tickets/:ticketId/reopen', reopenTicket);

// Direct aliases directly at base /support path for frontend flexibility
router.post('/', validate(createTicketSchema), createTicket);
router.get('/', getMyTickets);
router.get('/my-tickets', getMyTickets);
router.get('/:ticketId', getTicketById);
router.post('/:ticketId/messages', validate(addTicketMessageSchema), addMessage);
router.patch('/:ticketId/reopen', reopenTicket);

module.exports = router;
