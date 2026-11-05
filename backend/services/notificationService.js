const Notification = require('../models/Notification');
const { getIO } = require('../utils/socket');
const logger = require('../utils/logger');

/**
 * Centralized service to create and dispatch notifications
 */
async function createNotification({
  recipient,
  recipientRole = null,
  sender = null,
  type,
  title,
  message,
  relatedResource = null,
  actionUrl = null,
  priority = 'medium',
  channel = 'in_app',
  io = null
}) {
  if (!recipient || !type || !title || !message) {
    throw new Error('recipient, type, title, and message are required to create a notification');
  }

  const notification = await Notification.create({
    recipient,
    recipientRole,
    sender,
    type,
    title,
    message,
    relatedResource: relatedResource || { resourceType: null, resourceId: null },
    actionUrl,
    priority,
    channel
  });

  // Real-time dispatch via Socket.IO
  const activeIo = io || getIO();
  if (activeIo) {
    activeIo.to(`user:${recipient}`).emit('notification:new', {
      id: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      actionUrl: notification.actionUrl,
      createdAt: notification.createdAt
    });
  }

  logger.info({ recipient, type, notificationId: notification._id }, 'Notification created and dispatched');
  return notification;
}

/**
 * Retrieve user's notifications (paginated)
 */
async function getUserNotifications(userId, options = {}) {
  const page = Math.max(1, parseInt(options.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(options.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const query = { recipient: userId };
  if (options.isRead !== undefined && options.isRead !== null && options.isRead !== '') {
    query.isRead = options.isRead === 'true' || options.isRead === true;
  }
  if (options.type) {
    query.type = options.type;
  }

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments(query),
    Notification.countDocuments({ recipient: userId, isRead: false })
  ]);

  return {
    notifications,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      unreadCount
    }
  };
}

/**
 * Get count of unread notifications for a user
 */
async function getUnreadCount(userId) {
  return Notification.countDocuments({ recipient: userId, isRead: false });
}

/**
 * Mark a single notification as read
 */
async function markNotificationAsRead(notificationId, userId) {
  const notification = await Notification.findOne({
    _id: notificationId,
    recipient: userId
  });

  if (!notification) {
    const error = new Error('Notification not found');
    error.statusCode = 404;
    throw error;
  }

  if (!notification.isRead) {
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();
  }

  return notification;
}

/**
 * Mark all notifications as read for a user
 */
async function markAllNotificationsAsRead(userId) {
  const result = await Notification.updateMany(
    { recipient: userId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );

  return { modifiedCount: result.modifiedCount };
}

/**
 * Delete a user notification
 */
async function deleteNotification(notificationId, userId) {
  const result = await Notification.deleteOne({
    _id: notificationId,
    recipient: userId
  });

  if (result.deletedCount === 0) {
    const error = new Error('Notification not found');
    error.statusCode = 404;
    throw error;
  }

  return { success: true };
}

module.exports = {
  createNotification,
  getUserNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
};
