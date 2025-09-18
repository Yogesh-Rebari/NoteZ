# NoteZ Testing Guide

This guide covers testing procedures for the NoteZ application to ensure all features work correctly.

## Table of Contents

1. [Testing Setup](#testing-setup)
2. [Authentication Testing](#authentication-testing)
3. [API Testing](#api-testing)
4. [Frontend Testing](#frontend-testing)
5. [Real-time Features Testing](#real-time-features-testing)
6. [AI Features Testing](#ai-features-testing)
7. [Security Testing](#security-testing)
8. [Performance Testing](#performance-testing)

## Testing Setup

### Prerequisites

1. **Backend Running**: Ensure the backend is running on `http://localhost:3001`
2. **Frontend Running**: Ensure the frontend is running on `http://localhost:3000`
3. **Database Connected**: MongoDB connection should be active
4. **Environment Variables**: All required environment variables set

### Test Data

Create test users for different scenarios:
- Admin user
- Regular user
- User with limited permissions

## Authentication Testing

### 1. User Registration

**Test Case**: New user registration
```bash
# API Test
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

**Expected Response**:
```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "...",
      "username": "testuser",
      "email": "test@example.com",
      "firstName": "Test",
      "lastName": "User"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Frontend Test**:
1. Navigate to `/register`
2. Fill in registration form
3. Verify successful registration and redirect to home page
4. Check that user is authenticated

### 2. User Login

**Test Case**: User login with valid credentials
```bash
# API Test
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "testuser",
    "password": "TestPass123"
  }'
```

**Frontend Test**:
1. Navigate to `/login`
2. Enter valid credentials
3. Verify successful login and redirect
4. Check authentication state

### 3. Protected Routes

**Test Case**: Access protected routes
```bash
# API Test - Should fail without token
curl -X GET http://localhost:3001/api/auth/me

# API Test - Should succeed with token
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Frontend Test**:
1. Try accessing protected routes without authentication
2. Verify redirect to login page
3. Login and verify access to protected routes

### 4. Token Expiration

**Test Case**: Handle expired tokens
1. Login and get a token
2. Wait for token expiration (or manually expire it)
3. Make authenticated request
4. Verify proper error handling and re-authentication flow

## API Testing

### 1. Groups API

**Create Group**:
```bash
curl -X POST http://localhost:3001/api/groups \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Study Group",
    "description": "A group for testing",
    "category": "study"
  }'
```

**Get Groups**:
```bash
curl -X GET http://localhost:3001/api/groups/my-groups \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Notes API

**Create Note**:
```bash
curl -X POST http://localhost:3001/api/notes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Note",
    "content": "This is a test note content",
    "groupId": "GROUP_ID_HERE",
    "category": "lecture"
  }'
```

**Get Notes**:
```bash
curl -X GET "http://localhost:3001/api/notes/groups/GROUP_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Chat API

**Get Messages**:
```bash
curl -X GET "http://localhost:3001/api/chat/groups/GROUP_ID/messages" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Frontend Testing

### 1. Component Testing

**Home Page**:
1. Verify welcome message displays user's name
2. Check all quick action buttons work
3. Verify responsive design

**Group Page**:
1. Navigate to a group
2. Verify group information displays correctly
3. Test chat interface
4. Test note viewing

**Notes Page**:
1. Test search functionality
2. Test filtering options
3. Verify note display and pagination

### 2. Authentication Flow

**Complete Flow Test**:
1. Start at home page (should redirect to login)
2. Register new account
3. Verify email verification (if enabled)
4. Login with new account
5. Navigate through protected routes
6. Logout and verify redirect to login

### 3. State Management

**AuthContext Testing**:
1. Verify token storage in memory
2. Check token persistence across page refreshes
3. Test logout clearing all state
4. Verify authentication state updates

**Socket Context Testing**:
1. Verify socket connection on authentication
2. Check socket disconnection on logout
3. Test real-time event handling

## Real-time Features Testing

### 1. Chat Testing

**Basic Chat**:
1. Open two browser windows with different users
2. Join the same group
3. Send messages from one user
4. Verify messages appear in real-time on the other window

**Typing Indicators**:
1. Start typing in one window
2. Verify typing indicator appears in the other window
3. Stop typing and verify indicator disappears

**User Presence**:
1. Join a group chat
2. Verify online user count updates
3. Leave the group and verify count decreases

### 2. Notifications Testing

**Real-time Notifications**:
1. Create a new note in a group
2. Verify other group members receive notifications
3. Test notification dismissal and marking as read

### 3. Socket.io Connection Testing

**Connection Stability**:
1. Test connection with poor network conditions
2. Verify reconnection after network interruption
3. Test multiple tabs with same user

## AI Features Testing

### 1. AI Chatbot Testing

**Basic Chat**:
```bash
curl -X POST "http://localhost:3001/api/ai/chat/GROUP_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Explain the concept of React hooks",
    "personality": "helpful",
    "studyMode": true
  }'
```

**Frontend Test**:
1. Open AI chatbot in a group
2. Send various types of questions
3. Test different personality settings
4. Test study mode toggle

### 2. Note Analysis

**Generate Summary**:
```bash
curl -X POST "http://localhost:3001/api/ai/summary/NOTE_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Generate Quiz**:
```bash
curl -X POST "http://localhost:3001/api/ai/quiz/NOTE_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Security Testing

### 1. Authentication Security

**JWT Token Security**:
1. Verify tokens are not stored in localStorage
2. Check token expiration handling
3. Test token refresh mechanism

**Password Security**:
1. Verify password hashing (bcrypt)
2. Test password strength requirements
3. Check password change functionality

### 2. Authorization Testing

**Permission Checks**:
1. Test group admin permissions
2. Verify note edit permissions
3. Check chat moderation permissions

**API Security**:
1. Test API without authentication (should fail)
2. Test with invalid tokens (should fail)
3. Test with expired tokens (should fail)

### 3. Input Validation

**XSS Prevention**:
1. Try injecting script tags in note content
2. Test HTML injection in chat messages
3. Verify content sanitization

**SQL/NoSQL Injection**:
1. Test injection attempts in search queries
2. Test malformed MongoDB queries
3. Verify input sanitization

## Performance Testing

### 1. Load Testing

**API Performance**:
```bash
# Use tools like Apache Bench or Artillery
ab -n 1000 -c 10 http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Frontend Performance**:
1. Test with large numbers of notes
2. Test chat with many messages
3. Measure page load times

### 2. Real-time Performance

**Socket.io Load**:
1. Connect multiple clients simultaneously
2. Send messages rapidly
3. Monitor server resource usage

### 3. Database Performance

**Query Performance**:
1. Test with large datasets
2. Monitor query execution times
3. Verify proper indexing

## Automated Testing

### 1. Backend Unit Tests

Run existing tests:
```bash
cd notez-backend
npm test
```

### 2. Frontend E2E Tests

Run Cypress tests:
```bash
npx cypress open
```

### 3. Integration Tests

Test complete user workflows:
1. User registration → group creation → note creation → chat
2. Group invitation → acceptance → collaboration
3. AI interaction → note analysis → quiz generation

## Test Checklist

### Authentication ✓
- [ ] User registration works
- [ ] User login works
- [ ] Token-based authentication works
- [ ] Protected routes are secured
- [ ] Logout clears authentication state
- [ ] Token expiration is handled properly

### Core Features ✓
- [ ] Group creation and management
- [ ] Note creation and editing
- [ ] File uploads work
- [ ] Search and filtering work
- [ ] User permissions are enforced

### Real-time Features ✓
- [ ] Chat messages are real-time
- [ ] Typing indicators work
- [ ] User presence updates
- [ ] Notifications are delivered
- [ ] Socket.io connection is stable

### AI Features ✓
- [ ] AI chatbot responds correctly
- [ ] Note summarization works
- [ ] Quiz generation works
- [ ] Keyword extraction works
- [ ] Study suggestions work

### Security ✓
- [ ] Authentication is secure
- [ ] Authorization is enforced
- [ ] Input validation prevents XSS
- [ ] No injection vulnerabilities
- [ ] CORS is properly configured

### Performance ✓
- [ ] API responses are fast (<500ms)
- [ ] Frontend loads quickly
- [ ] Real-time features are responsive
- [ ] Database queries are optimized
- [ ] No memory leaks

### Deployment ✓
- [ ] Environment variables work
- [ ] Production build works
- [ ] SSL/HTTPS works
- [ ] Health checks respond
- [ ] Monitoring is active

## Troubleshooting Common Issues

### Authentication Issues
1. **Token not working**: Check JWT secret configuration
2. **CORS errors**: Verify CORS_ORIGIN setting
3. **Login redirect loop**: Check authentication state logic

### Real-time Issues
1. **Socket not connecting**: Check WebSocket support and CORS
2. **Messages not appearing**: Verify socket event listeners
3. **Connection drops**: Check network stability and reconnection logic

### Performance Issues
1. **Slow API responses**: Check database queries and indexing
2. **Memory leaks**: Check for event listener cleanup
3. **High CPU usage**: Profile application and optimize bottlenecks

This testing guide ensures comprehensive coverage of all NoteZ features and helps identify issues before deployment.
