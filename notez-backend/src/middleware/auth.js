const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('../utils/helpers');
const config = require('../config');

/**
 * Authentication middleware
 */
class AuthMiddleware {
  /**
   * Protect routes - require authentication
   */
  protect = async (req, res, next) => {
    try {
      // 1) Get token from header
      let token;
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      }

      if (!token) {
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
      }

      // 2) Verify token
      const decoded = jwt.verify(token, config.jwt.secret);

      // 3) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next(new AppError('The user belonging to this token does no longer exist.', 401));
      }

      // 4) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password! Please log in again.', 401));
      }

      // 5) Check if user is active
      if (!currentUser.isActive) {
        return next(new AppError('Your account has been deactivated. Please contact support.', 401));
      }

      // Grant access to protected route
      req.user = currentUser;
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return next(new AppError('Invalid token. Please log in again!', 401));
      }
      if (error.name === 'TokenExpiredError') {
        return next(new AppError('Your token has expired! Please log in again.', 401));
      }
      next(error);
    }
  };

  /**
   * Restrict to certain roles
   */
  restrictTo = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return next(new AppError('You do not have permission to perform this action', 403));
      }
      next();
    };
  };

  /**
   * Optional authentication - doesn't fail if no token
   */
  optionalAuth = async (req, res, next) => {
    try {
      let token;
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      }

      if (token) {
        const decoded = jwt.verify(token, config.jwt.secret);
        const currentUser = await User.findById(decoded.id);
        
        if (currentUser && currentUser.isActive) {
          req.user = currentUser;
        }
      }
      
      next();
    } catch (error) {
      // Continue without authentication
      next();
    }
  };

  /**
   * Check if user owns resource
   */
  checkOwnership = (resourceUserIdField = 'userId') => {
    return (req, res, next) => {
      const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
      
      if (req.user._id.toString() !== resourceUserId.toString()) {
        return next(new AppError('You can only access your own resources', 403));
      }
      
      next();
    };
  };

  /**
   * Check if user is admin
   */
  requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
      return next(new AppError('Admin access required', 403));
    }
    next();
  };

  /**
   * Check if user is verified
   */
  requireVerified = (req, res, next) => {
    if (!req.user.isEmailVerified) {
      return next(new AppError('Please verify your email address to access this feature', 403));
    }
    next();
  };
}

module.exports = new AuthMiddleware();