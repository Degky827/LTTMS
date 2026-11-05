const notificationService = require('../services/notificationService');

// @desc    Get authenticated user's notifications
// @route   GET /api/v1/notifications
// @access  Private
exports.getMyNotifications = async (req, res, next) => {
  try {
    const result = await notificationService.getUserNotifications(req.user.id, req.query);
    res.status(200).json({
      success: true,
      data: result.notifications,
      meta: result.meta
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get unread notification count
// @route   GET /api/v1/notifications/unread-count
// @access  Private
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await notificationService.getUnreadCount(req.user.id);
    res.status(200).json({
      success: true,
      unreadCount: count
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark single notification as read
// @route   PATCH /api/v1/notifications/:notificationId/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markNotificationAsRead(
      req.params.notificationId || req.params.id,
      req.user.id
    );
    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark all user notifications as read
// @route   PATCH /api/v1/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllNotificationsAsRead(req.user.id);
    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a notification
// @route   DELETE /api/v1/notifications/:notificationId
// @access  Private
exports.deleteNotification = async (req, res, next) => {
  try {
    await notificationService.deleteNotification(
      req.params.notificationId || req.params.id,
      req.user.id
    );
    res.status(200).json({
      success: true,
      message: 'Notification removed'
    });
  } catch (err) {
    next(err);
  }
};
