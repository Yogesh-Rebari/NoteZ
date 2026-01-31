const mongoose = require('mongoose');
const { AppError } = require('../utils/helpers');

/**
 * Middleware to check if database is connected
 * Returns error if database is not connected
 */
const checkDatabase = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return next(new AppError(
      'Database is not connected. Please check your MongoDB connection.',
      503
    ));
  }
  next();
};

module.exports = checkDatabase;

