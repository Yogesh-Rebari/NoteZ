const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema with enhanced features for NoteZ
 * Includes profile management, preferences, and activity tracking
 */
const userSchema = new mongoose.Schema({
  // Basic Information
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  
  // Profile Information
  firstName: {
    type: String,
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Preferences
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    notifications: {
      email: {
        newNotes: { type: Boolean, default: true },
        groupInvites: { type: Boolean, default: true },
        mentions: { type: Boolean, default: true }
      },
      push: {
        newNotes: { type: Boolean, default: true },
        groupInvites: { type: Boolean, default: true },
        mentions: { type: Boolean, default: true }
      }
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  
  // Activity Tracking
  lastActive: {
    type: Date,
    default: Date.now
  },
  loginCount: {
    type: Number,
    default: 0
  },
  
  // AI Chatbot Settings
  aiSettings: {
    enabled: {
      type: Boolean,
      default: true
    },
    personality: {
      type: String,
      enum: ['helpful', 'casual', 'professional', 'creative'],
      default: 'helpful'
    },
    studyMode: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.username;
});

// Virtual for groups where user is admin
userSchema.virtual('adminGroups', {
  ref: 'Group',
  localField: '_id',
  foreignField: 'admin',
  justOne: false
});

// Virtual for groups where user is member
userSchema.virtual('memberGroups', {
  ref: 'Group',
  localField: '_id',
  foreignField: 'members.user',
  justOne: false
});

// Index for performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ lastActive: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it's been modified
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to update last active
userSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  this.loginCount += 1;
  return this.save({ validateBeforeSave: false });
};

// Instance method to get public profile
userSchema.methods.getPublicProfile = function() {
  return {
    _id: this._id,
    username: this.username,
    firstName: this.firstName,
    lastName: this.lastName,
    fullName: this.fullName,
    avatar: this.avatar,
    bio: this.bio,
    lastActive: this.lastActive,
    preferences: {
      theme: this.preferences.theme
    }
  };
};

// Static method to find by email or username
userSchema.statics.findByEmailOrUsername = function(identifier) {
  return this.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier }
    ]
  });
};

module.exports = mongoose.model('User', userSchema);