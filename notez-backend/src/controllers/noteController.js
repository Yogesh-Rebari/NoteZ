const Note = require('../models/Note');
const Group = require('../models/Group');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { AppError, catchAsync } = require('../utils/helpers');

/**
 * Enhanced Note Controller with advanced features
 */
class NoteController {
  /**
   * Create a new note
   */
  createNote = catchAsync(async (req, res) => {
    const { groupId } = req.params;
    const noteData = req.body;
    const userId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
      throw new AppError('Group not found', 404);
    }

    if (!group.isMember(userId)) {
      throw new AppError('Access denied to group', 403);
    }

    if (!group.hasPermission(userId, 'canCreateNotes')) {
      throw new AppError('You do not have permission to create notes in this group', 403);
    }

    const note = new Note({
      ...noteData,
      group: groupId,
      author: userId
    });

    await note.save();
    await note.populate('author', 'username firstName lastName avatar');
    await note.populate('group', 'name');

    // Update group stats
    group.stats.noteCount += 1;
    group.stats.lastActivity = new Date();
    await group.save();

    // Create notifications for group members
    await this.createNoteNotifications(note, group, userId);

    res.status(201).json({
      status: 'success',
      data: {
        note
      }
    });
  });

  /**
   * Get notes for a group
   */
  getGroupNotes = catchAsync(async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user.id;
    const {
      limit = 20,
      skip = 0,
      category,
      tags,
      author,
      sortBy = 'createdAt',
      sortOrder = -1
    } = req.query;

    const group = await Group.findById(groupId);
    if (!group) {
      throw new AppError('Group not found', 404);
    }

    if (!group.isMember(userId)) {
      throw new AppError('Access denied to group', 403);
    }

    const query = { group: groupId, status: 'published' };

    if (category) query.category = category;
    if (tags) query.tags = { $in: tags.split(',') };
    if (author) query.author = author;

    const notes = await Note.find(query)
      .populate('author', 'username firstName lastName avatar')
      .populate('group', 'name')
      .sort({ [sortBy]: parseInt(sortOrder) })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    res.status(200).json({
      status: 'success',
      data: {
        notes,
        count: notes.length
      }
    });
  });

  /**
   * Get note details
   */
  getNote = catchAsync(async (req, res) => {
    const { noteId } = req.params;
    const userId = req.user.id;

    const note = await Note.findById(noteId)
      .populate('author', 'username firstName lastName avatar')
      .populate('group', 'name')
      .populate('collaborators.user', 'username firstName lastName avatar');

    if (!note) {
      throw new AppError('Note not found', 404);
    }

    // Check access permissions
    const group = await Group.findById(note.group);
    if (!group || !group.isMember(userId)) {
      throw new AppError('Access denied to note', 403);
    }

    // Increment view count
    await note.incrementViewCount();

    res.status(200).json({
      status: 'success',
      data: {
        note
      }
    });
  });

  /**
   * Update note
   */
  updateNote = catchAsync(async (req, res) => {
    const { noteId } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    const note = await Note.findById(noteId);
    if (!note) {
      throw new AppError('Note not found', 404);
    }

    if (!note.canEdit(userId)) {
      throw new AppError('You do not have permission to edit this note', 403);
    }

    Object.assign(note, updateData);
    await note.save();
    await note.populate('author', 'username firstName lastName avatar');

    res.status(200).json({
      status: 'success',
      data: {
        note
      }
    });
  });

  /**
   * Delete note
   */
  deleteNote = catchAsync(async (req, res) => {
    const { noteId } = req.params;
    const userId = req.user.id;

    const note = await Note.findById(noteId).populate('group');
    if (!note) {
      throw new AppError('Note not found', 404);
    }

    const isAuthor = note.author.toString() === userId;
    const hasGroupPermission = note.group.hasPermission(userId, 'canDeleteNotes');

    if (!isAuthor && !hasGroupPermission) {
      throw new AppError('You do not have permission to delete this note', 403);
    }

    // Archive instead of delete
    note.status = 'deleted';
    await note.save();

    // Update group stats
    note.group.stats.noteCount -= 1;
    await note.group.save();

    res.status(200).json({
      status: 'success',
      message: 'Note deleted successfully'
    });
  });

  /**
   * Like/unlike note
   */
  toggleLike = catchAsync(async (req, res) => {
    const { noteId } = req.params;
    const userId = req.user.id;

    const note = await Note.findById(noteId);
    if (!note) {
      throw new AppError('Note not found', 404);
    }

    // Check if user already liked
    const existingLike = note.likes.find(like => 
      like.user.toString() === userId.toString()
    );

    if (existingLike) {
      await note.removeLike(userId);
    } else {
      await note.addLike(userId);
    }

    res.status(200).json({
      status: 'success',
      data: {
        isLiked: !existingLike,
        likeCount: note.stats.likeCount
      }
    });
  });

  /**
   * Add comment to note
   */
  addComment = catchAsync(async (req, res) => {
    const { noteId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const note = await Note.findById(noteId);
    if (!note) {
      throw new AppError('Note not found', 404);
    }

    // Check access permissions
    const group = await Group.findById(note.group);
    if (!group || !group.isMember(userId)) {
      throw new AppError('Access denied to note', 403);
    }

    await note.addComment(userId, content);
    await note.populate('comments.user', 'username firstName lastName avatar');

    res.status(201).json({
      status: 'success',
      data: {
        comment: note.comments[note.comments.length - 1]
      }
    });
  });

  /**
   * Add collaborator to note
   */
  addCollaborator = catchAsync(async (req, res) => {
    const { noteId } = req.params;
    const { userId: collaboratorId, role } = req.body;
    const userId = req.user.id;

    const note = await Note.findById(noteId);
    if (!note) {
      throw new AppError('Note not found', 404);
    }

    if (!note.canEdit(userId)) {
      throw new AppError('You do not have permission to add collaborators', 403);
    }

    // Check if user is already a collaborator
    const existingCollaborator = note.collaborators.find(collab => 
      collab.user.toString() === collaboratorId.toString()
    );

    if (existingCollaborator) {
      throw new AppError('User is already a collaborator', 400);
    }

    note.collaborators.push({
      user: collaboratorId,
      role,
      addedBy: userId
    });

    await note.save();
    await note.populate('collaborators.user', 'username firstName lastName avatar');

    res.status(201).json({
      status: 'success',
      data: {
        collaborator: note.collaborators[note.collaborators.length - 1]
      }
    });
  });

  /**
   * Search notes
   */
  searchNotes = catchAsync(async (req, res) => {
    const { groupId } = req.params;
    const { q, limit = 20, skip = 0 } = req.query;
    const userId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
      throw new AppError('Group not found', 404);
    }

    if (!group.isMember(userId)) {
      throw new AppError('Access denied to group', 403);
    }

    const notes = await Note.searchNotes(q, {
      groupId,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });

    res.status(200).json({
      status: 'success',
      data: {
        notes,
        query: q,
        count: notes.length
      }
    });
  });

  /**
   * Get popular notes
   */
  getPopularNotes = catchAsync(async (req, res) => {
    const { groupId } = req.params;
    const { limit = 10 } = req.query;
    const userId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
      throw new AppError('Group not found', 404);
    }

    if (!group.isMember(userId)) {
      throw new AppError('Access denied to group', 403);
    }

    const notes = await Note.getPopularNotes(groupId, parseInt(limit));

    res.status(200).json({
      status: 'success',
      data: {
        notes,
        count: notes.length
      }
    });
  });

  /**
   * Pin/unpin note
   */
  togglePin = catchAsync(async (req, res) => {
    const { noteId } = req.params;
    const userId = req.user.id;

    const note = await Note.findById(noteId);
    if (!note) {
      throw new AppError('Note not found', 404);
    }

    // Check permissions
    const group = await Group.findById(note.group);
    if (!group || !group.hasPermission(userId, 'canPinNotes')) {
      throw new AppError('You do not have permission to pin notes', 403);
    }

    note.isPinned = !note.isPinned;
    await note.save();

    res.status(200).json({
      status: 'success',
      data: {
        isPinned: note.isPinned
      }
    });
  });

  /**
   * Archive note
   */
  archiveNote = catchAsync(async (req, res) => {
    const { noteId } = req.params;
    const userId = req.user.id;

    const note = await Note.findById(noteId);
    if (!note) {
      throw new AppError('Note not found', 404);
    }

    if (!note.canEdit(userId)) {
      throw new AppError('You do not have permission to archive this note', 403);
    }

    note.isArchived = true;
    await note.save();

    res.status(200).json({
      status: 'success',
      message: 'Note archived successfully'
    });
  });

  /**
   * Create notifications for new notes
   */
  async createNoteNotifications(note, group, authorId) {
    try {
      for (const member of group.members) {
        if (member.user._id.toString() !== authorId.toString()) {
          await Notification.createNotification({
            recipient: member.user._id,
            sender: authorId,
            title: 'New Note Created',
            message: `A new note "${note.title}" was created in ${group.name}`,
            type: 'note_created',
            group: group._id,
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
}

module.exports = new NoteController();