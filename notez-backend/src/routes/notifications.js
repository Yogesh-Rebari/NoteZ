const express = require('express');
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All notification routes require authentication
router.use(protect);

/**
 * @route   GET /api/notifications
 * @desc    Get user notifications
 * @access  Private
 */
router.get('/', notificationController.getUserNotifications);

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get('/unread-count', notificationController.getUnreadCount);

/**
 * @route   GET /api/notifications/stats
 * @desc    Get notification statistics
 * @access  Private
 */
router.get('/stats', notificationController.getNotificationStats);

/**
 * @route   GET /api/notifications/preferences
 * @desc    Get notification preferences
 * @access  Private
 */
router.get('/preferences', notificationController.getNotificationPreferences);

/**
 * @route   PUT /api/notifications/preferences
 * @desc    Update notification preferences
 * @access  Private
 */
router.put('/preferences', notificationController.updateNotificationPreferences);

/**
 * @route   GET /api/notifications/:notificationId
 * @desc    Get specific notification
 * @access  Private
 */
router.get('/:notificationId', notificationController.getNotification);

/**
 * @route   PUT /api/notifications/:notificationId/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/:notificationId/read', notificationController.markAsRead);

/**
 * @route   PUT /api/notifications/:notificationId/archive
 * @desc    Archive notification
 * @access  Private
 */
router.put('/:notificationId/archive', notificationController.archiveNotification);

/**
 * @route   DELETE /api/notifications/:notificationId
 * @desc    Delete notification
 * @access  Private
 */
router.delete('/:notificationId', notificationController.deleteNotification);

/**
 * @route   PUT /api/notifications/mark-all-read
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/mark-all-read', notificationController.markAllAsRead);

/**
 * @route   PUT /api/notifications/bulk-update
 * @desc    Bulk update notifications
 * @access  Private
 */
router.put('/bulk-update', notificationController.bulkUpdateNotifications);

/**
 * @route   POST /api/notifications
 * @desc    Create notification (admin/system use)
 * @access  Private (Admin only)
 */
router.post('/', notificationController.createNotification);

/**
 * @route   DELETE /api/notifications/cleanup
 * @desc    Cleanup expired notifications
 * @access  Private (Admin only)
 */
router.delete('/cleanup', notificationController.cleanupExpiredNotifications);

module.exports = router;
