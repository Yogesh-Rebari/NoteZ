const Group = require('../models/Group');
const Note = require('../models/Note');
const { AppError } = require('../utils/helpers');

/**
 * Middleware to check if user is a member of a group
 */
const checkGroupMembership = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
      return next(new AppError('Group not found', 404));
    }

    if (!group.isMember(userId)) {
      return next(new AppError('You are not a member of this group', 403));
    }

    req.group = group;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user has specific role in group
 */
const checkGroupRole = (requiredRoles) => {
  return async (req, res, next) => {
    try {
      const { groupId } = req.params;
      const userId = req.user.id;

      const group = await Group.findById(groupId);
      if (!group) {
        return next(new AppError('Group not found', 404));
      }

      const userRole = group.getUserRole(userId);
      if (!userRole || !requiredRoles.includes(userRole)) {
        return next(new AppError(
          `Access denied. Required role: ${requiredRoles.join(' or ')}`, 
          403
        ));
      }

      req.group = group;
      req.userRole = userRole;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check specific permissions in group
 */
const checkGroupPermission = (permission) => {
  return async (req, res, next) => {
    try {
      const { groupId } = req.params;
      const userId = req.user.id;

      const group = await Group.findById(groupId);
      if (!group) {
        return next(new AppError('Group not found', 404));
      }

      if (!group.hasPermission(userId, permission)) {
        return next(new AppError(
          `Access denied. Required permission: ${permission}`, 
          403
        ));
      }

      req.group = group;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user can edit a note
 */
const checkNoteEditPermission = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const userId = req.user.id;

    const note = await Note.findById(noteId);
    if (!note) {
      return next(new AppError('Note not found', 404));
    }

    if (!note.canEdit(userId)) {
      return next(new AppError('You do not have permission to edit this note', 403));
    }

    req.note = note;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user can delete a note
 */
const checkNoteDeletePermission = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const userId = req.user.id;

    const note = await Note.findById(noteId).populate('group');
    if (!note) {
      return next(new AppError('Note not found', 404));
    }

    // Check if user is the author or has delete permission in group
    const isAuthor = note.author.toString() === userId;
    const hasGroupPermission = note.group.hasPermission(userId, 'canDeleteNotes');

    if (!isAuthor && !hasGroupPermission) {
      return next(new AppError('You do not have permission to delete this note', 403));
    }

    req.note = note;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user can moderate chat
 */
const checkChatModerationPermission = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
      return next(new AppError('Group not found', 404));
    }

    if (!group.hasPermission(userId, 'canModerateChat')) {
      return next(new AppError('You do not have permission to moderate chat', 403));
    }

    req.group = group;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user can invite members
 */
const checkInvitePermission = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
      return next(new AppError('Group not found', 404));
    }

    if (!group.hasPermission(userId, 'canInviteMembers')) {
      return next(new AppError('You do not have permission to invite members', 403));
    }

    req.group = group;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user can create sub-groups
 */
const checkSubGroupPermission = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
      return next(new AppError('Group not found', 404));
    }

    if (!group.hasPermission(userId, 'canCreateSubGroups')) {
      return next(new AppError('You do not have permission to create sub-groups', 403));
    }

    req.group = group;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if group allows member invites
 */
const checkGroupInviteSettings = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return next(new AppError('Group not found', 404));
    }

    if (!group.settings.allowMemberInvites) {
      return next(new AppError('This group does not allow member invitations', 403));
    }

    req.group = group;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user is admin or co-admin
 */
const requireAdminOrCoAdmin = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
      return next(new AppError('Group not found', 404));
    }

    const userRole = group.getUserRole(userId);
    if (!['admin', 'co-admin'].includes(userRole)) {
      return next(new AppError('Admin or co-admin access required', 403));
    }

    req.group = group;
    req.userRole = userRole;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user is the group admin
 */
const requireGroupAdmin = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
      return next(new AppError('Group not found', 404));
    }

    if (group.admin.toString() !== userId) {
      return next(new AppError('Only the group admin can perform this action', 403));
    }

    req.group = group;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user can access AI features
 */
const checkAIAccess = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
      return next(new AppError('Group not found', 404));
    }

    if (!group.settings.aiAssistantEnabled) {
      return next(new AppError('AI assistant is disabled for this group', 403));
    }

    if (!group.isMember(userId)) {
      return next(new AppError('You must be a group member to use AI features', 403));
    }

    req.group = group;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user can access chat features
 */
const checkChatAccess = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
      return next(new AppError('Group not found', 404));
    }

    if (!group.settings.chatEnabled) {
      return next(new AppError('Chat is disabled for this group', 403));
    }

    if (!group.isMember(userId)) {
      return next(new AppError('You must be a group member to access chat', 403));
    }

    req.group = group;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkGroupMembership,
  checkGroupRole,
  checkGroupPermission,
  checkNoteEditPermission,
  checkNoteDeletePermission,
  checkChatModerationPermission,
  checkInvitePermission,
  checkSubGroupPermission,
  checkGroupInviteSettings,
  requireAdminOrCoAdmin,
  requireGroupAdmin,
  checkAIAccess,
  checkChatAccess
};
