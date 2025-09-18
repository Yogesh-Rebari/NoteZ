const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Import configurations
require('dotenv').config();
const connectDB = require('./config/database');
const config = require('./config');

// Import middleware
const { handleApiError } = require('./utils/helpers');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const groupRoutes = require('./routes/groups');
const noteRoutes = require('./routes/notes');
const chatRoutes = require('./routes/chat');
const aiRoutes = require('./routes/ai');
const notificationRoutes = require('./routes/notifications');
const uploadRoutes = require('./routes/uploads');

// Import Socket.io manager
const SocketManager = require('./config/socket');

/**
 * NoteZ Backend Application
 * Advanced group-based notes application with AI chatbot and real-time features
 */
class NoteZApp {
  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new Server(this.server, {
      cors: {
        origin: config.cors.origin,
        methods: ['GET', 'POST'],
        credentials: true
      }
    });
    
    this.socketManager = new SocketManager(this.io);
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
    this.setupGracefulShutdown();
  }

  /**
   * Setup middleware
   */
  setupMiddleware() {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    this.app.use(cors(config.cors));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: {
        status: 'error',
        message: 'Too many requests from this IP, please try again later.'
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api/', limiter);

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Compression middleware
    this.app.use(compression());

    // Logging middleware
    if (config.env === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }

    // Data sanitization against NoSQL query injection
    this.app.use(mongoSanitize());

    // Trust proxy (for rate limiting behind reverse proxy)
    this.app.set('trust proxy', 1);

    // Static files
    this.app.use('/uploads', express.static('uploads'));
  }

  /**
   * Setup routes
   */
  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'success',
        message: 'NoteZ API is running',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0'
      });
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/groups', groupRoutes);
    this.app.use('/api/notes', noteRoutes);
    this.app.use('/api/chat', chatRoutes);
    this.app.use('/api/ai', aiRoutes);
    this.app.use('/api/notifications', notificationRoutes);
    this.app.use('/api/uploads', uploadRoutes);

    // 404 handler
    this.app.all('*', (req, res, next) => {
      next(new Error(`Can't find ${req.originalUrl} on this server!`));
    });
  }

  /**
   * Setup error handling
   */
  setupErrorHandling() {
    this.app.use(handleApiError);
    this.app.use(errorHandler);
  }

  /**
   * Setup graceful shutdown
   */
  setupGracefulShutdown() {
    const gracefulShutdown = (signal) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);
      
      this.server.close(() => {
        console.log('HTTP server closed.');
        
        // Close database connection
        connectDB.close(() => {
          console.log('Database connection closed.');
          process.exit(0);
        });
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  }

  /**
   * Start the server
   */
  async start() {
    try {
      // Connect to database
      await connectDB.connect();
      console.log('✅ Database connected successfully');

      // Start server
      this.server.listen(config.server.port, () => {
        console.log(`🚀 NoteZ API server running on port ${config.server.port}`);
        console.log(`📱 Environment: ${config.env}`);
        console.log(`🔗 API URL: http://localhost:${config.server.port}/api`);
        console.log(`💬 Socket.io enabled for real-time features`);
        console.log(`🤖 AI features: ${process.env.OPENAI_API_KEY ? 'Enabled' : 'Disabled'}`);
      });

      // Handle unhandled promise rejections
      process.on('unhandledRejection', (err) => {
        console.error('Unhandled Promise Rejection:', err);
        this.server.close(() => {
          process.exit(1);
        });
      });

      // Handle uncaught exceptions
      process.on('uncaughtException', (err) => {
        console.error('Uncaught Exception:', err);
        process.exit(1);
      });

    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Create and start the application
const app = new NoteZApp();
app.start();

module.exports = app;