const mongoose = require('mongoose');

/**
 * Group Schema with advanced features for NoteZ
 * Supports nested groups, permissions, and real-time features
 */
const groupSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Group name is required'],
    trim: true,
    minlength: [2, 'Group name must be at least 2 characters'],
    maxlength: [100, 'Group name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  
  // Group Structure
  parentGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    default: null
  },
  level: {
    type: Number,
    default: 0,
    min: 0,
    max: 5 // Maximum nesting level
  },
  path: {
    type: String,
    default: '',
    index: true
  },
  
  // Ownership and Administration
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Group must have an admin']
  },
  coAdmins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Membership Management
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'co-admin', 'moderator', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    permissions: {
      canCreateNotes: { type: Boolean, default: true },
      canEditNotes: { type: Boolean, default: false },
      canDeleteNotes: { type: Boolean, default: false },
      canInviteMembers: { type: Boolean, default: false },
      canCreateSubGroups: { type: Boolean, default: false },
      canModerateChat: { type: Boolean, default: false }
    },
    status: {
      type: String,
      enum: ['active', 'muted', 'banned'],
      default: 'active'
    }
  }],
  
  // Group Settings
  settings: {
    isPublic: {
      type: Boolean,
      default: false
    },
    allowMemberInvites: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    maxMembers: {
      type: Number,
      default: 100,
      min: 2,
      max: 1000
    },
    chatEnabled: {
      type: Boolean,
      default: true
    },
    aiAssistantEnabled: {
      type: Boolean,
      default: true
    }
  },
  
  // Group Categories and Tags
  category: {
    type: String,
    enum: ['academic', 'study', 'project', 'social', 'work', 'other'],
    default: 'study'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 30
  }],
  
  // Statistics
  stats: {
    noteCount: {
      type: Number,
      default: 0
    },
    subGroupCount: {
      type: Number,
      default: 0
    },
    memberCount: {
      type: Number,
      default: 1
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  },
  
  // Group Status
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active'
  },
  
  // Invitations
  pendingInvitations: [{
    email: {
      type: String,
      required: true
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['member', 'moderator'],
      default: 'member'
    },
    token: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for sub-groups
groupSchema.virtual('subGroups', {
  ref: 'Group',
  localField: '_id',
  foreignField: 'parentGroup',
  justOne: false
});

// Virtual for notes
groupSchema.virtual('notes', {
  ref: 'Note',
  localField: '_id',
  foreignField: 'group',
  justOne: false
});

// Virtual for chat messages
groupSchema.virtual('chatMessages', {
  ref: 'ChatMessage',
  localField: '_id',
  foreignField: 'group',
  justOne: false
});

// Indexes for performance
groupSchema.index({ admin: 1 });
groupSchema.index({ 'members.user': 1 });
groupSchema.index({ parentGroup: 1 });
groupSchema.index({ path: 1 });
groupSchema.index({ status: 1 });
groupSchema.index({ category: 1 });
groupSchema.index({ 'stats.lastActivity': -1 });

// Pre-save middleware to update path and level
groupSchema.pre('save', async function(next) {
  if (this.isModified('parentGroup') || this.isNew) {
    if (this.parentGroup) {
      const parent = await this.constructor.findById(this.parentGroup);
      if (parent) {
        this.level = parent.level + 1;
        this.path = parent.path ? `${parent.path}/${parent._id}` : parent._id.toString();
        
        // Check nesting level limit
        if (this.level > 5) {
          return next(new Error('Maximum nesting level of 5 exceeded'));
        }
      }
    } else {
      this.level = 0;
      this.path = '';
    }
  }
  next();
});

// Pre-save middleware to update member count
groupSchema.pre('save', function(next) {
  this.stats.memberCount = this.members.length;
  next();
});

// Instance method to check if user is member
groupSchema.methods.isMember = function(userId) {
  return this.members.some(member => 
    member.user.toString() === userId.toString() && 
    member.status === 'active'
  );
};

// Instance method to get user role in group
groupSchema.methods.getUserRole = function(userId) {
  const member = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  return member ? member.role : null;
};

// Instance method to check user permissions
groupSchema.methods.hasPermission = function(userId, permission) {
  const member = this.members.find(member => 
    member.user.toString() === userId.toString() && 
    member.status === 'active'
  );
  
  if (!member) return false;
  
  // Admin and co-admin have all permissions
  if (['admin', 'co-admin'].includes(member.role)) {
    return true;
  }
  
  // Check specific permission
  return member.permissions[permission] || false;
};

// Instance method to add member
groupSchema.methods.addMember = function(userId, role = 'member', permissions = {}) {
  const defaultPermissions = {
    canCreateNotes: true,
    canEditNotes: false,
    canDeleteNotes: false,
    canInviteMembers: false,
    canCreateSubGroups: false,
    canModerateChat: false
  };
  
  const memberPermissions = { ...defaultPermissions, ...permissions };
  
  this.members.push({
    user: userId,
    role,
    permissions: memberPermissions
  });
  
  return this.save();
};

// Instance method to remove member
groupSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(member => 
    member.user.toString() !== userId.toString()
  );
  return this.save();
};

// Instance method to update member role
groupSchema.methods.updateMemberRole = function(userId, newRole, newPermissions = {}) {
  const member = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (member) {
    member.role = newRole;
    if (Object.keys(newPermissions).length > 0) {
      member.permissions = { ...member.permissions, ...newPermissions };
    }
  }
  
  return this.save();
};

// Instance method to get public group info
groupSchema.methods.getPublicInfo = function() {
  return {
    _id: this._id,
    name: this.name,
    description: this.description,
    category: this.category,
    tags: this.tags,
    settings: {
      isPublic: this.settings.isPublic,
      chatEnabled: this.settings.chatEnabled,
      aiAssistantEnabled: this.settings.aiAssistantEnabled
    },
    stats: {
      memberCount: this.stats.memberCount,
      noteCount: this.stats.noteCount,
      subGroupCount: this.stats.subGroupCount
    },
    createdAt: this.createdAt
  };
};

// Static method to find user's groups
groupSchema.statics.findUserGroups = function(userId, includeArchived = false) {
  const query = {
    'members.user': userId,
    'members.status': 'active'
  };
  
  if (!includeArchived) {
    query.status = 'active';
  }
  
  return this.find(query)
    .populate('admin', 'username firstName lastName avatar')
    .populate('members.user', 'username firstName lastName avatar')
    .sort({ 'stats.lastActivity': -1 });
};

// Static method to find public groups
groupSchema.statics.findPublicGroups = function(limit = 20, skip = 0) {
  return this.find({
    status: 'active',
    'settings.isPublic': true
  })
    .populate('admin', 'username firstName lastName avatar')
    .select('name description category tags stats createdAt')
    .sort({ 'stats.lastActivity': -1 })
    .limit(limit)
    .skip(skip);
};

module.exports = mongoose.model('Group', groupSchema);