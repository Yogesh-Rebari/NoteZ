const mongoose = require('mongoose');

/**
 * ChatMessage Schema for real-time group chat functionality
 * Supports different message types, reactions, and threading
 */
const chatMessageSchema = new mongoose.Schema({
  // Basic Information
  content: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  
  // Group and Thread Information
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: [true, 'Message must belong to a group']
  },
  thread: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatMessage',
    default: null
  },
  
  // Author Information
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Message must have an author']
  },
  
  // Message Type and Content
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'system', 'announcement', 'poll'],
    default: 'text'
  },
  
  // Rich Content Support
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String
  }],
  
  // Message Metadata
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  hashtags: [String],
  
  // Reactions
  reactions: [{
    emoji: {
      type: String,
      required: true
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    count: {
      type: Number,
      default: 0
    }
  }],
  
  // Message Status
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  editHistory: [{
    content: String,
    editedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Message Priority
  priority: {
    type: String,
    enum: ['normal', 'important', 'urgent'],
    default: 'normal'
  },
  
  // Read Status
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Poll Support (for poll type messages)
  poll: {
    question: String,
    options: [{
      text: String,
      votes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      count: {
        type: Number,
        default: 0
      }
    }],
    allowMultiple: {
      type: Boolean,
      default: false
    },
    expiresAt: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  },
  
  // Message Statistics
  stats: {
    replyCount: {
      type: Number,
      default: 0
    },
    reactionCount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for replies
chatMessageSchema.virtual('replies', {
  ref: 'ChatMessage',
  localField: '_id',
  foreignField: 'thread',
  justOne: false
});

// Indexes for performance
chatMessageSchema.index({ group: 1, createdAt: -1 });
chatMessageSchema.index({ author: 1 });
chatMessageSchema.index({ thread: 1 });
chatMessageSchema.index({ type: 1 });
chatMessageSchema.index({ isDeleted: 1 });
chatMessageSchema.index({ 'mentions': 1 });

// Text search index
chatMessageSchema.index({
  content: 'text',
  hashtags: 'text'
});

// Pre-save middleware to update statistics
chatMessageSchema.pre('save', function(next) {
  // Update reaction count
  this.stats.reactionCount = this.reactions.reduce((total, reaction) => 
    total + reaction.count, 0
  );
  
  // Update poll option counts
  if (this.type === 'poll' && this.poll) {
    this.poll.options.forEach(option => {
      option.count = option.votes.length;
    });
  }
  
  next();
});

// Instance method to add reaction
chatMessageSchema.methods.addReaction = function(userId, emoji) {
  let reaction = this.reactions.find(r => r.emoji === emoji);
  
  if (!reaction) {
    reaction = {
      emoji,
      users: [],
      count: 0
    };
    this.reactions.push(reaction);
  }
  
  // Check if user already reacted with this emoji
  const userReacted = reaction.users.some(user => 
    user.toString() === userId.toString()
  );
  
  if (!userReacted) {
    reaction.users.push(userId);
    reaction.count += 1;
    this.stats.reactionCount += 1;
  }
  
  return this.save();
};

// Instance method to remove reaction
chatMessageSchema.methods.removeReaction = function(userId, emoji) {
  const reaction = this.reactions.find(r => r.emoji === emoji);
  
  if (reaction) {
    const userIndex = reaction.users.findIndex(user => 
      user.toString() === userId.toString()
    );
    
    if (userIndex !== -1) {
      reaction.users.splice(userIndex, 1);
      reaction.count -= 1;
      this.stats.reactionCount -= 1;
      
      // Remove reaction if no users left
      if (reaction.count === 0) {
        this.reactions = this.reactions.filter(r => r.emoji !== emoji);
      }
    }
  }
  
  return this.save();
};

// Instance method to mark as read
chatMessageSchema.methods.markAsRead = function(userId) {
  const alreadyRead = this.readBy.some(read => 
    read.user.toString() === userId.toString()
  );
  
  if (!alreadyRead) {
    this.readBy.push({ user: userId });
  }
  
  return this.save({ validateBeforeSave: false });
};

// Instance method to vote in poll
chatMessageSchema.methods.voteInPoll = function(userId, optionIndex) {
  if (this.type !== 'poll' || !this.poll || !this.poll.isActive) {
    throw new Error('Cannot vote in this poll');
  }
  
  if (this.poll.expiresAt && new Date() > this.poll.expiresAt) {
    throw new Error('Poll has expired');
  }
  
  const option = this.poll.options[optionIndex];
  if (!option) {
    throw new Error('Invalid poll option');
  }
  
  // Check if user already voted
  const hasVoted = option.votes.some(vote => 
    vote.toString() === userId.toString()
  );
  
  if (hasVoted && !this.poll.allowMultiple) {
    throw new Error('User has already voted in this poll');
  }
  
  // Remove existing votes if not allowing multiple
  if (!this.poll.allowMultiple) {
    this.poll.options.forEach(opt => {
      opt.votes = opt.votes.filter(vote => 
        vote.toString() !== userId.toString()
      );
    });
  }
  
  // Add vote
  option.votes.push(userId);
  option.count = option.votes.length;
  
  return this.save();
};

// Instance method to edit message
chatMessageSchema.methods.editMessage = function(newContent, userId) {
  if (this.author.toString() !== userId.toString()) {
    throw new Error('Only the author can edit this message');
  }
  
  // Save edit history
  this.editHistory.push({
    content: this.content,
    editedAt: new Date()
  });
  
  this.content = newContent;
  this.isEdited = true;
  this.editedAt = new Date();
  
  return this.save();
};

// Instance method to delete message
chatMessageSchema.methods.deleteMessage = function(userId, isAdmin = false) {
  if (!isAdmin && this.author.toString() !== userId.toString()) {
    throw new Error('Only the author or admin can delete this message');
  }
  
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  this.content = '[Message deleted]';
  
  return this.save();
};

// Static method to get group messages
chatMessageSchema.statics.getGroupMessages = function(groupId, options = {}) {
  const {
    limit = 50,
    skip = 0,
    before = null,
    thread = null
  } = options;
  
  const query = {
    group: groupId,
    isDeleted: false
  };
  
  if (thread) {
    query.thread = thread;
  } else {
    query.thread = null; // Only top-level messages
  }
  
  if (before) {
    query.createdAt = { $lt: before };
  }
  
  return this.find(query)
    .populate('author', 'username firstName lastName avatar')
    .populate('mentions', 'username firstName lastName')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to search messages
chatMessageSchema.statics.searchMessages = function(groupId, searchQuery, options = {}) {
  const { limit = 20, skip = 0 } = options;
  
  return this.find({
    group: groupId,
    isDeleted: false,
    $text: { $search: searchQuery }
  })
    .populate('author', 'username firstName lastName avatar')
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit)
    .skip(skip);
};

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
