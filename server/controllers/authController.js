const jwt = require('jsonwebtoken');
const User = require('../models/User');
const College = require('../models/College');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// Helper to sign JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_campusconnect', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new student account
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, collegeId, department, year, skills, interests } = req.body;

    // Basic validation
    if (!name || !email || !password || !collegeId) {
      return sendError(res, 400, 'Please provide name, email, password, and select your college.');
    }

    if (password.length < 6) {
      return sendError(res, 400, 'Password must be at least 6 characters long.');
    }

    if (confirmPassword && password !== confirmPassword) {
      return sendError(res, 400, 'Passwords do not match.');
    }

    // Check existing email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return sendError(res, 409, 'An account with this email address already exists.');
    }

    // Verify college exists
    const college = await College.findById(collegeId);
    if (!college) {
      return sendError(res, 404, 'Selected college not found. Please choose an approved college from the directory.');
    }

    if (college.verificationStatus === 'suspended') {
      return sendError(res, 400, 'Selected college account is currently suspended. Registrations are temporarily disabled.');
    }

    // Hash password securely
    const passwordHash = await User.hashPassword(password);

    // Parse skills & interests (support comma strings or arrays)
    const parsedSkills = Array.isArray(skills)
      ? skills
      : typeof skills === 'string' && skills.trim()
      ? skills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const parsedInterests = Array.isArray(interests)
      ? interests
      : typeof interests === 'string' && interests.trim()
      ? interests.split(',').map((i) => i.trim()).filter(Boolean)
      : [];

    // STRICT SECURITY: Always enforce student role on public registration endpoint
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: 'student',
      college: college._id,
      department: department || '',
      year: year || '',
      skills: parsedSkills,
      interests: parsedInterests,
    });

    const populatedUser = await User.findById(newUser._id).populate('college', 'name city state logo verificationStatus');
    const token = signToken(newUser._id);

    return sendSuccess(
      res,
      201,
      'Registration successful! Welcome to CampusConnect.',
      {
        user: populatedUser,
        token,
      }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return JWT
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, 'Please provide both email and password.');
    }

    // Query user and explicitly select passwordHash
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+passwordHash')
      .populate('college', 'name city state logo verificationStatus');

    if (!user) {
      return sendError(res, 401, 'Invalid email or password.');
    }

    if (!user.isActive) {
      return sendError(res, 403, 'Your account is deactivated. Please contact platform administrators.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid email or password.');
    }

    const token = signToken(user._id);

    return sendSuccess(res, 200, 'Login successful!', {
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get currently authenticated user
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    return sendSuccess(res, 200, 'Current user profile retrieved', {
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/auth/change-password
 * @desc    Change password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendError(res, 400, 'Please provide both current and new passwords.');
    }

    if (newPassword.length < 6) {
      return sendError(res, 400, 'New password must be at least 6 characters.');
    }

    const user = await User.findById(req.user._id).select('+passwordHash');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return sendError(res, 400, 'Current password does not match our records.');
    }

    user.passwordHash = await User.hashPassword(newPassword);
    await user.save();

    return sendSuccess(res, 200, 'Password updated successfully!');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Public
 */
const logout = async (req, res) => {
  return sendSuccess(res, 200, 'Logged out successfully');
};

module.exports = {
  register,
  login,
  getMe,
  changePassword,
  logout,
};

