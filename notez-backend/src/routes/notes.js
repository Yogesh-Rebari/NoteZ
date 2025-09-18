const express = require('express');
const noteController = require('../controllers/noteController');
const { protect } = require('../middleware/auth');
const { 
  checkGroupMembership,
  checkNoteEditPermission,
  checkNoteDeletePermission,
  checkGroupPermission
} = require('../middleware/permissions');
const { validateNote } = require('../middleware/validation');

const router = express.Router();

// All note routes require authentication
router.use(protect);

/**
 * @route   GET /api/notes/search
 * @desc    Search notes across all user's groups
 * @access  Private
 */
router.get('/search', noteController.searchNotes);

/**
 * @route   POST /api/notes/groups/:groupId
 * @desc    Create a new note in group
 * @access  Private (Group members with create permission)
 */
router.post('/groups/:groupId',
  checkGroupMembership,
  checkGroupPermission('canCreateNotes'),
  validateNote.create,
  noteController.createNote
);

/**
 * @route   GET /api/notes/groups/:groupId
 * @desc    Get notes for a group
 * @access  Private (Group members only)
 */
router.get('/groups/:groupId',
  checkGroupMembership,
  noteController.getGroupNotes
);

/**
 * @route   GET /api/notes/groups/:groupId/popular
 * @desc    Get popular notes in group
 * @access  Private (Group members only)
 */
router.get('/groups/:groupId/popular',
  checkGroupMembership,
  noteController.getPopularNotes
);

/**
 * @route   GET /api/notes/groups/:groupId/search
 * @desc    Search notes in group
 * @access  Private (Group members only)
 */
router.get('/groups/:groupId/search',
  checkGroupMembership,
  noteController.searchNotes
);

/**
 * @route   GET /api/notes/:noteId
 * @desc    Get note details
 * @access  Private (Group members only)
 */
router.get('/:noteId', noteController.getNote);

/**
 * @route   PUT /api/notes/:noteId
 * @desc    Update note
 * @access  Private (Note author or editor)
 */
router.put('/:noteId',
  checkNoteEditPermission,
  validateNote.update,
  noteController.updateNote
);

/**
 * @route   DELETE /api/notes/:noteId
 * @desc    Delete note
 * @access  Private (Note author or group admin)
 */
router.delete('/:noteId',
  checkNoteDeletePermission,
  noteController.deleteNote
);

/**
 * @route   POST /api/notes/:noteId/like
 * @desc    Like/unlike note
 * @access  Private (Group members only)
 */
router.post('/:noteId/like', noteController.toggleLike);

/**
 * @route   POST /api/notes/:noteId/comments
 * @desc    Add comment to note
 * @access  Private (Group members only)
 */
router.post('/:noteId/comments', noteController.addComment);

/**
 * @route   POST /api/notes/:noteId/collaborators
 * @desc    Add collaborator to note
 * @access  Private (Note author or editor)
 */
router.post('/:noteId/collaborators',
  checkNoteEditPermission,
  validateNote.addCollaborator,
  noteController.addCollaborator
);

/**
 * @route   POST /api/notes/:noteId/pin
 * @desc    Pin/unpin note
 * @access  Private (Group admin/co-admin)
 */
router.post('/:noteId/pin',
  checkGroupPermission('canPinNotes'),
  noteController.togglePin
);

/**
 * @route   POST /api/notes/:noteId/archive
 * @desc    Archive note
 * @access  Private (Note author or editor)
 */
router.post('/:noteId/archive',
  checkNoteEditPermission,
  noteController.archiveNote
);

module.exports = router;