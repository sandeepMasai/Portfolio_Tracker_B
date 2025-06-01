const logger = require('../utils/logger');
const createHttpError = require('http-errors');

const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || []; // For validation errors from express-validator or other sources

  // Handle errors from express-validator specifically
  // When validationResult(req) is not empty, it throws an http-error with an 'errors' array
  if (err.errors && Array.isArray(err.errors) && err.errors.length > 0) {
    statusCode = err.statusCode || 400; // Default to 400 for validation errors
    // Concatenate all validation error messages into the main message
    message = err.errors.map(error => error.msg).join(', ');
  }
  // Mongoose bad ObjectId
  else if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = `Resource not found with id of ${err.value}`;
  }
  // Mongoose duplicate key
  else if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate field value: ${field} must be unique`;
  }
  // Mongoose validation error (from model schema validation)
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }
  // JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired. Please log in again.';
  }

  // Log the error
  logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  if (err.stack) {
    logger.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message: message,
    // Only include the detailed errors array if it's explicitly present and not empty
    errors: (err.errors && Array.isArray(err.errors) && err.errors.length > 0) ? err.errors : undefined,
  });
};

module.exports = errorMiddleware;