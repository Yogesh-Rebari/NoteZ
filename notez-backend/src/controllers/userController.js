const User = require('../models/User');
const Group = require('../models/Group');
const Note = require('../models/Note');
const { AppError, catchAsync } = require('../utils/helpers');

/**
 * User Controller for profile and account management
 */
class UserController {
  /**
   * Get current user profile
   */
  getProfile = catchAsync(async (req, res) => {
    const user = await User.findById(req.user.id)
      .populate('adminGroups', 'name description memberCount')
      .populate('memberGroups', 'name description memberCount');

    res.status(200).json({
      status: 'success',
      data: {
        user: user.getPublicProfile(),
        groups: {
          admin: user.adminGroups,
          member: user.memberGroups
        }
      }
    });
  });

  /**
   * Update user profile
   */
  updateProfile = catchAsync(async (req, res) => {
    const { firstName, lastName, bio, preferences } = req.body;
    const user = req.user;

    // Update allowed fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (bio !== undefined) user.bio = bio;
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    res.status(200).json({
      status: 'success',
      data: {
        user: user.getPublicProfile()
      }
    });
  });

  /**
   * Change user password
   */
  changePassword = catchAsync(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.comparePassword(currentPassword))) {
      throw new AppError('Current password is incorrect', 400);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully'
    });
  });

  /**
   * Get user preferences
   */
  getPreferences = catchAsync(async (req, res) => {
    const user = req.user;

    res.status(200).json({
      status: 'success',
      data: {
        preferences: user.preferences,
        aiSettings: user.aiSettings
      }
    });
  });

  /**
   * Update user preferences
   */
  updatePreferences = catchAsync(async (req, res) => {
    const { theme, notifications, language, aiSettings } = req.body;
    const user = req.user;

    if (theme) user.preferences.theme = theme;
    if (notifications) {
      user.preferences.notifications = {
        ...user.preferences.notifications,
        ...notifications
      };
    }
    if (language) user.preferences.language = language;
    if (aiSettings) {
      user.aiSettings = { ...user.aiSettings, ...aiSettings };
    }

    await user.save();

    res.status(200).json({
      status: 'success',
      data: {
        preferences: user.preferences,
        aiSettings: user.aiSettings
      }
    });
  });

  /**
   * Get user activity
   */
  getActivity = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const { limit = 20, skip = 0 } = req.query;

    // Get recent notes created by user
    const recentNotes = await Note.find({ author: userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('group', 'name')
      .select('title group createdAt updatedAt');

    // Get groups where user is active
    const activeGroups = await Group.findUserGroups(userId);

    res.status(200).json({
      status: 'success',
      data: {
        recentNotes,
        activeGroups,
        stats: {
          totalNotes: await Note.countDocuments({ author: userId }),
          totalGroups: activeGroups.length,
          lastActive: req.user.lastActive
        }
      }
    });
  });

  /**
   * Delete user account
   */
  deleteAccount = catchAsync(async (req, res) => {
    const userId = req.user.id;

    // Deactivate user instead of deleting
    const user = await User.findById(userId);
    user.isActive = false;
    user.email = `deleted_${Date.now()}_${user.email}`;
    user.username = `deleted_${Date.now()}_${user.username}`;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Account deleted successfully'
    });
  });
}

module.exports = new UserController();

