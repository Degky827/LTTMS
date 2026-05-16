const Message = require('../models/Message');

// @desc    Get messages for logged in user
// @route   GET /api/messages
// @access  Private
exports.getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }]
    }).populate('sender receiver', 'name email');

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res, next) => {
  try {
    req.body.sender = req.user.id;

    const message = await Message.create(req.body);

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Private (Receiver)
exports.markAsRead = async (req, res, next) => {
  try {
    let message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    if (message.receiver.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    message = await Message.findByIdAndUpdate(req.params.id, { isRead: true }, {
      new: true
    });

    res.status(200).json({
      success: true,
      data: message
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
