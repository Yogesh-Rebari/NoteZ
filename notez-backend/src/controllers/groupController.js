const Group = require('../models/Group');
const User = require('../models/User');
const Note = require('../models/Note');
const Notification = require('../models/Notification');
const { AppError, catchAsync, generateToken } = require('../utils/helpers');

/**
 * Enhanced Group Controller with advanced features
 */
class GroupController {
  /**
   * Create a new group
   */
  createGroup = catchAsync(async (req, res) => {
    const { name, description, category, tags, settings, parentGroup } = req.body;
    const userId = req.user.id;

    // Check parent group if provided
    if (parentGroup) {
      const parent = await Group.findById(parentGroup);
      if (!parent) {
        throw new AppError('Parent group not found', 404);
      }
      if (!parent.hasPermission(userId, 'canCreateSubGroups')) {
        throw new AppError('You do not have permission to create sub-groups', 403);
      }
    }

    const group = new Group({
      name,
      description,
      category,
      tags,
      settings,
      parentGroup,
      admin: userId
    });

    // Add creator as admin member
    await group.addMember(userId, 'admin', {
      canCreateNotes: true,
      canEditNotes: true,
      canDeleteNotes: true,
      canInviteMembers: true,
      canCreateSubGroups: true,
      canModerateChat: true
    });

    await group.save();
    await group.populate('admin', 'username firstName lastName avatar');

    res.status(201).json({
      status: 'success',
      data: {
        group
      }
    });
  });

  /**
   * Get user's groups
   */
  getUserGroups = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const { includeArchived = false } = req.query;

    const groups = await Group.findUserGroups(userId, includeArchived === 'true');

