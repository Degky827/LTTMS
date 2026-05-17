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

router.get('/', getMessages);
router.post('/', validate(sendMessageSchema), sendMessage);
router.put('/:id/read', markAsRead);

module.exports = router;
