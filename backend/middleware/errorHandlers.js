const logger = require('../utils/logger');
const { config } = require('../config/env');
const { AppError } = require('../shared/errors/AppError');

const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    requestId: req.requestId || req.id
  });
};

const errorHandler = (err, req, res, next) => {
  let error = err;
  const requestId = req.requestId || req.id;

  // Handle Mongoose bad ObjectId / CastError
  if (err.name === 'CastError') {
    const message = `Invalid resource identifier: ${err.value}`;
    error = new AppError(message, 400);
  }

  // Handle Mongoose duplicate key error (11000)
  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue || {});
    const fieldName = fields.length > 0 ? fields.join(', ') : 'field';
    const message = `Duplicate value entered for ${fieldName}. Please choose another value.`;
    error = new AppError(message, 409);
  }

  // Handle Mongoose schema validation error
  if (err.name === 'ValidationError' && !err.isOperational) {
    const errors = Object.values(err.errors || {}).map(val => ({
      field: val.path,
      message: val.message
    }));
    error = new AppError('Database validation failed', 400, errors);
  }

  // Handle Zod validation error
  if (err.name === 'ZodError' || Array.isArray(err.issues)) {
    const errors = (err.issues || []).map(issue => ({
      field: issue.path.join('.'),
      message: issue.message
    }));
    error = new AppError('Validation failed', 400, errors);
  }

  // Handle JWT invalid signature error
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid authentication token. Please log in again.', 401);
  }

  // Handle JWT expired token error
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Authentication token has expired. Please log in again.', 401);
  }

  const statusCode = error.statusCode || 500;
  const isOperational = error.isOperational || false;

  // Log error with request context
  if (statusCode >= 500) {
    logger.error(
      {
        err: error.message,
        stack: error.stack,
        requestId,
        path: req.originalUrl,
        method: req.method
      },
      'Unhandled internal server error'
    );
  } else {
    logger.warn(
      {
        err: error.message,
        statusCode,
        requestId,
        path: req.originalUrl,
        method: req.method
      },
      'Operational request error'
    );
  }

  // Format response payload
  const response = {
    success: false,
    message: isOperational || !config.isProduction ? error.message : 'An unexpected internal server error occurred',
    requestId
  };

  if (error.errors) {
    response.errors = error.errors;
  }

  if (!config.isProduction && error.stack && statusCode >= 500) {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = {
  notFound,
  errorHandler
};
