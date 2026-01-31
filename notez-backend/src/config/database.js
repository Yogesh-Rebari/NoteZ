const mongoose = require('mongoose');
const config = require('./index');

// Set global mongoose options BEFORE any models are loaded
// `bufferMaxEntries` was removed in newer mongoose versions; avoid setting it.
mongoose.set('bufferCommands', true);

/**
 * Database connection configuration
 */
class DatabaseConnection {
  constructor() {
    this.connection = null;
  }

  /**
   * Connect to MongoDB
   */
  async connect() {
    try {
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 10000, // Keep trying to send operations for 10 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  bufferCommands: true, // Enable buffering so commands wait for connection
      };

      this.connection = await mongoose.connect(config.database.uri, options);

      console.log(`✅ MongoDB connected: ${this.connection.connection.host}`);

      // Handle connection events
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconnected');
      });

      // Graceful shutdown
      process.on('SIGINT', () => {
        this.close();
      });

      return this.connection;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      console.error('');
      console.error('⚠️  MongoDB Connection Error!');
      console.error('   Attempting to reconnect in background...');
      console.error('');
      console.error('💡 Solutions:');
      console.error('   1. Use MongoDB Atlas (free): https://www.mongodb.com/cloud/atlas');
      console.error('   2. Install local MongoDB: https://www.mongodb.com/try/download/community');
      console.error('   3. Update MONGODB_URI in notez-backend/.env');
      console.error('');
      console.error('📝 Current MONGODB_URI:', config.database.uri);
      console.error('');
      
      // Try to reconnect in background (for development)
      if (config.env !== 'production') {
        console.error('⏳ Server will start. Database operations will be queued.');
        console.error('   MongoDB will reconnect automatically when available.');
        console.error('');
        
        // Set up automatic reconnection
        mongoose.connection.on('connected', () => {
          console.log('✅ MongoDB reconnected successfully!');
        });
        
        // Try to connect in background (non-blocking) with buffering enabled
        mongoose.connect(config.database.uri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          bufferCommands: true,
          serverSelectionTimeoutMS: 10000,
        }).catch(() => {
          // Connection will retry automatically
        });
      } else {
        // In production, exit if database connection fails
        process.exit(1);
      }
      
      return null;
    }
  }

  /**
   * Close database connection
   */
  async close() {
    if (this.connection) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      connected: mongoose.connection.readyState === 1,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name
    };
  }
}

module.exports = new DatabaseConnection();