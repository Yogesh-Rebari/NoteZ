const ChatMessage = require('../models/ChatMessage');
const Group = require('../models/Group');
const Notification = require('../models/Notification');
const { AppError, catchAsync } = require('../utils/helpers');

/**
 * Chat Controller for real-time messaging functionality
 */
class ChatController {
  /**
   * Get group messages
   */
  getGroupMessages = catchAsync(async (req, res) => {
    const { groupId } = req.params;
    const { limit = 50, skip = 0, before = null, thread = null } = req.query;

    const messages = await ChatMessage.getGroupMessages(groupId, {
      limit: parseInt(limit),
      skip: parseInt(skip),
      before: before ? new Date(before) : null,
      thread
    });

    res.status(200).json({
      status: 'success',
      data: {
        messages,
        count: messages.length
      }
    });
  });

  /**
   * Send a message
   */
  sendMessage = catchAsync(async (req, res) => {
    const { groupId } = req.params;
    const { content, type = 'text', attachments = [], thread = null } = req.body;
    const userId = req.user.id;

    // Verify user is member of group
    const group = await Group.findById(groupId);
    if (!group || !group.isMember(userId)) {
      throw new AppError('Access denied to group', 403);
    }

    // Check if chat is enabled
    if (!group.settings.chatEnabled) {
      throw new AppError('Chat is disabled for this group', 403);
    }

    // Create message
    const message = new ChatMessage({
      group: groupId,
      author: userId,
      content,
      type,
      attachments,
      thread
    });

    await message.save();
    await message.populate('author', 'username firstName lastName avatar');

    // Create notifications for mentioned users
    await this.handleMentions(message, group);

    res.status(201).json({
      status: 'success',
      data: {
        message
      }
    });
  });

  /**
   * React to a message
   */
  reactToMessage = catchAsync(async (req, res) => {
    const { messageId } = req.params;
    const { emoji, action = 'add' } = req.body;
    const userId = req.user.id;

    const message = await ChatMessage.findById(messageId);
    if (!message) {
      throw new AppError('Message not found', 404);
    }

    // Verify user is member of the group
    const group = await Group.findById(message.group);
    if (!group || !group.isMember(userId)) {
      throw new AppError('Access denied', 403);
    }

    if (action === 'add') {
      await message.addReaction(userId, emoji);
    } else {
      await message.removeReaction(userId, emoji);
    }

    res.status(200).json({
      status: 'success',
      data: {
        messageId,
        emoji,
        action,
        reactions: message.reactions
      }
    });
  });

  /**
   * Edit a message
   */
  editMessage = catchAsync(async (req, res) => {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const message = await ChatMessage.findById(messageId);
    if (!message) {
      throw new AppError('Message not found', 404);
    }

    await message.editMessage(content, userId);

    res.status(200).json({
      status: 'success',
      data: {
        message
      }
    });
  });

  /**
   * Delete a message
   */
  deleteMessage = catchAsync(async (req, res) => {
    const { messageId } = req.params;
    const userId = req.user.id;
    const isAdmin = req.userRole && ['admin', 'co-admin'].includes(req.userRole);

    const message = await ChatMessage.findById(messageId);
    if (!message) {
      throw new AppError('Message not found', 404);
    }

    await message.deleteMessage(userId, isAdmin);

    res.status(200).json({
      status: 'success',
      message: 'Message deleted successfully'
    });
  });

  /**
   * Vote in a poll
   */
  voteInPoll = catchAsync(async (req, res) => {
    const { messageId } = req.params;
    const { optionIndex } = req.body;
    const userId = req.user.id;

    const message = await ChatMessage.findById(messageId);
    if (!message) {
      throw new AppError('Message not found', 404);
    }

    if (message.type !== 'poll') {
      throw new AppError('This message is not a poll', 400);
    }

    await message.voteInPoll(userId, optionIndex);

    res.status(200).json({
      status: 'success',
      data: {
        messageId,
        optionIndex,
        poll: message.poll
      }
    });
  });

