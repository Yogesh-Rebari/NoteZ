const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * JWT utility functions
 */
class JWTUtils {
  /**
   * Generate access token
   */
  generateToken(userId) {
    return jwt.sign(
      { id: userId },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }

  /**
   * Generate refresh token
   */
  generateRefreshToken(userId) {
    return jwt.sign(
      { id: userId, type: 'refresh' },
      config.jwt.secret,
      { expiresIn: config.jwt.refreshExpiresIn }
    );
  }

  /**
   * Verify token
   */
  verifyToken(token) {
    return jwt.verify(token, config.jwt.secret);
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token) {
    const decoded = jwt.verify(token, config.jwt.secret);
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    return decoded;
  }

  /**
   * Decode token without verification
   */
  decodeToken(token) {
    return jwt.decode(token);
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token) {
    try {
      const decoded = this.decodeToken(token);
      return decoded.exp < Date.now() / 1000;
    } catch (error) {
      return true;
    }
  }

  /**
   * Get token expiration time
   */
  getTokenExpiration(token) {
    try {
      const decoded = this.decodeToken(token);
      return new Date(decoded.exp * 1000);
    } catch (error) {
      return null;
    }
  }
}

module.exports = new JWTUtils();