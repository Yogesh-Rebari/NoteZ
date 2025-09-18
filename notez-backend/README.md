# NoteZ Backend API

A comprehensive Node.js backend for NoteZ - an advanced group-based notes application with AI chatbot integration and real-time features.

## 🚀 Features

### Core Features
- **User Authentication & Authorization** - JWT-based authentication with role-based permissions
- **Group Management** - Create, join, and manage groups with nested sub-groups
- **Note Management** - Rich note creation, editing, and organization with categories and tags
- **Real-time Chat** - Socket.io powered group chat with reactions and typing indicators
- **AI Integration** - OpenAI-powered study assistant with multiple personalities
- **File Uploads** - Secure file upload with image processing and document support
- **Notifications** - Real-time notification system with multiple delivery methods
- **Advanced Permissions** - Granular role-based permissions for groups and notes

### Advanced Features
- **Nested Groups** - Support for up to 5 levels of group nesting
- **AI Study Assistant** - Personalized AI chatbot with different personalities
- **Real-time Collaboration** - Live chat, typing indicators, and presence
- **Smart Notifications** - Context-aware notifications with action buttons
- **File Processing** - Automatic image resizing and thumbnail generation
- **Search & Filtering** - Full-text search across notes and messages
- **Analytics** - Usage statistics and engagement metrics

## 🛠 Tech Stack

- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt password hashing
- **Real-time**: Socket.io
- **AI**: OpenAI GPT-3.5-turbo
- **File Processing**: Sharp, Multer
- **Security**: Helmet, CORS, Rate limiting, Input sanitization
- **Testing**: Jest, Supertest
- **Documentation**: JSDoc

## 📁 Project Structure

```
notez-backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.js   # Database connection
│   │   ├── index.js      # App configuration
│   │   └── socket.js     # Socket.io setup
│   ├── controllers/      # Route controllers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── groupController.js
│   │   ├── noteController.js
│   │   ├── chatController.js
│   │   ├── aiController.js
│   │   ├── notificationController.js
│   │   └── uploadController.js
│   ├── middleware/       # Custom middleware
│   │   ├── auth.js       # Authentication middleware
│   │   ├── permissions.js # Permission checking
│   │   ├── validation.js  # Input validation
│   │   └── errorHandler.js # Error handling
│   ├── models/          # Mongoose models
│   │   ├── User.js
│   │   ├── Group.js
│   │   ├── Note.js
│   │   ├── ChatMessage.js
│   │   └── Notification.js
│   ├── routes/          # API routes
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── groups.js
│   │   ├── notes.js
│   │   ├── chat.js
│   │   ├── ai.js
│   │   ├── notifications.js
│   │   └── uploads.js
│   ├── services/        # Business logic services
│   │   ├── aiService.js
│   │   └── uploadService.js
│   ├── utils/           # Utility functions
│   │   ├── helpers.js
│   │   └── jwt.js
│   ├── tests/           # Test files
│   │   ├── auth.test.js
│   │   ├── groups.test.js
│   │   └── notes.test.js
│   └── app.js           # Main application file
├── uploads/             # File upload directory
├── .env.example         # Environment variables template
├── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- MongoDB 4.4+
- OpenAI API key (optional, for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd notez-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

### Environment Variables

Create a `.env` file with the following variables:

```env
# Application
NODE_ENV=development
PORT=3001

# Database
MONGODB_URI=mongodb://localhost:27017/notez

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=12
CORS_ORIGIN=http://localhost:3000

# AI (Optional)
OPENAI_API_KEY=your-openai-api-key

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "identifier": "john@example.com",
  "password": "SecurePass123!"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Group Endpoints

#### Create Group
```http
POST /api/groups
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Study Group",
  "description": "Advanced Mathematics Study Group",
  "category": "academic",
  "tags": ["math", "calculus"],
  "settings": {
    "isPublic": false,
    "allowMemberInvites": true,
    "requireApproval": false
  }
}
```

#### Get User Groups
```http
GET /api/groups/my-groups
Authorization: Bearer <token>
```

#### Invite User to Group
```http
POST /api/groups/:groupId/invite
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "role": "member"
}
```

### Note Endpoints

#### Create Note
```http
POST /api/notes/groups/:groupId
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Calculus Derivatives",
  "content": "The derivative of a function...",
  "category": "lecture",
  "tags": ["calculus", "derivatives"],
  "priority": "high"
}
```

#### Get Group Notes
```http
GET /api/notes/groups/:groupId
Authorization: Bearer <token>
```

#### Like Note
```http
POST /api/notes/:noteId/like
Authorization: Bearer <token>
```

### Chat Endpoints

#### Send Message
```http
POST /api/chat/:groupId/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Hello everyone!",
  "type": "text"
}
```

#### Get Group Messages
```http
GET /api/chat/:groupId/messages?limit=50&skip=0
Authorization: Bearer <token>
```

### AI Endpoints

#### AI Chat
```http
POST /api/ai/chat/:groupId
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Can you summarize the recent notes?",
  "personality": "helpful",
  "studyMode": true
}
```

#### Generate Note Summary
```http
POST /api/ai/summary/:noteId
Authorization: Bearer <token>
```

#### Generate Quiz Questions
```http
POST /api/ai/quiz/:noteId
Authorization: Bearer <token>
Content-Type: application/json

{
  "difficulty": "medium",
  "count": 5
}
```

### File Upload Endpoints

#### Upload Images
```http
POST /api/uploads/images
Authorization: Bearer <token>
Content-Type: multipart/form-data

files: [image files]
```

#### Upload Documents
```http
POST /api/uploads/documents
Authorization: Bearer <token>
Content-Type: multipart/form-data

files: [document files]
```

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with configurable rounds
- **Input Validation** - Comprehensive input sanitization
- **Rate Limiting** - API rate limiting to prevent abuse
- **CORS Protection** - Configurable CORS policies
- **Helmet Security** - Security headers and XSS protection
- **File Upload Security** - File type validation and size limits
- **MongoDB Injection Protection** - NoSQL injection prevention

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure
- **Unit Tests** - Individual function and method testing
- **Integration Tests** - API endpoint testing with database
- **Authentication Tests** - Login, registration, and token validation
- **Permission Tests** - Role-based access control testing

## 🚀 Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set secure JWT secret
4. Configure CORS for production domain
5. Set up file storage (local or cloud)

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

### Heroku Deployment
```bash
# Install Heroku CLI
heroku create notez-backend
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret
git push heroku main
```

## 📊 Monitoring & Logging

- **Morgan Logging** - HTTP request logging
- **Error Tracking** - Comprehensive error handling and logging
- **Performance Monitoring** - Request timing and database query optimization
- **Health Checks** - `/health` endpoint for monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write tests for new features
- Update documentation
- Follow conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API examples

## 🔄 Version History

- **v1.0.0** - Initial release with core features
- **v1.1.0** - Added AI chatbot integration
- **v1.2.0** - Real-time chat and notifications
- **v1.3.0** - File upload and advanced permissions
- **v1.4.0** - Nested groups and enhanced UI

---

Built with ❤️ for students and educators worldwide.