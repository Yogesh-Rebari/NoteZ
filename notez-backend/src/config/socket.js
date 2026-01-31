const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Group = require('../models/Group');
const ChatMessage = require('../models/ChatMessage');
const Notification = require('../models/Notification');

/**
 * Socket.io configuration for real-time features
 * Handles authentication, room management, and event handling
 */
class SocketManager {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map(); // userId -> socketId
    this.userSockets = new Map(); // socketId -> userId
    this.groupRooms = new Map(); // groupId -> Set of socketIds
    
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  /**
   * Setup Socket.io middleware for authentication
   */
  setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const config = require('./index');
        const decoded = jwt.verify(token, config.jwt.secret);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user || !user.isActive) {
          return next(new Error('Invalid or inactive user'));
        }

        socket.userId = user._id.toString();
        socket.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });

    // Connection middleware
    this.io.use((socket, next) => {
      // Store user connection
      this.connectedUsers.set(socket.userId, socket.id);
      this.userSockets.set(socket.id, socket.userId);
      
      // Update user's last active status
      socket.user.updateLastActive();
      
      next();
    });
  }

  /**
   * Setup event handlers for various real-time features
   */
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.user.username} connected with socket ${socket.id}`);

      // Join user to their personal room for notifications
      socket.join(`user_${socket.userId}`);

      // Handle joining group rooms
      socket.on('join_group', async (data) => {
        await this.handleJoinGroup(socket, data);
      });

      // Handle leaving group rooms
      socket.on('leave_group', async (data) => {
        await this.handleLeaveGroup(socket, data);
      });

      // Handle chat messages
      socket.on('send_message', async (data) => {
        await this.handleSendMessage(socket, data);
      });

      // Handle message reactions
      socket.on('react_to_message', async (data) => {
        await this.handleMessageReaction(socket, data);
      });

      // Handle typing indicators
      socket.on('typing_start', (data) => {
        this.handleTypingStart(socket, data);
      });

      socket.on('typing_stop', (data) => {
        this.handleTypingStop(socket, data);
      });

      // Handle note updates
      socket.on('note_updated', async (data) => {
        await this.handleNoteUpdate(socket, data);
      });

      // Handle note creation
      socket.on('note_created', async (data) => {
        await this.handleNoteCreated(socket, data);
      });

      // Handle AI chat requests
      socket.on('ai_chat_request', async (data) => {
        await this.handleAIChatRequest(socket, data);
      });

      // Handle user presence
      socket.on('update_presence', (data) => {
        this.handleUpdatePresence(socket, data);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  /**
   * Handle user joining a group room
   */
  async handleJoinGroup(socket, data) {
    try {
      const { groupId } = data;
      
      // Verify user is member of group
      const group = await Group.findById(groupId);
      if (!group || !group.isMember(socket.userId)) {
        socket.emit('error', { message: 'Access denied to group' });
        return;
      }

      // Join the group room
      socket.join(`group_${groupId}`);
      
      // Track group room membership
      if (!this.groupRooms.has(groupId)) {
        this.groupRooms.set(groupId, new Set());
      }
      this.groupRooms.get(groupId).add(socket.id);

      // Notify others in the group
      socket.to(`group_${groupId}`).emit('user_joined', {
        user: socket.user.getPublicProfile(),
        groupId
      });

      // Send recent messages to the user
      const recentMessages = await ChatMessage.getGroupMessages(groupId, { limit: 20 });
      socket.emit('recent_messages', { messages: recentMessages });

      console.log(`User ${socket.user.username} joined group ${groupId}`);
    } catch (error) {
      socket.emit('error', { message: 'Failed to join group' });
      console.error('Join group error:', error);
    }
  }

  /**
   * Handle user leaving a group room
   */
  async handleLeaveGroup(socket, data) {
    try {
      const { groupId } = data;
      
      socket.leave(`group_${groupId}`);
      
      // Remove from group room tracking
      if (this.groupRooms.has(groupId)) {
        this.groupRooms.get(groupId).delete(socket.id);
        if (this.groupRooms.get(groupId).size === 0) {
          this.groupRooms.delete(groupId);
        }
      }

      // Notify others in the group
      socket.to(`group_${groupId}`).emit('user_left', {
        user: socket.user.getPublicProfile(),
        groupId
      });

      console.log(`User ${socket.user.username} left group ${groupId}`);
    } catch (error) {
      console.error('Leave group error:', error);
    }
  }

  /**
   * Handle sending chat messages
   */
  async handleSendMessage(socket, data) {
    try {
      const { groupId, content, type = 'text', attachments = [] } = data;
      
      // Verify user is member of group
      const group = await Group.findById(groupId);
      if (!group || !group.isMember(socket.userId)) {
        socket.emit('error', { message: 'Access denied to group' });
        return;
      }

      // Create chat message
      const message = new ChatMessage({
        group: groupId,
        author: socket.userId,
        content,
        type,
        attachments
      });

      await message.save();
      await message.populate('author', 'username firstName lastName avatar');

      // Broadcast message to group
      this.io.to(`group_${groupId}`).emit('new_message', {
        message: message.toObject()
      });

      // Create notifications for mentioned users
      await this.handleMentions(message, groupId);

      console.log(`Message sent in group ${groupId} by ${socket.user.username}`);
    } catch (error) {
      socket.emit('error', { message: 'Failed to send message' });
      console.error('Send message error:', error);
    }
  }

  /**
   * Handle message reactions
   */
  async handleMessageReaction(socket, data) {
    try {
      const { messageId, emoji, action } = data; // action: 'add' or 'remove'
      
      const message = await ChatMessage.findById(messageId);
      if (!message) {
        socket.emit('error', { message: 'Message not found' });
        return;
      }

      // Verify user is member of the group
      const group = await Group.findById(message.group);
      if (!group || !group.isMember(socket.userId)) {
        socket.emit('error', { message: 'Access denied' });
        return;
      }

      if (action === 'add') {
        await message.addReaction(socket.userId, emoji);
      } else {
        await message.removeReaction(socket.userId, emoji);
      }

      // Broadcast reaction update
      this.io.to(`group_${message.group}`).emit('message_reaction', {
        messageId,
        emoji,
        action,
        user: socket.user.getPublicProfile()
      });
    } catch (error) {
      socket.emit('error', { message: 'Failed to update reaction' });
      console.error('Message reaction error:', error);
    }
  }

  /**
   * Handle typing indicators
   */
  handleTypingStart(socket, data) {
    const { groupId } = data;
    socket.to(`group_${groupId}`).emit('user_typing', {
      user: socket.user.getPublicProfile(),
      groupId
    });
  }

  handleTypingStop(socket, data) {
    const { groupId } = data;
    socket.to(`group_${groupId}`).emit('user_stopped_typing', {
      user: socket.user.getPublicProfile(),
      groupId
    });
  }

  /**
   * Handle note updates
   */
  async handleNoteUpdate(socket, data) {
    try {
      const { noteId, groupId, changes } = data;
      
      // Verify user has permission to update note
      const group = await Group.findById(groupId);
      if (!group || !group.isMember(socket.userId)) {
        socket.emit('error', { message: 'Access denied' });
        return;
      }

      // Broadcast note update to group
      this.io.to(`group_${groupId}`).emit('note_updated', {
        noteId,
        changes,
        updatedBy: socket.user.getPublicProfile()
      });
    } catch (error) {
      socket.emit('error', { message: 'Failed to update note' });
      console.error('Note update error:', error);
    }
  }

  /**
   * Handle note creation
   */
  async handleNoteCreated(socket, data) {
    try {
      const { note, groupId } = data;
      
      // Verify user is member of group
      const group = await Group.findById(groupId);
      if (!group || !group.isMember(socket.userId)) {
        socket.emit('error', { message: 'Access denied' });
        return;
      }

      // Broadcast new note to group
      this.io.to(`group_${groupId}`).emit('new_note', {
        note,
        createdBy: socket.user.getPublicProfile()
      });

      // Create notifications for group members
      await this.createNoteNotifications(note, groupId, socket.userId);
    } catch (error) {
      socket.emit('error', { message: 'Failed to create note' });
      console.error('Note creation error:', error);
    }
  }

  /**
   * Handle AI chat requests
   */
  async handleAIChatRequest(socket, data) {
    try {
      const { groupId, message, context } = data;
      
      // Verify user has AI access
      const group = await Group.findById(groupId);
      if (!group || !group.isMember(socket.userId) || !group.settings.aiAssistantEnabled) {
        socket.emit('error', { message: 'AI access denied' });
        return;
      }

      // Emit AI request to group (for real-time feedback)
      this.io.to(`group_${groupId}`).emit('ai_request_started', {
        user: socket.user.getPublicProfile(),
        message
      });

      // Process AI request (this would integrate with OpenAI API)
      // For now, we'll simulate a response
      setTimeout(() => {
        const aiResponse = {
          message: `AI Response to: "${message}"`,
          context,
          timestamp: new Date()
        };

        this.io.to(`group_${groupId}`).emit('ai_response', {
          response: aiResponse,
          requestedBy: socket.user.getPublicProfile()
        });
      }, 2000);
    } catch (error) {
      socket.emit('error', { message: 'Failed to process AI request' });
      console.error('AI chat error:', error);
    }
  }

  /**
   * Handle user presence updates
   */
  handleUpdatePresence(socket, data) {
    const { status, groupId } = data; // status: 'online', 'away', 'busy'
    
    if (groupId) {
      socket.to(`group_${groupId}`).emit('user_presence_update', {
        user: socket.user.getPublicProfile(),
        status
      });
    }
  }

  /**
   * Handle user disconnection
   */
  handleDisconnect(socket) {
    console.log(`User ${socket.user?.username} disconnected`);
    
    // Remove from connected users
    this.connectedUsers.delete(socket.userId);
    this.userSockets.delete(socket.id);
    
    // Remove from all group rooms
    for (const [groupId, socketIds] of this.groupRooms.entries()) {
      if (socketIds.has(socket.id)) {
        socketIds.delete(socket.id);
        if (socketIds.size === 0) {
          this.groupRooms.delete(groupId);
        }
        
        // Notify group members
        this.io.to(`group_${groupId}`).emit('user_disconnected', {
          user: socket.user?.getPublicProfile()
        });
      }
    }
  }

  /**
   * Handle mentions in messages
   */
  async handleMentions(message, groupId) {
    try {
      const mentionRegex = /@(\w+)/g;
      const mentions = message.content.match(mentionRegex);
      
      if (mentions) {
        const group = await Group.findById(groupId).populate('members.user');
        
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
              group: groupId,
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

  /**
   * Create notifications for new notes
   */
  async createNoteNotifications(note, groupId, authorId) {
    try {
      const group = await Group.findById(groupId).populate('members.user');
      
      for (const member of group.members) {
        if (member.user._id.toString() !== authorId.toString()) {
          await Notification.createNotification({
            recipient: member.user._id,
            sender: authorId,
            title: 'New note created',
            message: `A new note "${note.title}" was created in ${group.name}`,
            type: 'note_created',
            group: groupId,
            relatedEntity: {
              type: 'note',
              id: note._id
            }
          });
        }
      }
    } catch (error) {
      console.error('Create note notifications error:', error);
    }
  }

  /**
   * Send notification to user
   */
  sendNotificationToUser(userId, notification) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('notification', notification);
    }
  }

  /**
   * Send notification to group
   */
  sendNotificationToGroup(groupId, notification) {
    this.io.to(`group_${groupId}`).emit('group_notification', notification);
  }

  /**
   * Get connected users count for a group
   */
  getGroupOnlineCount(groupId) {
    const socketIds = this.groupRooms.get(groupId);
    return socketIds ? socketIds.size : 0;
  }

  /**
   * Get all connected users
   */
  getConnectedUsers() {
    return Array.from(this.connectedUsers.keys());
  }
}

module.exports = SocketManager;
