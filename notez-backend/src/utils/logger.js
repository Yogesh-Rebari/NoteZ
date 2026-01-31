const config = require('../config');

/**
 * Production-ready logging utility
 * Provides structured logging with different log levels
 */
class Logger {
  constructor() {
    this.logLevel = config.logging.level || 'info';
    this.logLevels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
  }

  /**
   * Check if log level should be logged
   */
  shouldLog(level) {
    return this.logLevels[level] <= this.logLevels[this.logLevel];
  }

  /**
   * Format log message
   */
  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...meta
    };

    if (config.env === 'production') {
      return JSON.stringify(logEntry);
    }

    // Pretty print for development
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : ''}`;
  }

  /**
   * Log error
   */
  error(message, error = null, meta = {}) {
    if (!this.shouldLog('error')) return;

    const errorMeta = {
      ...meta,
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: config.env === 'development' ? error.stack : undefined
        }
      })
    };

    console.error(this.formatMessage('error', message, errorMeta));
  }

  /**
   * Log warning
   */
  warn(message, meta = {}) {
    if (!this.shouldLog('warn')) return;
    console.warn(this.formatMessage('warn', message, meta));
  }

  /**
   * Log info
   */
  info(message, meta = {}) {
    if (!this.shouldLog('info')) return;
    console.log(this.formatMessage('info', message, meta));
  }

  /**
   * Log debug
   */
  debug(message, meta = {}) {
    if (!this.shouldLog('debug')) return;
    console.debug(this.formatMessage('debug', message, meta));
  }

  /**
   * Log HTTP request
   */
  http(req, res, responseTime) {
    if (!this.shouldLog('info')) return;

    const meta = {
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent')
    };

    const level = res.statusCode >= 400 ? 'warn' : 'info';
    this[level](`${req.method} ${req.originalUrl || req.url} ${res.statusCode}`, meta);
  }
}

module.exports = new Logger();

