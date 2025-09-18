const express = require('express');
const groupController = require('../controllers/groupController');
const { protect } = require('../middleware/auth');
const { 
  checkGroupMembership,
  checkGroupPermission,
  requireAdminOrCoAdmin,
  requireGroupAdmin
} = require('../middleware/permissions');
const { validateGroup } = require('../middleware/validation');

const router = express.Router();

// All group routes require authentication
router.use(protect);

/**
 * @route   GET /api/groups/public
 * @desc    Get public groups
 * @access  Public
 */
router.get('/public', groupController.getPublicGroups);

/**
 * @route   GET /api/groups/my-groups
 * @desc    Get user's groups
 * @access  Private
 */
router.get('/my-groups', groupController.getUserGroups);

/**
 * @route   POST /api/groups
 * @desc    Create a new group
 * @access  Private
 */
router.post('/',
  validateGroup.create,
  groupController.createGroup
);

/**
 * @route   POST /api/groups/:groupId/join
 * @desc    Join a public group
 * @access  Private
 */
router.post('/:groupId/join', groupController.joinPublicGroup);

/**
 * @route   GET /api/groups/:groupId
 * @desc    Get group details
 * @access  Private (Group members only)
 */
router.get('/:groupId',
  checkGroupMembership,
  groupController.getGroup
);

/**
 * @route   PUT /api/groups/:groupId
 * @desc    Update group
 * @access  Private (Admin/Co-admin only)
 */
router.put('/:groupId',
  requireAdminOrCoAdmin,
  validateGroup.update,
  groupController.updateGroup
);

/**
 * @route   DELETE /api/groups/:groupId
 * @desc    Delete group
 * @access  Private (Group admin only)
 */
router.delete('/:groupId',
  requireGroupAdmin,
  groupController.deleteGroup
);

/**
 * @route   GET /api/groups/:groupId/members
 * @desc    Get group members
 * @access  Private (Group members only)
 */
router.get('/:groupId/members',
  checkGroupMembership,
  groupController.getGroupMembers
);

/**
 * @route   POST /api/groups/:groupId/invite
 * @desc    Invite user to group
 * @access  Private (Members with invite permission)
 */
router.post('/:groupId/invite',
  checkGroupPermission('canInviteMembers'),
  validateGroup.invite,
  groupController.inviteUser
);

/**
 * @route   POST /api/groups/accept-invitation
 * @desc    Accept group invitation
 * @access  Private
 */
router.post('/accept-invitation', groupController.acceptInvitation);

/**
 * @route   DELETE /api/groups/:groupId/members/:memberId
 * @desc    Remove member from group
 * @access  Private (Admin/Co-admin only)
 */
router.delete('/:groupId/members/:memberId',
  requireAdminOrCoAdmin,
  groupController.removeMember
);

/**
 * @route   PUT /api/groups/:groupId/members/:memberId
 * @desc    Update member role
 * @access  Private (Admin/Co-admin only)
 */
router.put('/:groupId/members/:memberId',
  requireAdminOrCoAdmin,
  validateGroup.updateMember,
  groupController.updateMemberRole
);

/**
 * @route   GET /api/groups/:groupId/subgroups
 * @desc    Get sub-groups
 * @access  Private (Group members only)
 */
router.get('/:groupId/subgroups',
  checkGroupMembership,
  groupController.getSubGroups
);

module.exports = router;