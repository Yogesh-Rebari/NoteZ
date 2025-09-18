const mongoose = require('mongoose');
const config = require('./index');

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
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        bufferCommands: false, // Disable mongoose buffering
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
      console.error('Database connection failed:', error.message);
      process.exit(1);
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