    res.status(200).json({
      status: 'success',
      data: {
        groups,
        count: groups.length
      }
    });
  });

  /**
   * Get group details
   */
  getGroup = catchAsync(async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(groupId)
      .populate('admin', 'username firstName lastName avatar')
      .populate('coAdmins', 'username firstName lastName avatar')
      .populate('members.user', 'username firstName lastName avatar')
      .populate('subGroups', 'name description memberCount');

    if (!group) {
      throw new AppError('Group not found', 404);
    }

    if (!group.isMember(userId)) {
      throw new AppError('Access denied to group', 403);
    }

    res.status(200).json({
      status: 'success',
      data: {
        group
      }
    });
  });

  /**
   * Update group
   */
  updateGroup = catchAsync(async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      throw new AppError('Group not found', 404);
    }

    if (!group.hasPermission(userId, 'canEditGroup')) {
      throw new AppError('You do not have permission to edit this group', 403);
    }

    Object.assign(group, updateData);
    await group.save();

    res.status(200).json({
      status: 'success',
      data: {
        group
      }
    });
  });

  /**
   * Delete group
   */
  deleteGroup = catchAsync(async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
      throw new AppError('Group not found', 404);
    }

    if (group.admin.toString() !== userId) {
      throw new AppError('Only the group admin can delete the group', 403);
    }

    // Archive instead of delete
    group.status = 'deleted';
    await group.save();

    res.status(200).json({
      status: 'success',
      message: 'Group deleted successfully'
    });
  });

  /**
   * Invite user to group
   */
  inviteUser = catchAsync(async (req, res) => {
    const { groupId } = req.params;
    const { email, role = 'member' } = req.body;
    const userId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
      throw new AppError('Group not found', 404);
    }

    if (!group.hasPermission(userId, 'canInviteMembers')) {
      throw new AppError('You do not have permission to invite members', 403);
    }

    // Check if user already exists
    const existingUser = await User.findByEmailOrUsername(email);
    if (existingUser) {
      if (group.isMember(existingUser._id)) {
        throw new AppError('User is already a member of this group', 400);
      }
    }

    // Create invitation
    const invitationToken = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    group.pendingInvitations.push({
      email,
      invitedBy: userId,
      role,
      token: invitationToken,
      expiresAt
    });

    await group.save();

    // Create notification if user exists
    if (existingUser) {
      await Notification.createNotification({
        recipient: existingUser._id,
        sender: userId,
        title: 'Group Invitation',
        message: `You have been invited to join ${group.name}`,
        type: 'group_invite',
        group: groupId,
        actions: [
          {
            label: 'Accept',
            action: 'accept_invitation',
            data: { token: invitationToken }
          },
          {
            label: 'Decline',
            action: 'decline_invitation',
            data: { token: invitationToken }
          }
        ]
      });
    }

    res.status(201).json({
      status: 'success',
      message: 'Invitation sent successfully',
      data: {
        invitationToken,
        expiresAt
      }
    });
  });

  /**
   * Accept group invitation
   */
  acceptInvitation = catchAsync(async (req, res) => {
    const { token } = req.body;
    const userId = req.user.id;

    const group = await Group.findOne({
      'pendingInvitations.token': token,
      'pendingInvitations.expiresAt': { $gt: new Date() }
    });

    if (!group) {
      throw new AppError('Invalid or expired invitation', 400);
    }

    const invitation = group.pendingInvitations.find(inv => inv.token === token);
    if (!invitation) {
      throw new AppError('Invitation not found', 404);
    }

    // Add user to group
    await group.addMember(userId, invitation.role);

    // Remove invitation
    group.pendingInvitations = group.pendingInvitations.filter(
      inv => inv.token !== token
    );

    await group.save();

    res.status(200).json({
      status: 'success',
      message: 'Successfully joined the group',
      data: {
        group: group.getPublicInfo()
      }
    });
  });

  /**
   * Remove member from group
   */
  removeMember = catchAsync(async (req, res) => {
    const { groupId, memberId } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
      throw new AppError('Group not found', 404);
    }

    if (!group.hasPermission(userId, 'canRemoveMembers')) {
      throw new AppError('You do not have permission to remove members', 403);
    }

    await group.removeMember(memberId);

    res.status(200).json({
      status: 'success',
      message: 'Member removed successfully'
    });
  });

  /**
   * Update member role
   */
  updateMemberRole = catchAsync(async (req, res) => {
    const { groupId, memberId } = req.params;
    const { role, permissions } = req.body;
    const userId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
      throw new AppError('Group not found', 404);
    }

    if (!group.hasPermission(userId, 'canManageMembers')) {
      throw new AppError('You do not have permission to manage members', 403);
    }

    await group.updateMemberRole(memberId, role, permissions);

    res.status(200).json({
      status: 'success',
      message: 'Member role updated successfully'
    });
  });

  /**
   * Get group members
   */
  getGroupMembers = catchAsync(async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(groupId)
      .populate('members.user', 'username firstName lastName avatar lastActive')
      .populate('admin', 'username firstName lastName avatar');

    if (!group) {
      throw new AppError('Group not found', 404);
    }

    if (!group.isMember(userId)) {
      throw new AppError('Access denied to group', 403);
    }

    res.status(200).json({
      status: 'success',
      data: {
        members: group.members,
        admin: group.admin,
        memberCount: group.members.length
      }
    });
  });

  /**
   * Get sub-groups
   */
  getSubGroups = catchAsync(async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
      throw new AppError('Group not found', 404);
    }

    if (!group.isMember(userId)) {
      throw new AppError('Access denied to group', 403);
    }

    const subGroups = await Group.find({ parentGroup: groupId })
      .populate('admin', 'username firstName lastName avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: {
        subGroups,
        count: subGroups.length
      }
    });
  });

  /**
   * Get public groups
   */
  getPublicGroups = catchAsync(async (req, res) => {
    const { limit = 20, skip = 0, category } = req.query;

    const query = {
      status: 'active',
      'settings.isPublic': true
    };

    if (category) {
      query.category = category;
    }

    const groups = await Group.find(query)
      .populate('admin', 'username firstName lastName avatar')
      .select('name description category tags stats createdAt')
      .sort({ 'stats.lastActivity': -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    res.status(200).json({
      status: 'success',
      data: {
        groups,
        count: groups.length
      }
    });
  });

  /**
   * Join public group
   */
  joinPublicGroup = catchAsync(async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
      throw new AppError('Group not found', 404);
    }

    if (!group.settings.isPublic) {
      throw new AppError('This group is not public', 403);
    }

    if (group.isMember(userId)) {
      throw new AppError('You are already a member of this group', 400);
    }

    if (group.settings.requireApproval) {
      // Add to pending members or create notification for admin
      await Notification.createNotification({
        recipient: group.admin,
        sender: userId,
        title: 'Join Request',
        message: `${req.user.username} wants to join ${group.name}`,
        type: 'group_join',
        group: groupId,
        actions: [
          {
            label: 'Approve',
            action: 'approve_join_request',
            data: { userId }
          },
          {
            label: 'Decline',
            action: 'decline_join_request',
            data: { userId }
          }
        ]
      });

      res.status(200).json({
        status: 'success',
        message: 'Join request sent. Waiting for approval.'
      });
    } else {
      // Direct join
      await group.addMember(userId, 'member');
      await group.save();

      res.status(200).json({
        status: 'success',
        message: 'Successfully joined the group',
        data: {
          group: group.getPublicInfo()
        }
      });
    }
  });
}

module.exports = new GroupController();