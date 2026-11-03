const Message = require('../models/Message');

// @desc    Get messages for logged in user
// @route   GET /api/messages
// @access  Private
exports.getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }]
    })
      .populate('sender receiver', 'name email role')
      .sort({ createdAt: 1 });

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
    const populatedMessage = await Message.findById(message._id)
      .populate('sender receiver', 'name email role');

    // Emit realtime Socket.IO event if io is available
    const io = req.app.get('io');
    if (io) {
      const receiverId = populatedMessage.receiver?._id || populatedMessage.receiver;
      const senderId = req.user.id;

      // Broadcast to receiver's room
      io.to(`user:${receiverId}`).emit('message:receive', populatedMessage);
      // Broadcast to sender's room (in case they have multiple tabs open)
      io.to(`user:${senderId}`).emit('message:sent', populatedMessage);
    }

    res.status(201).json({
      success: true,
      data: populatedMessage
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
    }).populate('sender receiver', 'name email role');

    // Notify sender that message was read
    const io = req.app.get('io');
    if (io) {
      const senderId = message.sender?._id || message.sender;
      io.to(`user:${senderId}`).emit('message:read', { messageId: message._id });
    }

    res.status(200).json({
      success: true,
      data: message
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
