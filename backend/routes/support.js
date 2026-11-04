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

// Support ticket endpoints with /tickets path
router.post('/tickets', validate(createTicketSchema), createTicket);
router.get('/tickets', getMyTickets);
router.get('/tickets/my-tickets', getMyTickets);
router.get('/tickets/:ticketId', getTicketById);
router.post('/tickets/:ticketId/messages', validate(addTicketMessageSchema), addMessage);
router.patch('/tickets/:ticketId/reopen', reopenTicket);

// Aliases directly at base /support path
router.post('/', validate(createTicketSchema), createTicket);
router.get('/', getMyTickets);
router.get('/my-tickets', getMyTickets);
router.get('/:ticketId', getTicketById);
router.post('/:ticketId/messages', validate(addTicketMessageSchema), addMessage);
router.patch('/:ticketId/reopen', reopenTicket);

module.exports = router;
