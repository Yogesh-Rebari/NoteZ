const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Group = require('../models/Group');
const { connectDB } = require('../config/database');

describe('Groups API', () => {
  let userToken;
  let userId;

  beforeAll(async () => {
    await connectDB.connect();
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Group.deleteMany({});
    await connectDB.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Group.deleteMany({});

    // Create test user
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Test123!'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData);

    userToken = response.body.data.token;
    userId = response.body.data.user._id;
  });

  describe('POST /api/groups', () => {
    it('should create a new group successfully', async () => {
      const groupData = {
        name: 'Test Group',
        description: 'A test group for testing',
        category: 'study',
        tags: ['test', 'study'],
        settings: {
          isPublic: false,
          allowMemberInvites: true
        }
      };

      const response = await request(app)
        .post('/api/groups')
        .set('Authorization', `Bearer ${userToken}`)
        .send(groupData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.group.name).toBe(groupData.name);
      expect(response.body.data.group.admin.toString()).toBe(userId);
      expect(response.body.data.group.members).toHaveLength(1);
    });

    it('should not create group without authentication', async () => {
      const groupData = {
        name: 'Test Group',
        description: 'A test group'
      };

      const response = await request(app)
        .post('/api/groups')
        .send(groupData)
        .expect(401);

      expect(response.body.status).toBe('error');
    });

    it('should not create group with invalid data', async () => {
      const groupData = {
        name: '', // Invalid: empty name
        description: 'A test group'
      };

      const response = await request(app)
        .post('/api/groups')
        .set('Authorization', `Bearer ${userToken}`)
        .send(groupData)
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/groups/my-groups', () => {
    beforeEach(async () => {
      // Create test groups
      const groupData = {
        name: 'Test Group 1',
        description: 'First test group',
        category: 'study'
      };

      await request(app)
        .post('/api/groups')
        .set('Authorization', `Bearer ${userToken}`)
        .send(groupData);
    });

    it('should get user groups successfully', async () => {
      const response = await request(app)
        .get('/api/groups/my-groups')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.groups).toHaveLength(1);
      expect(response.body.data.groups[0].name).toBe('Test Group 1');
    });

    it('should not get groups without authentication', async () => {
      const response = await request(app)
        .get('/api/groups/my-groups')
        .expect(401);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/groups/:groupId', () => {
    let groupId;

    beforeEach(async () => {
      const groupData = {
        name: 'Test Group',
        description: 'A test group'
      };

      const response = await request(app)
        .post('/api/groups')
        .set('Authorization', `Bearer ${userToken}`)
        .send(groupData);

      groupId = response.body.data.group._id;
    });

    it('should get group details successfully', async () => {
      const response = await request(app)
        .get(`/api/groups/${groupId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.group.name).toBe('Test Group');
      expect(response.body.data.group.admin).toBeDefined();
    });

    it('should not get group without authentication', async () => {
      const response = await request(app)
        .get(`/api/groups/${groupId}`)
        .expect(401);

      expect(response.body.status).toBe('error');
    });

    it('should not get non-existent group', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/groups/${fakeId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/groups/:groupId/invite', () => {
    let groupId;

    beforeEach(async () => {
      const groupData = {
        name: 'Test Group',
        description: 'A test group'
      };

      const response = await request(app)
        .post('/api/groups')
        .set('Authorization', `Bearer ${userToken}`)
        .send(groupData);

      groupId = response.body.data.group._id;
    });

    it('should invite user to group successfully', async () => {
      const inviteData = {
        email: 'newuser@example.com',
        role: 'member'
      };

      const response = await request(app)
        .post(`/api/groups/${groupId}/invite`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(inviteData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Invitation sent successfully');
    });

    it('should not invite without proper permissions', async () => {
      // Create another user
      const user2Data = {
        username: 'testuser2',
        email: 'test2@example.com',
        password: 'Test123!'
      };

      const user2Response = await request(app)
        .post('/api/auth/register')
        .send(user2Data);

      const user2Token = user2Response.body.data.token;

      const inviteData = {
        email: 'newuser@example.com',
        role: 'member'
      };

      const response = await request(app)
        .post(`/api/groups/${groupId}/invite`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send(inviteData)
        .expect(403);

      expect(response.body.status).toBe('error');
    });
  });
});

