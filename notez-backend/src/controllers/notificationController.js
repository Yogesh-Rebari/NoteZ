const Notification = require('../models/Notification');
const { AppError, catchAsync } = require('../utils/helpers');

/**
 * Notification Controller for managing user notifications
 */
class NotificationController {
  /**
   * Get user notifications
   */
  getUserNotifications = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const {
      limit = 20,
      skip = 0,
      unreadOnly = false,
      type = null,
      groupId = null,
      includeArchived = false
    } = req.query;

    const notifications = await Notification.getUserNotifications(userId, {
      limit: parseInt(limit),
      skip: parseInt(skip),
      unreadOnly: unreadOnly === 'true',
      type,
      groupId,
      includeArchived: includeArchived === 'true'
    });

    res.status(200).json({
      status: 'success',
      data: {
        notifications,
        count: notifications.length
      }
    });
  });

  /**
   * Get unread notification count
   */
  getUnreadCount = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const { groupId = null } = req.query;

    const count = await Notification.getUnreadCount(userId, groupId);

    res.status(200).json({
      status: 'success',
      data: {
        unreadCount: count
      }
    });
  });

  /**
   * Mark notification as read
   */
  markAsRead = catchAsync(async (req, res) => {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    await notification.markAsRead();

    res.status(200).json({
      status: 'success',
      message: 'Notification marked as read'
    });
  });

  /**
   * Mark all notifications as read
   */
  markAllAsRead = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const { groupId = null } = req.body;

    await Notification.markAllAsRead(userId, groupId);

    res.status(200).json({
      status: 'success',
      message: 'All notifications marked as read'
    });
  });

  /**
   * Archive notification
   */
  archiveNotification = catchAsync(async (req, res) => {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    await notification.archive();

    res.status(200).json({
      status: 'success',
      message: 'Notification archived'
    });
  });

  /**
   * Delete notification
   */
  deleteNotification = catchAsync(async (req, res) => {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    res.status(200).json({
      status: 'success',
      message: 'Notification deleted'
    });
  });

  /**
   * Get notification preferences
   */
  getNotificationPreferences = catchAsync(async (req, res) => {
    const user = req.user;

    res.status(200).json({
      status: 'success',
      data: {
        preferences: user.preferences.notifications
      }
    });
  });

  /**
   * Update notification preferences
   */
  updateNotificationPreferences = catchAsync(async (req, res) => {
    const { email, push } = req.body;
    const user = req.user;

    if (email) {
      user.preferences.notifications.email = {
        ...user.preferences.notifications.email,
        ...email
      };
    }

    if (push) {
      user.preferences.notifications.push = {
        ...user.preferences.notifications.push,
        ...push
      };
    }

    await user.save();

    res.status(200).json({
      status: 'success',
      data: {
        preferences: user.preferences.notifications
      }
    });
  });

  /**
   * Create notification (admin/system use)
   */
  createNotification = catchAsync(async (req, res) => {
    const {
      recipient,
      title,
      message,
      type,
      category = 'info',
      group = null,
      relatedEntity = null,
      actions = [],
      priority = 'normal'
    } = req.body;

    const notification = await Notification.createNotification({
      recipient,
      sender: req.user.id,
      title,
      message,
      type,
      category,
      group,
      relatedEntity,
      actions,
      priority
    });

    res.status(201).json({
      status: 'success',
      data: {
        notification
      }
    });
  });

  /**
   * Get notification statistics
   */
  getNotificationStats = catchAsync(async (req, res) => {
    const userId = req.user.id;

    const stats = await Notification.aggregate([
      { $match: { recipient: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: {
            $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
          },
          byType: {
            $push: '$type'
          },
          byCategory: {
            $push: '$category'
          }
        }
      }
    ]);

    const typeStats = {};
    const categoryStats = {};

    if (stats.length > 0) {
      stats[0].byType.forEach(type => {
        typeStats[type] = (typeStats[type] || 0) + 1;
      });

      stats[0].byCategory.forEach(category => {
        categoryStats[category] = (categoryStats[category] || 0) + 1;
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        stats: stats[0] || { total: 0, unread: 0 },
        typeStats,
        categoryStats
      }
    });
  });

  /**
   * Cleanup expired notifications
   */
  cleanupExpiredNotifications = catchAsync(async (req, res) => {
    const result = await Notification.cleanupExpired();

    res.status(200).json({
      status: 'success',
      message: `${result.deletedCount} expired notifications cleaned up`
    });
  });

  /**
   * Get notification by ID
   */
  getNotification = catchAsync(async (req, res) => {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId
    })
      .populate('sender', 'username firstName lastName avatar')
      .populate('group', 'name');

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: {
        notification
      }
    });
  });

  /**
   * Bulk update notifications
   */
  bulkUpdateNotifications = catchAsync(async (req, res) => {
    const { notificationIds, action } = req.body;
    const userId = req.user.id;

    if (!['read', 'archive', 'delete'].includes(action)) {
      throw new AppError('Invalid action. Must be read, archive, or delete', 400);
    }

    const query = {
      _id: { $in: notificationIds },
      recipient: userId
    };

    let result;
    switch (action) {
      case 'read':
        result = await Notification.updateMany(query, {
          isRead: true,
          readAt: new Date(),
          'delivery.inApp.read': true,
          'delivery.inApp.readAt': new Date()
        });
        break;
      case 'archive':
        result = await Notification.updateMany(query, {
          isArchived: true,
          archivedAt: new Date()
        });
        break;
      case 'delete':
        result = await Notification.deleteMany(query);
        break;
    }

    res.status(200).json({
      status: 'success',
      message: `${result.modifiedCount || result.deletedCount} notifications ${action}ed`
    });
  });
}

module.exports = new NotificationController();
