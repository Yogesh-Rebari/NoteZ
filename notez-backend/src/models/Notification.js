const mongoose = require('mongoose');

/**
 * Notification Schema for real-time notifications
 * Supports different notification types and delivery methods
 */
const notificationSchema = new mongoose.Schema({
  // Recipient Information
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Notification must have a recipient']
  },
  
  // Sender Information (optional for system notifications)
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Notification Content
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  
  // Notification Type and Category
  type: {
    type: String,
    enum: [
      'note_created',
      'note_updated',
      'note_shared',
      'note_mentioned',
      'group_invite',
      'group_join',
      'group_leave',
      'group_admin_change',
      'chat_message',
      'chat_mention',
      'ai_response',
      'system',
      'reminder',
      'achievement'
    ],
    required: [true, 'Notification type is required']
  },
  category: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'reminder'],
    default: 'info'
  },
  
  // Related Entities
  relatedEntity: {
    type: {
      type: String,
      enum: ['note', 'group', 'chat_message', 'user'],
      default: null
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    }
  },
  
  // Group Context
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    default: null
  },
  
  // Notification Status
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
    default: 'pending'
  },
  
  // Delivery Methods
  delivery: {
    inApp: {
      sent: { type: Boolean, default: false },
      delivered: { type: Boolean, default: false },
      read: { type: Boolean, default: false },
      readAt: Date
    },
    email: {
      enabled: { type: Boolean, default: true },
      sent: { type: Boolean, default: false },
      delivered: { type: Boolean, default: false },
      failed: { type: Boolean, default: false },
      error: String
    },
    push: {
      enabled: { type: Boolean, default: true },
      sent: { type: Boolean, default: false },
      delivered: { type: Boolean, default: false },
      failed: { type: Boolean, default: false },
      error: String
    }
  },
  
  // Notification Priority
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  
  // Scheduling
  scheduledFor: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    default: null
  },
  
  // Action Data
  actions: [{
    label: {
      type: String,
      required: true
    },
    action: {
      type: String,
      required: true
    },
    url: String,
    data: mongoose.Schema.Types.Mixed
  }],
  
  // Metadata
  metadata: {
    source: String, // Where the notification originated
    tags: [String],
    customData: mongoose.Schema.Types.Mixed
  },
  
  // Read Status
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  
  // Archive Status
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ sender: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ group: 1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ isArchived: 1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ expiresAt: 1 });

// Pre-save middleware to set default scheduled time
notificationSchema.pre('save', function(next) {
  if (!this.scheduledFor) {
    this.scheduledFor = new Date();
  }
  
  // Set expiration date if not set (default 30 days)
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  
  next();
});

// Instance method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  this.delivery.inApp.read = true;
  this.delivery.inApp.readAt = new Date();
  return this.save();
};

// Instance method to mark as delivered
notificationSchema.methods.markAsDelivered = function(method = 'inApp') {
  this.delivery[method].delivered = true;
  if (this.delivery.inApp.delivered && this.delivery.email.delivered && this.delivery.push.delivered) {
    this.status = 'delivered';
  }
  return this.save();
};

// Instance method to mark as failed
notificationSchema.methods.markAsFailed = function(method = 'inApp', error = null) {
  this.delivery[method].failed = true;
  if (error) {
    this.delivery[method].error = error;
  }
  this.status = 'failed';
  return this.save();
};

// Instance method to archive
notificationSchema.methods.archive = function() {
  this.isArchived = true;
  this.archivedAt = new Date();
  return this.save();
};

// Static method to create notification
notificationSchema.statics.createNotification = function(data) {
  const notification = new this({
    recipient: data.recipient,
    sender: data.sender || null,
    title: data.title,
    message: data.message,
    type: data.type,
    category: data.category || 'info',
    relatedEntity: data.relatedEntity || null,
    group: data.group || null,
    priority: data.priority || 'normal',
    actions: data.actions || [],
    metadata: data.metadata || {}
  });
  
  return notification.save();
};

// Static method to get user notifications
notificationSchema.statics.getUserNotifications = function(userId, options = {}) {
  const {
    limit = 20,
    skip = 0,
    unreadOnly = false,
    type = null,
    groupId = null,
    includeArchived = false
  } = options;
  
  const query = {
    recipient: userId,
    isArchived: includeArchived
  };
  
  if (unreadOnly) {
    query.isRead = false;
  }
  
  if (type) {
    query.type = type;
  }
  
  if (groupId) {
    query.group = groupId;
  }
  
  return this.find(query)
    .populate('sender', 'username firstName lastName avatar')
    .populate('group', 'name')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = function(userId, groupId = null) {
  const query = {
    recipient: userId,
    isRead: false
  };
  
  if (groupId) {
    query.group = groupId;
  }
  
  return this.updateMany(query, {
    isRead: true,
    readAt: new Date(),
    'delivery.inApp.read': true,
    'delivery.inApp.readAt': new Date()
  });
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = function(userId, groupId = null) {
  const query = {
    recipient: userId,
    isRead: false,
    isArchived: false
  };
  
  if (groupId) {
    query.group = groupId;
  }
  
  return this.countDocuments(query);
};

// Static method to cleanup expired notifications
notificationSchema.statics.cleanupExpired = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

// Static method to get pending notifications for delivery
notificationSchema.statics.getPendingNotifications = function(limit = 100) {
  return this.find({
    status: 'pending',
    scheduledFor: { $lte: new Date() },
    expiresAt: { $gt: new Date() }
  })
    .populate('recipient', 'email preferences')
    .populate('sender', 'username firstName lastName')
    .limit(limit);
};

module.exports = mongoose.model('Notification', notificationSchema);
