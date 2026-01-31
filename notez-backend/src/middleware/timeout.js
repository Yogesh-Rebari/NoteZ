/**
 * Request timeout middleware
 * Prevents requests from hanging indefinitely
 */
const timeout = (ms = 30000) => {
  return (req, res, next) => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          status: 'error',
          message: 'Request timeout. Please try again.'
        });
      }
    }, ms);

    // Clear timeout when response is sent
    res.on('finish', () => {
      clearTimeout(timer);
    });

    next();
  };
};

module.exports = timeout;

