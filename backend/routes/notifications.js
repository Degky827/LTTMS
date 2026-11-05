const express = require('express');
const {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationController');

const router = express.Router();
const { protect } = require('../middleware/auth');

// All notification endpoints require user authentication
router.use(protect);

/**
 * @openapi
 * /notifications:
 *   get:
 *     tags:
 *       - Notifications
 *     summary: Retrieve user's in-app notification inbox
 *     description: Returns paginated notifications with filters for read/unread state and event type.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: isRead
 *         schema: { type: boolean }
 *       - in: query
 *         name: type
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated notifications and unread count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 meta:
 *                   type: object
 *                   properties:
 *                     unreadCount: { type: integer, example: 3 }
 *                     total: { type: integer }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/NotificationResponse' }
 */
router.get('/', getMyNotifications);

/**
 * @openapi
 * /notifications/unread-count:
 *   get:
 *     tags:
 *       - Notifications
 *     summary: Get count of unread notifications for badge display
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current unread count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 unreadCount: { type: integer, example: 5 }
 */
router.get('/unread-count', getUnreadCount);

/**
 * @openapi
 * /notifications/read-all:
 *   patch:
 *     tags:
 *       - Notifications
 *     summary: Mark all user notifications as read
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Bulk read update confirmation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 modifiedCount: { type: integer, example: 7 }
 */
router.patch('/read-all', markAllAsRead);

/**
 * @openapi
 * /notifications/{notificationId}/read:
 *   patch:
 *     tags:
 *       - Notifications
 *     summary: Mark a single notification as read
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Notification marked read
 *       404:
 *         description: Notification not found
 */
router.patch('/:notificationId/read', markAsRead);

/**
 * @openapi
 * /notifications/{notificationId}:
 *   delete:
 *     tags:
 *       - Notifications
 *     summary: Delete a notification from inbox
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Notification deleted
 *       404:
 *         description: Notification not found
 */
router.delete('/:notificationId', deleteNotification);

module.exports = router;
