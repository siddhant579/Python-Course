const { fail } = require('../utils/apiResponse');

function notFound(req, res, next) {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

// Centralized error handler - every thrown ApiError / mongoose error lands here
// so every API response follows the { success: false, message } envelope.
function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let message = err.message || 'Something went wrong';
  let errors;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => e.message);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `${field} already exists` : 'Duplicate value';
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    status = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  return fail(res, message, status, errors);
}

module.exports = { notFound, errorHandler };
