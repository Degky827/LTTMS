const logger = require('../utils/logger');

const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
    requestId: req.requestId
  });
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  logger.error(
    {
      err: err.message,
      stack: err.stack,
      requestId: req.requestId,
      path: req.originalUrl
    },
    'Unhandled error'
  );

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server Error',
    requestId: req.requestId
  });
};

module.exports = { notFound, errorHandler };
