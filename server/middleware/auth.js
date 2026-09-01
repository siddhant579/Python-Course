const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

// Verifies the JWT and attaches req.user. Every admin-only route also runs `authorize`.
const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    throw new ApiError('Not authorized, no token provided', 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new ApiError('Not authorized, token invalid or expired', 401);
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    throw new ApiError('Not authorized, user no longer exists', 401);
  }

  req.user = user;
  next();
});

// Role gate - use after `protect`. e.g. authorize('admin')
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    throw new ApiError('Forbidden: insufficient permissions', 403);
  }
  next();
};

// For public read endpoints that vary output by role (e.g. hide unpublished
// content from guests/students, show everything to admins) without forcing
// a login. Never throws - just attaches req.user when a valid token exists.
const attachUserIfPresent = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user && user.isActive) req.user = user;
    } catch (err) {
      // invalid/expired token on an optional route - just proceed as a guest
    }
  }
  next();
});

module.exports = { protect, authorize, attachUserIfPresent };
