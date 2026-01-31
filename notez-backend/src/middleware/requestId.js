const { v4: uuidv4 } = require('uuid');

/**
 * Request ID middleware
 * Adds a unique request ID to each request for tracing
 */
const requestIdMiddleware = (req, res, next) => {
  // Generate or use existing request ID
  req.id = req.headers['x-request-id'] || uuidv4();
  
  // Add request ID to response headers
  res.setHeader('X-Request-ID', req.id);
  
  // Add request ID to response locals for logging
  res.locals.requestId = req.id;
  
  next();
};

module.exports = requestIdMiddleware;