  /**
   * Create a poll
   */
  createPoll = catchAsync(async (req, res) => {
    const { groupId } = req.params;
    const { question, options, allowMultiple = false, expiresAt = null } = req.body;
    const userId = req.user.id;

    // Verify user is member of group
    const group = await Group.findById(groupId);
    if (!group || !group.isMember(userId)) {
      throw new AppError('Access denied to group', 403);
    }

    if (!group.settings.chatEnabled) {
      throw new AppError('Chat is disabled for this group', 403);
    }

    const message = new ChatMessage({
      group: groupId,
      author: userId,
      content: question,
      type: 'poll',
      poll: {
        question,
        options: options.map(option => ({ text: option, votes: [], count: 0 })),
        allowMultiple,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true
      }
    });

    await message.save();
    await message.populate('author', 'username firstName lastName avatar');

    res.status(201).json({
      status: 'success',
      data: {
        message
      }
    });
  });

  /**
   * Mark messages as read
   */
  markMessagesAsRead = catchAsync(async (req, res) => {
    const { groupId } = req.params;
    const { messageIds } = req.body;
    const userId = req.user.id;

    // Verify user is member of group
    const group = await Group.findById(groupId);
    if (!group || !group.isMember(userId)) {
      throw new AppError('Access denied to group', 403);
    }

    const messages = await ChatMessage.find({
      _id: { $in: messageIds },
      group: groupId
    });

    for (const message of messages) {
      await message.markAsRead(userId);
    }

    res.status(200).json({
      status: 'success',
      message: 'Messages marked as read'
    });
  });

  /**
   * Search messages
   */
  searchMessages = catchAsync(async (req, res) => {
    const { groupId } = req.params;
    const { query, limit = 20, skip = 0 } = req.query;

    if (!query || query.trim().length === 0) {
      throw new AppError('Search query is required', 400);
    }

    const messages = await ChatMessage.searchMessages(groupId, query, {
      limit: parseInt(limit),
      skip: parseInt(skip)
    });

    res.status(200).json({
      status: 'success',
      data: {
        messages,
        query,
        count: messages.length
      }
    });
  });

  /**
   * Get message statistics
   */
  getMessageStats = catchAsync(async (req, res) => {
    const { groupId } = req.params;

    const stats = await ChatMessage.aggregate([
      { $match: { group: groupId, isDeleted: false } },
      {
        $group: {
          _id: null,
          totalMessages: { $sum: 1 },
          totalReactions: { $sum: '$stats.reactionCount' },
          totalReplies: { $sum: '$stats.replyCount' },
          messagesByType: {
            $push: '$type'
          }
        }
      }
    ]);

    const typeStats = {};
    if (stats.length > 0) {
      stats[0].messagesByType.forEach(type => {
        typeStats[type] = (typeStats[type] || 0) + 1;
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        stats: stats[0] || {
          totalMessages: 0,
          totalReactions: 0,
          totalReplies: 0
        },
        typeStats
      }
    });
  });

  /**
   * Handle mentions in messages
   */
  async handleMentions(message, group) {
    try {
      const mentionRegex = /@(\w+)/g;
      const mentions = message.content.match(mentionRegex);
      
      if (mentions) {
        for (const mention of mentions) {
          const username = mention.substring(1);
          const mentionedUser = group.members.find(member => 
            member.user.username === username
          );
          
          if (mentionedUser) {
            await Notification.createNotification({
              recipient: mentionedUser.user._id,
              sender: message.author,
              title: 'You were mentioned',
              message: `${message.author.username} mentioned you in a chat message`,
              type: 'chat_mention',
              group: group._id,
              relatedEntity: {
                type: 'chat_message',
                id: message._id
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('Handle mentions error:', error);
    }
  }
}

module.exports = new ChatController();
