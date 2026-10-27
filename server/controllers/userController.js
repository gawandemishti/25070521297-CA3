const User = require('../models/User');
const Connection = require('../models/Connection');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * @route   GET /api/users/me
 * @desc    Get currently logged in user profile
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('college');
    return sendSuccess(res, 200, 'Profile retrieved', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/users/me
 * @desc    Update current user's profile details
 * @access  Private
 */
const updateMe = async (req, res, next) => {
  try {
    const { name, bio, department, year, skills, interests, profileImage } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    if (name) user.name = name.trim();
    if (bio !== undefined) user.bio = bio;
    if (department !== undefined) user.department = department;
    if (year !== undefined) user.year = year;
    if (profileImage !== undefined) user.profileImage = profileImage;

    if (skills !== undefined) {
      user.skills = Array.isArray(skills)
        ? skills
        : typeof skills === 'string'
        ? skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
    }

    if (interests !== undefined) {
      user.interests = Array.isArray(interests)
        ? interests
        : typeof interests === 'string'
        ? interests.split(',').map((i) => i.trim()).filter(Boolean)
        : [];
    }

    await user.save();
    const updatedUser = await User.findById(user._id).populate('college');

    return sendSuccess(res, 200, 'Profile updated successfully', { user: updatedUser });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/users
 * @desc    Search and browse student profiles for networking / teammate finding
 * @access  Public / Private
 */
const getUsers = async (req, res, next) => {
  try {
    const { search, skill, college, department, page = 1, limit = 12 } = req.query;

    const query = { isActive: true, role: 'student' };

    // If searching keyword
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } },
        { interests: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by specific skill
    if (skill) {
      query.skills = { $regex: skill, $options: 'i' };
    }

    // Filter by college
    if (college) {
      query.college = college;
    }

    // Filter by department
    if (department) {
      query.department = { $regex: department, $options: 'i' };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-passwordHash')
        .populate('college', 'name city state logo verificationStatus')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(query),
    ]);

    return sendSuccess(
      res,
      200,
      'Students retrieved successfully',
      { users },
      {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/users/:id
 * @desc    Get user public profile
 * @access  Public
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-passwordHash')
      .populate('college', 'name city state logo verificationStatus website');

    if (!user) {
      return sendError(res, 404, 'User profile not found.');
    }

    return sendSuccess(res, 200, 'User profile retrieved', { user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMe,
  updateMe,
  getUsers,
  getUserById,
};

