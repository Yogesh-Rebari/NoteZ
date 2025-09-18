const express = require('express');
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/auth');
const { 
  checkChatAccess, 
  checkChatModerationPermission,
  checkGroupMembership 
} = require('../middleware/permissions');
const { validateChatMessage } = require('../middleware/validation');

const router = express.Router();

// All chat routes require authentication
router.use(protect);

/**
 * @route   GET /api/chat/:groupId/messages
 * @desc    Get group messages
 * @access  Private (Group members only)
 */
router.get('/:groupId/messages',
  checkChatAccess,
  chatController.getGroupMessages
);

/**
 * @route   POST /api/chat/:groupId/messages
 * @desc    Send a message to group
 * @access  Private (Group members only)
 */
router.post('/:groupId/messages',
  checkChatAccess,
  validateChatMessage,
  chatController.sendMessage
);

/**
 * @route   POST /api/chat/:groupId/polls
 * @desc    Create a poll in group
 * @access  Private (Group members only)
 */
router.post('/:groupId/polls',
  checkChatAccess,
  validateChatMessage,
  chatController.createPoll
);

/**
 * @route   POST /api/chat/messages/:messageId/react
 * @desc    React to a message
 * @access  Private (Group members only)
 */
router.post('/messages/:messageId/react',
  chatController.reactToMessage
);

/**
 * @route   PUT /api/chat/messages/:messageId
 * @desc    Edit a message
 * @access  Private (Message author only)
 */
router.put('/messages/:messageId',
  chatController.editMessage
);

/**
 * @route   DELETE /api/chat/messages/:messageId
 * @desc    Delete a message
 * @access  Private (Message author or group admin)
 */
router.delete('/messages/:messageId',
  chatController.deleteMessage
);

/**
 * @route   POST /api/chat/messages/:messageId/vote
 * @desc    Vote in a poll
 * @access  Private (Group members only)
 */
router.post('/messages/:messageId/vote',
  chatController.voteInPoll
);

/**
 * @route   POST /api/chat/:groupId/messages/read
 * @desc    Mark messages as read
 * @access  Private (Group members only)
 */
router.post('/:groupId/messages/read',
  checkChatAccess,
  chatController.markMessagesAsRead
);

/**
 * @route   GET /api/chat/:groupId/search
 * @desc    Search messages in group
 * @access  Private (Group members only)
 */
router.get('/:groupId/search',
  checkChatAccess,
  chatController.searchMessages
);

/**
 * @route   GET /api/chat/:groupId/stats
 * @desc    Get chat statistics
 * @access  Private (Group members only)
 */
router.get('/:groupId/stats',
  checkChatAccess,
  chatController.getMessageStats
);

module.exports = router;
