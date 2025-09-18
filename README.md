# NoteZ - Advanced Group-Based Notes Application

A comprehensive full-stack web application for sharing and managing notes in groups and sub-groups, designed specifically for students. Features WhatsApp-style group navigation, Instagram-like note cards, real-time chat, AI study assistant, and advanced collaboration tools.

## 🌟 Features

### 🎯 Core Features
- **Group Management** - Create, join, and manage study groups with nested sub-groups
- **Rich Note Creation** - Create, edit, and organize notes with categories, tags, and priorities
- **Real-time Chat** - Group chat with reactions, typing indicators, and message threading
- **AI Study Assistant** - Personalized AI chatbot with multiple personalities for study help
- **File Sharing** - Secure file uploads with image processing and document support
- **Smart Notifications** - Real-time notifications with action buttons and delivery preferences
- **Advanced Search** - Full-text search across notes, messages, and groups
- **Collaboration Tools** - Note sharing, commenting, and collaborative editing

### 🚀 Advanced Features
- **Nested Groups** - Support for up to 5 levels of group nesting
- **Role-based Permissions** - Granular permissions for admins, moderators, and members
- **AI-Powered Features** - Note summarization, quiz generation, and study suggestions
- **Real-time Collaboration** - Live presence indicators and collaborative editing
- **Mobile Responsive** - Optimized for desktop, tablet, and mobile devices
- **Accessibility** - ARIA labels, keyboard navigation, and screen reader support
- **Dark Mode** - Theme switching with user preferences
- **Offline Support** - Progressive Web App capabilities

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **React Router** - Client-side routing and navigation
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client for API requests
- **Lucide React** - Beautiful icon library
- **Context API** - State management for authentication and app state

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **Socket.io** - Real-time bidirectional communication
- **JWT** - JSON Web Tokens for authentication
- **OpenAI API** - AI-powered study assistant
- **Multer** - File upload handling
- **Sharp** - Image processing
- **Jest** - Testing framework

See detailed API docs in `docs/API.md`.

## 📁 Project Structure

```
NoteZ/
├── src/                          # Frontend React application
│   ├── components/               # Reusable UI components
│   │   ├── Auth/                # Authentication components
│   │   ├── Chat/                # Chat interface components
│   │   ├── AI/                  # AI chatbot components
│   │   ├── common/              # Common UI components
│   │   ├── Layout/              # Layout components
│   │   ├── Notifications/       # Notification components
│   │   ├── Sidebar/             # Navigation sidebar
│   │   ├── GroupList/           # Group management
│   │   └── NoteCard/            # Note display components
│   ├── contexts/                # React contexts
│   ├── hooks/                   # Custom React hooks
│   ├── pages/                   # Page components
│   ├── utils/                   # Utility functions
│   └── constants/               # Application constants
├── notez-backend/               # Backend Node.js application
│   ├── src/
│   │   ├── config/              # Configuration files
│   │   ├── controllers/         # Route controllers
│   │   ├── middleware/          # Custom middleware
│   │   ├── models/              # Database models
│   │   ├── routes/              # API routes
│   │   ├── services/            # Business logic services
│   │   ├── utils/               # Utility functions
│   │   └── tests/               # Test files
│   └── uploads/                 # File upload directory
├── public/                      # Static assets
└── docs/                        # Documentation
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
   cd NoteZ
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd notez-backend
   npm install
   cd ..
   ```

4. **Environment setup**
   ```bash
   # Backend environment
   cd notez-backend
   cp env.example .env
   # Edit .env with your configuration
   cd ..
   ```

5. **Start the applications**
   ```bash
   # Start backend (in one terminal)
   cd notez-backend
   npm run dev
   
   # Start frontend (in another terminal)
   npm start
   ```

### Environment Variables

Create `notez-backend/.env` with:

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

## 📱 User Guide

### Getting Started

1. **Register an Account**
   - Visit the registration page
   - Enter your username, email, and password
   - Verify your email address

2. **Create Your First Group**
   - Click "Create Group" on the home page
   - Enter group name, description, and category
   - Set privacy and invitation preferences
   - Invite members via email

3. **Add Notes**
   - Navigate to your group
   - Click "Create Note"
   - Add title, content, and tags
   - Choose category and priority level
   - Attach files if needed

