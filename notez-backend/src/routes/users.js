const express = require('express');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { validateAuth } = require('../middleware/validation');

const router = express.Router();

// All user routes require authentication
router.use(protect);

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', userController.getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', 
  validateAuth.updateProfile,
  userController.updateProfile
);

/**
 * @route   PUT /api/users/password
 * @desc    Change user password
 * @access  Private
 */
router.put('/password',
  validateAuth.changePassword,
  userController.changePassword
);

/**
 * @route   GET /api/users/preferences
 * @desc    Get user preferences
 * @access  Private
 */
router.get('/preferences', userController.getPreferences);

/**
 * @route   PUT /api/users/preferences
 * @desc    Update user preferences
 * @access  Private
 */
router.put('/preferences', userController.updatePreferences);

/**
 * @route   GET /api/users/activity
 * @desc    Get user activity log
 * @access  Private
 */
router.get('/activity', userController.getActivity);

/**
 * @route   DELETE /api/users/account
 * @desc    Delete user account
 * @access  Private
 */
router.delete('/account', userController.deleteAccount);

module.exports = router;

