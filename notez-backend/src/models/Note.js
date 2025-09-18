const mongoose = require('mongoose');

/**
 * Note Schema with advanced features for NoteZ
 * Supports rich content, attachments, categorization, and AI features
 */
const noteSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Note title is required'],
    trim: true,
    minlength: [1, 'Title cannot be empty'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Note content is required'],
    minlength: [1, 'Content cannot be empty']
  },
  
  // Organization
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: [true, 'Note must belong to a group']
  },
  subGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    default: null
  },
  
  // Author Information
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Note must have an author']
  },
  
  // Content Classification
  category: {
    type: String,
    enum: ['lecture', 'assignment', 'study-guide', 'summary', 'reference', 'discussion', 'other'],
    default: 'other'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Rich Content Support
  contentType: {
    type: String,
    enum: ['text', 'markdown', 'html'],
    default: 'text'
  },
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Collaboration Features
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['viewer', 'editor', 'co-author'],
      default: 'viewer'
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],
  
  // Version Control
  version: {
    type: Number,
    default: 1
  },
  previousVersions: [{
    content: String,
    title: String,
    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    editedAt: {
      type: Date,
      default: Date.now
    },
    changeReason: String
  }],
  
  // Interaction Features
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: Date,
    replies: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      content: {
        type: String,
        required: true,
        maxlength: [500, 'Reply cannot exceed 500 characters']
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  
  // AI Features
  aiSummary: {
    type: String,
    default: null
  },
  aiKeywords: [{
    type: String,
    trim: true
  }],
  aiSentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
    default: null
  },
  aiConfidence: {
    type: Number,
    min: 0,
    max: 1,
    default: null
  },
  
  // Study Features
  studyMode: {
    isEnabled: {
      type: Boolean,
      default: false
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: null
    },
    estimatedReadTime: {
      type: Number, // in minutes
      default: null
    },
    quizQuestions: [{
      question: {
        type: String,
        required: true
      },
      options: [String],
      correctAnswer: {
        type: Number,
        required: true
      },
      explanation: String,
      difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
      }
    }]
  },
  
  // Privacy and Access
  visibility: {
    type: String,
    enum: ['public', 'group', 'private', 'collaborators'],
    default: 'group'
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  
  // Statistics
  stats: {
    viewCount: {
      type: Number,
      default: 0
    },
    likeCount: {
      type: Number,
      default: 0
    },
    commentCount: {
      type: Number,
      default: 0
    },
    shareCount: {
      type: Number,
      default: 0
    },
    lastViewed: Date
  },
  
  // Scheduling
  scheduledPublish: {
    isScheduled: {
      type: Boolean,
      default: false
    },
    publishAt: Date,
    publishedAt: Date
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'deleted'],
    default: 'published'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full content preview
noteSchema.virtual('preview').get(function() {
  if (this.contentType === 'html') {
    // Strip HTML tags for preview
    return this.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...';
  }
  return this.content.substring(0, 200) + '...';
});

// Virtual for reading time estimation
noteSchema.virtual('readingTime').get(function() {
  if (this.studyMode.estimatedReadTime) {
    return this.studyMode.estimatedReadTime;
  }
  
  const wordsPerMinute = 200;
  const wordCount = this.content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
});

// Indexes for performance
noteSchema.index({ group: 1, createdAt: -1 });
noteSchema.index({ author: 1 });
noteSchema.index({ category: 1 });
noteSchema.index({ tags: 1 });
noteSchema.index({ priority: 1 });
noteSchema.index({ status: 1 });
noteSchema.index({ isPinned: -1, createdAt: -1 });
noteSchema.index({ 'stats.viewCount': -1 });
noteSchema.index({ 'stats.likeCount': -1 });
noteSchema.index({ scheduledPublish: 1 });

// Text search index
noteSchema.index({
  title: 'text',
  content: 'text',
  tags: 'text'
});

// Pre-save middleware to update statistics
noteSchema.pre('save', function(next) {
  this.stats.likeCount = this.likes.length;
  this.stats.commentCount = this.comments.length;
  next();
});

// Pre-save middleware to handle versioning
noteSchema.pre('save', function(next) {
  if (this.isModified('content') || this.isModified('title')) {
    if (!this.isNew) {
      // Save current version to history
      this.previousVersions.push({
        content: this.content,
        title: this.title,
        editedBy: this.author,
        editedAt: new Date()
      });
      
      // Increment version
      this.version += 1;
    }
  }
  next();
});

// Instance method to add like
noteSchema.methods.addLike = function(userId) {
  const existingLike = this.likes.find(like => 
    like.user.toString() === userId.toString()
  );
  
  if (!existingLike) {
    this.likes.push({ user: userId });
    this.stats.likeCount = this.likes.length;
  }
  
  return this.save();
};

// Instance method to remove like
noteSchema.methods.removeLike = function(userId) {
  this.likes = this.likes.filter(like => 
    like.user.toString() !== userId.toString()
  );
  this.stats.likeCount = this.likes.length;
  return this.save();
};

// Instance method to add comment
noteSchema.methods.addComment = function(userId, content) {
  this.comments.push({
    user: userId,
    content: content
  });
  this.stats.commentCount = this.comments.length;
  return this.save();
};

// Instance method to increment view count
noteSchema.methods.incrementViewCount = function() {
  this.stats.viewCount += 1;
  this.stats.lastViewed = new Date();
  return this.save({ validateBeforeSave: false });
};

// Instance method to check if user can edit
noteSchema.methods.canEdit = function(userId) {
  // Author can always edit
  if (this.author.toString() === userId.toString()) {
    return true;
  }
  
  // Check collaborators
  const collaborator = this.collaborators.find(collab => 
    collab.user.toString() === userId.toString() && 
    ['editor', 'co-author'].includes(collab.role)
  );
  
  return !!collaborator;
};

// Instance method to get public note info
noteSchema.methods.getPublicInfo = function() {
  return {
    _id: this._id,
    title: this.title,
    preview: this.preview,
    category: this.category,
    tags: this.tags,
    priority: this.priority,
    author: this.author,
    group: this.group,
    stats: this.stats,
    readingTime: this.readingTime,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Static method to search notes
noteSchema.statics.searchNotes = function(query, options = {}) {
  const {
    groupId,
    category,
    tags,
    author,
    limit = 20,
    skip = 0,
    sortBy = 'createdAt',
    sortOrder = -1
  } = options;
  
  const searchQuery = {};
  
  if (query) {
    searchQuery.$text = { $search: query };
  }
  
  if (groupId) {
    searchQuery.group = groupId;
  }
  
  if (category) {
    searchQuery.category = category;
  }
  
  if (tags && tags.length > 0) {
    searchQuery.tags = { $in: tags };
  }
  
  if (author) {
    searchQuery.author = author;
  }
  
  searchQuery.status = 'published';
  
  return this.find(searchQuery)
    .populate('author', 'username firstName lastName avatar')
    .populate('group', 'name')
    .sort({ [sortBy]: sortOrder })
    .limit(limit)
    .skip(skip);
};

// Static method to get popular notes
noteSchema.statics.getPopularNotes = function(groupId, limit = 10) {
  return this.find({
    group: groupId,
    status: 'published'
  })
    .sort({ 'stats.likeCount': -1, 'stats.viewCount': -1 })
    .limit(limit)
    .populate('author', 'username firstName lastName avatar');
};

module.exports = mongoose.model('Note', noteSchema);