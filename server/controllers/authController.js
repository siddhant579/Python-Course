const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/apiResponse');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError('Name, email and password are required', 400);
  }
  if (password.length < 6) {
    throw new ApiError('Password must be at least 6 characters', 400);
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new ApiError('An account with this email already exists', 409);

  // Public registration always creates students. Admin accounts are created
  // via the seed script or promoted by an existing admin.
  const user = await User.create({ name, email, password, role: 'student' });

  const token = generateToken(user);
  return success(res, { user: user.toSafeObject(), token }, 201);
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError('Email and password are required', 400);

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError('Invalid email or password', 401);
  }
  if (!user.isActive) throw new ApiError('This account has been disabled', 403);

  user.lastLoginAt = new Date();
  await user.save();

  const token = generateToken(user);
  return success(res, { user: user.toSafeObject(), token });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  return success(res, { user: req.user.toSafeObject() });
});

// PUT /api/auth/me
const updateMe = asyncHandler(async (req, res) => {
  const { name, avatarUrl } = req.body;
  if (name) req.user.name = name;
  if (avatarUrl !== undefined) req.user.avatarUrl = avatarUrl;
  await req.user.save();
  return success(res, { user: req.user.toSafeObject() });
});

// PUT /api/auth/password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw new ApiError('currentPassword and newPassword are required', 400);
  }
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError('Current password is incorrect', 401);
  }
  user.password = newPassword;
  await user.save();
  return success(res, { updated: true });
});

module.exports = { register, login, getMe, updateMe, changePassword };
