const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes per IP for auth routes
  message: 'Too many login attempts from this IP, please try again after 15 minutes',
});

const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // 1000 requests per hour per IP for general API routes
  message: 'Too many requests from this IP, please try again after an hour',
});

module.exports = {
  authLimiter,
  apiLimiter,
};