4. **Use the Chat**
   - Open the chat panel in your group
   - Send messages, reactions, and polls
   - See who's online and typing

5. **Get AI Help**
   - Open the AI assistant panel
   - Ask questions about your notes
   - Request summaries and quiz questions
   - Choose from different AI personalities

### Advanced Features

#### Group Management
- **Nested Groups**: Create sub-groups within main groups
- **Permissions**: Set different roles (admin, moderator, member)
- **Invitations**: Invite users via email with custom roles
- **Settings**: Configure group privacy and features

#### Note Organization
- **Categories**: Organize notes by type (lecture, assignment, etc.)
- **Tags**: Add custom tags for better organization
- **Priority**: Mark notes as low, medium, high, or urgent
- **Collaboration**: Share notes with specific users
- **Version History**: Track changes and revert if needed

#### AI Assistant
- **Personalities**: Choose from helpful, casual, professional, or creative
- **Study Mode**: Get detailed explanations and study tips
- **Summarization**: Auto-generate note summaries
- **Quiz Generation**: Create practice questions from your notes
- **Improvement Suggestions**: Get tips for better note organization

## 🔧 Development

### Frontend Development
```bash
# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build

# Lint code
npm run lint
npm run lint:fix
```

### Backend Development
```bash
cd notez-backend

# Start development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint
npm run lint:fix
```

### Code Style
- ESLint configuration for consistent code style
- Prettier for code formatting
- Conventional commit messages
- Comprehensive JSDoc comments

## 🧪 Testing

### Frontend Tests
- Component unit tests with React Testing Library
- Integration tests for user workflows
- Accessibility tests with jest-axe
- Visual regression tests

### Backend Tests
- Unit tests for individual functions
- Integration tests for API endpoints
- Authentication and authorization tests
- Database interaction tests

Run all tests:
```bash
# Frontend tests
npm test

# Backend tests
cd notez-backend
npm test
```

## 🚀 Deployment

### Frontend Deployment
```bash
# Build the application
npm run build

# Deploy to Vercel/Netlify
# The build folder contains the production build
```

### Backend Deployment
```bash
cd notez-backend

# Set production environment variables
export NODE_ENV=production
export MONGODB_URI=your-production-mongodb-uri
export JWT_SECRET=your-production-jwt-secret

# Start the server
npm start
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 📊 Features Overview

### User Management
- ✅ User registration and authentication
- ✅ Profile management with preferences
- ✅ Password reset and email verification
- ✅ User activity tracking

### Group Features
- ✅ Group creation and management
- ✅ Nested sub-groups (up to 5 levels)
- ✅ Role-based permissions (admin, moderator, member)
- ✅ Group invitations and member management
- ✅ Public and private groups

### Note Management
- ✅ Rich note creation and editing
- ✅ Categories and tags organization
- ✅ Priority levels and status tracking
- ✅ File attachments and image processing
- ✅ Note sharing and collaboration
- ✅ Version history and change tracking

### Real-time Features
- ✅ Group chat with Socket.io
- ✅ Typing indicators and presence
- ✅ Message reactions and threading
- ✅ Real-time notifications
- ✅ Live collaboration indicators

### AI Integration
- ✅ OpenAI-powered study assistant
- ✅ Multiple AI personalities
- ✅ Note summarization
- ✅ Quiz question generation
- ✅ Study suggestions and tips
- ✅ Keyword extraction and sentiment analysis

### File Management
- ✅ Secure file uploads
- ✅ Image processing and thumbnails
- ✅ Document support (PDF, Word, etc.)
- ✅ File type validation and size limits
- ✅ Organized file storage

### Security
- ✅ JWT authentication
- ✅ Password hashing with bcrypt
- ✅ Input validation and sanitization
- ✅ Rate limiting and CORS protection
- ✅ XSS and injection prevention
- ✅ Secure file upload handling

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 [Documentation](docs/)
- 🐛 [Report Issues](https://github.com/your-repo/issues)
- 💬 [Discussions](https://github.com/your-repo/discussions)
- 📧 [Email Support](mailto:support@notez.com)

## 🙏 Acknowledgments

- OpenAI for the AI API
- MongoDB for the database
- React and Node.js communities
- All contributors and users

---

**NoteZ** - Empowering students with collaborative note-taking and AI-powered study assistance. Built with ❤️ for the education community.