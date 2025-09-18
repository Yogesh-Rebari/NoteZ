const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Group = require('../models/Group');
const Note = require('../models/Note');
const { connectDB } = require('../config/database');

describe('Notes API', () => {
  let userToken;
  let userId;
  let groupId;

  beforeAll(async () => {
    await connectDB.connect();
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Group.deleteMany({});
    await Note.deleteMany({});
    await connectDB.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Group.deleteMany({});
    await Note.deleteMany({});

    // Create test user
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Test123!'
    };

    const userResponse = await request(app)
      .post('/api/auth/register')
      .send(userData);

    userToken = userResponse.body.data.token;
    userId = userResponse.body.data.user._id;

    // Create test group
    const groupData = {
      name: 'Test Group',
      description: 'A test group for notes'
    };

    const groupResponse = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${userToken}`)
      .send(groupData);

    groupId = groupResponse.body.data.group._id;
  });

  describe('POST /api/notes/groups/:groupId', () => {
    it('should create a new note successfully', async () => {
      const noteData = {
        title: 'Test Note',
        content: 'This is a test note content',
        category: 'lecture',
        tags: ['test', 'lecture'],
        priority: 'medium'
      };

      const response = await request(app)
        .post(`/api/notes/groups/${groupId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(noteData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.note.title).toBe(noteData.title);
      expect(response.body.data.note.content).toBe(noteData.content);
      expect(response.body.data.note.author.toString()).toBe(userId);
      expect(response.body.data.note.group.toString()).toBe(groupId);
    });

    it('should not create note without authentication', async () => {
      const noteData = {
        title: 'Test Note',
        content: 'This is a test note content'
      };

      const response = await request(app)
        .post(`/api/notes/groups/${groupId}`)
        .send(noteData)
        .expect(401);

      expect(response.body.status).toBe('error');
    });

    it('should not create note with invalid data', async () => {
      const noteData = {
        title: '', // Invalid: empty title
        content: 'This is a test note content'
      };

      const response = await request(app)
        .post(`/api/notes/groups/${groupId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(noteData)
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/notes/groups/:groupId', () => {
    beforeEach(async () => {
      // Create test notes
      const noteData = {
        title: 'Test Note 1',
        content: 'This is the first test note',
        category: 'lecture'
      };

      await request(app)
        .post(`/api/notes/groups/${groupId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(noteData);
    });

    it('should get group notes successfully', async () => {
      const response = await request(app)
        .get(`/api/notes/groups/${groupId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.notes).toHaveLength(1);
      expect(response.body.data.notes[0].title).toBe('Test Note 1');
    });

    it('should not get notes without authentication', async () => {
      const response = await request(app)
        .get(`/api/notes/groups/${groupId}`)
        .expect(401);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/notes/:noteId', () => {
    let noteId;

    beforeEach(async () => {
      const noteData = {
        title: 'Test Note',
        content: 'This is a test note content'
      };

      const response = await request(app)
        .post(`/api/notes/groups/${groupId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(noteData);

      noteId = response.body.data.note._id;
    });

    it('should get note details successfully', async () => {
      const response = await request(app)
        .get(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.note.title).toBe('Test Note');
      expect(response.body.data.note.content).toBe('This is a test note content');
    });

    it('should not get note without authentication', async () => {
      const response = await request(app)
        .get(`/api/notes/${noteId}`)
        .expect(401);

      expect(response.body.status).toBe('error');
    });

    it('should not get non-existent note', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/notes/${fakeId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.status).toBe('error');
    });
  });

  describe('PUT /api/notes/:noteId', () => {
    let noteId;

    beforeEach(async () => {
      const noteData = {
        title: 'Test Note',
        content: 'This is a test note content'
      };

      const response = await request(app)
        .post(`/api/notes/groups/${groupId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(noteData);

      noteId = response.body.data.note._id;
    });

    it('should update note successfully', async () => {
      const updateData = {
        title: 'Updated Test Note',
        content: 'This is the updated content'
      };

      const response = await request(app)
        .put(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.note.title).toBe(updateData.title);
      expect(response.body.data.note.content).toBe(updateData.content);
    });

    it('should not update note without authentication', async () => {
      const updateData = {
        title: 'Updated Test Note'
      };

      const response = await request(app)
        .put(`/api/notes/${noteId}`)
        .send(updateData)
        .expect(401);

      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/notes/:noteId/like', () => {
    let noteId;

    beforeEach(async () => {
      const noteData = {
        title: 'Test Note',
        content: 'This is a test note content'
      };

      const response = await request(app)
        .post(`/api/notes/groups/${groupId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(noteData);

      noteId = response.body.data.note._id;
    });

    it('should like note successfully', async () => {
      const response = await request(app)
        .post(`/api/notes/${noteId}/like`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.isLiked).toBe(true);
      expect(response.body.data.likeCount).toBe(1);
    });

    it('should unlike note successfully', async () => {
      // First like the note
      await request(app)
        .post(`/api/notes/${noteId}/like`)
        .set('Authorization', `Bearer ${userToken}`);

      // Then unlike it
      const response = await request(app)
        .post(`/api/notes/${noteId}/like`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.isLiked).toBe(false);
      expect(response.body.data.likeCount).toBe(0);
    });
  });
});

