const College = require('../models/College');
const User = require('../models/User');
const Report = require('../models/Report');
const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * @route   GET /api/admin/colleges/pending
 * @desc    Get all colleges pending verification
 * @access  Private (Platform Admin)
 */
const getPendingColleges = async (req, res, next) => {
  try {
    const colleges = await College.find({ verificationStatus: 'pending' })
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Pending colleges retrieved', { colleges });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/admin/colleges/:id/verification
 * @desc    Approve, reject, or suspend college profile
 * @access  Private (Platform Admin)
 */
const updateCollegeVerification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    if (!['verified', 'rejected', 'suspended', 'pending'].includes(status)) {
      return sendError(res, 400, 'Invalid verification status.');
    }

    const college = await College.findById(id);
    if (!college) {
      return sendError(res, 404, 'College not found.');
    }

    college.verificationStatus = status;
    college.approvedBy = req.user._id;
    await college.save();

    // If there was a submitting user, notify them
    if (college.submittedBy) {
      await Notification.create({
        recipient: college.submittedBy,
        type: 'announcement',
        title: `College Verification Status: ${status.toUpperCase()}`,
        message: `Your college profile for "${college.name}" is now marked as ${status}.${
          remarks ? ' Notes: ' + remarks : ''
        }`,
        link: `/colleges/${college._id}`,
      });
    }

    return sendSuccess(res, 200, `College verification updated to ${status}`, { college });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with search and filter
 * @access  Private (Platform Admin)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { search, role, college, status, page = 1, limit = 20 } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role && role !== 'All') {
      query.role = role;
    }

    if (college) {
      query.college = college;
    }

    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'suspended') {
      query.isActive = false;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query)
        .populate('college', 'name city state logo verificationStatus')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(query),
    ]);

    return sendSuccess(
      res,
      200,
      'Users list retrieved',
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
 * @route   PATCH /api/admin/users/:id/status
 * @desc    Suspend or activate user account, or promote role
 * @access  Private (Platform Admin)
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive, role } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // Prevent platform admin from deactivating themselves
    if (user._id.toString() === req.user._id.toString() && isActive === false) {
      return sendError(res, 400, 'You cannot deactivate your own platform administrator account.');
    }

    if (isActive !== undefined) {
      user.isActive = Boolean(isActive);
    }

    if (role && ['student', 'organizer', 'college_admin', 'platform_admin'].includes(role)) {
      user.role = role;
    }

    await user.save();
    return sendSuccess(res, 200, 'User status updated', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/admin/reports
 * @desc    Submit content report for moderation
 * @access  Private
 */
const submitReport = async (req, res, next) => {
  try {
    const { contentType, targetId, targetTitle, reason } = req.body;

    if (!contentType || !targetId || !reason) {
      return sendError(res, 400, 'Please provide content type, target ID, and reason for report.');
    }

    const report = await Report.create({
      reporter: req.user._id,
      contentType,
      targetId,
      targetTitle: targetTitle || '',
      reason: reason.trim(),
    });

    return sendSuccess(res, 201, 'Report submitted for review. Thank you for keeping CampusConnect safe.', {
      report,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/reports
 * @desc    Get moderation reports
 * @access  Private (Platform Admin)
 */
const getReports = async (req, res, next) => {
  try {
    const { status = 'pending' } = req.query;

    const reports = await Report.find({ status })
      .populate('reporter', 'name email college')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Reports retrieved', { reports });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/admin/reports/:id
 * @desc    Resolve or dismiss moderation report
 * @access  Private (Platform Admin)
 */
const resolveReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes } = req.body;

    const report = await Report.findById(id);
    if (!report) {
      return sendError(res, 404, 'Report not found');
    }

    report.status = status || 'resolved';
    report.resolutionNotes = resolutionNotes || '';
    report.reviewedBy = req.user._id;
    await report.save();

    return sendSuccess(res, 200, 'Report updated', { report });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPendingColleges,
  updateCollegeVerification,
  getAllUsers,
  updateUserStatus,
  submitReport,
  getReports,
  resolveReport,
};

