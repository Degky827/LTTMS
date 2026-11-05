const express = require('express');
const {
  getMessages,
  sendMessage,
  markAsRead
} = require('../controllers/messageController');

const router = express.Router();

const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { sendMessageSchema } = require('../validation/messageSchemas');

router.use(protect);

/**
 * @openapi
 * /messages:
 *   get:
 *     tags:
 *       - Messages
 *     summary: Get conversation messages between tourist and vendor
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: recipientId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Message thread
 *   post:
 *     tags:
 *       - Messages
 *     summary: Send direct message to another user
 *     description: Creates message record and emits real-time 'message:new' Socket.IO event to recipient room.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [recipient, content]
 *             properties:
 *               recipient: { type: string }
 *               content: { type: string, minLength: 1 }
 *     responses:
 *       201:
 *         description: Message sent
 */
router.get('/', getMessages);
router.post('/', validate(sendMessageSchema), sendMessage);

/**
 * @openapi
 * /messages/{id}/read:
 *   put:
 *     tags:
 *       - Messages
 *     summary: Mark direct message as read
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Message marked as read
 */
router.put('/:id/read', markAsRead);

module.exports = router;
