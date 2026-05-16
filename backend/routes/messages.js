const express = require('express');
const {
  getMessages,
  sendMessage,
  markAsRead
} = require('../controllers/messageController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getMessages);
router.post('/', sendMessage);
router.put('/:id/read', markAsRead);

module.exports = router;
