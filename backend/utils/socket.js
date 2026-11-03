const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('./logger');
const Message = require('../models/Message');

let io = null;

/**
 * Initialize Socket.IO with HTTP server
 */
function initSocket(server, allowedOrigins = ['http://localhost:3000']) {
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
          return callback(null, true);
        }
        return callback(null, true); // Allow dev origins gracefully
      },
      credentials: true,
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling']
  });

  // JWT Authentication middleware for Socket.IO
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || 
                    socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        // Allow unauthenticated connection for public broadcasts, but mark as guest
        socket.user = null;
        return next();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'change-this-to-a-random-64-char-string');
      socket.user = decoded;
      return next();
    } catch (err) {
      logger.warn({ err: err.message }, 'Socket.IO authentication failed, proceeding as guest');
      socket.user = null;
      return next();
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user?.id || socket.user?._id;
    const userRole = socket.user?.role;

    logger.info({ socketId: socket.id, userId, userRole }, 'Socket client connected');

    // Automatically join user-specific room if authenticated
    if (userId) {
      socket.join(`user:${userId}`);
      logger.info({ socketId: socket.id, room: `user:${userId}` }, 'Joined user room');

      if (userRole === 'admin') {
        socket.join('admin');
        logger.info({ socketId: socket.id }, 'Joined admin room');
      }
    }

    // Explicit room join handlers
    socket.on('join:user', (targetUserId) => {
      if (targetUserId) {
        socket.join(`user:${targetUserId}`);
      }
    });

    socket.on('join:vendor', (vendorId) => {
      if (vendorId) {
        socket.join(`vendor:${vendorId}`);
      }
    });

    socket.on('join:admin', () => {
      if (socket.user?.role === 'admin') {
        socket.join('admin');
      }
    });

    // Realtime chat messaging via Socket
    socket.on('message:send', async (data, callback) => {
      try {
        const senderId = socket.user?.id || socket.user?._id;
        if (!senderId) {
          if (callback) callback({ error: 'Authentication required to send messages' });
          return;
        }

        const { receiver, content } = data;
        if (!receiver || !content || !content.trim()) {
          if (callback) callback({ error: 'Receiver and content are required' });
          return;
        }

        // Save message to MongoDB
        const message = await Message.create({
          sender: senderId,
          receiver,
          content: content.trim()
        });

        const populatedMessage = await Message.findById(message._id)
          .populate('sender receiver', 'name email');

        // Deliver in realtime to receiver's room
        io.to(`user:${receiver}`).emit('message:receive', populatedMessage);

        // Acknowledge to sender
        socket.emit('message:sent', populatedMessage);

        if (callback) callback({ success: true, data: populatedMessage });
      } catch (err) {
        logger.error({ err: err.message }, 'Error in Socket message:send');
        if (callback) callback({ error: 'Failed to deliver message' });
      }
    });

    // Typing indicators
    socket.on('typing:start', ({ receiverId }) => {
      if (receiverId) {
        io.to(`user:${receiverId}`).emit('typing:status', {
          senderId: socket.user?.id || socket.user?._id,
          senderName: socket.user?.name,
          isTyping: true
        });
      }
    });

    socket.on('typing:stop', ({ receiverId }) => {
      if (receiverId) {
        io.to(`user:${receiverId}`).emit('typing:status', {
          senderId: socket.user?.id || socket.user?._id,
          isTyping: false
        });
      }
    });

    socket.on('disconnect', (reason) => {
      logger.info({ socketId: socket.id, reason }, 'Socket client disconnected');
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    logger.warn('Socket.IO accessed before initialization');
  }
  return io;
}

// Helpers for cross-controller notification emission
function notifyUser(userId, event, data) {
  if (io && userId) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

function notifyVendor(vendorId, event, data) {
  if (io && vendorId) {
    io.to(`vendor:${vendorId}`).emit(event, data);
  }
}

function notifyAdmin(event, data) {
  if (io) {
    io.to('admin').emit(event, data);
  }
}

function broadcastAnnouncement(announcement) {
  if (io) {
    io.emit('announcement', announcement);
  }
}

module.exports = {
  initSocket,
  getIO,
  notifyUser,
  notifyVendor,
  notifyAdmin,
  broadcastAnnouncement
};
