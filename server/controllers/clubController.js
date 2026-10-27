const Club = require('../models/Club');
const ClubMembership = require('../models/ClubMembership');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * @route   GET /api/clubs
 * @desc    Get all clubs with filtering and search
 * @access  Public
 */
const getClubs = async (req, res, next) => {
  try {
    const { search, category, college, externalOnly, status = 'active', page = 1, limit = 12 } = req.query;

    const query = {};
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (college) {
      query.college = college;
    }

    if (externalOnly === 'true') {
      query.externalMembershipAllowed = true;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [clubs, total] = await Promise.all([
      Club.find(query)
        .populate('college', 'name city state logo verificationStatus')
        .populate('organizer', 'name email')
        .sort({ name: 1 })
        .skip(skip)
        .limit(limitNum),
      Club.countDocuments(query),
    ]);

    // Attach membership count for each club
    const clubIds = clubs.map((c) => c._id);
    const memberCounts = await ClubMembership.aggregate([
      { $match: { club: { $in: clubIds }, status: 'approved' } },
      { $group: { _id: '$club', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    memberCounts.forEach((m) => (countMap[m._id.toString()] = m.count));

    const enrichedClubs = clubs.map((club) => {
      const obj = club.toObject();
      obj.memberCount = (countMap[club._id.toString()] || 0) + 1; // including the organizer
      return obj;
    });

    return sendSuccess(
      res,
      200,
      'Clubs retrieved successfully',
      { clubs: enrichedClubs },
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
 * @route   GET /api/clubs/:id
 * @desc    Get single club details with user membership status and upcoming events
 * @access  Public (Optional Auth)
 */
const getClubById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let club;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      club = await Club.findById(id).populate('college').populate('organizer', 'name email department year');
    } else {
      club = await Club.findOne({ slug: id }).populate('college').populate('organizer', 'name email department year');
    }

    if (!club) {
      return sendError(res, 404, 'Club not found.');
    }

    // Get upcoming events hosted by this club
    const upcomingEvents = await Event.find({ organizingClub: club._id, status: 'published' })
      .sort({ startDate: 1 })
      .limit(5);

    // Get approved members count
    const memberCount =
      (await ClubMembership.countDocuments({ club: club._id, status: 'approved' })) + 1;

    // Check user membership status
    let userMembership = null;
    let isOrganizer = false;

    if (req.user) {
      isOrganizer = club.organizer._id.toString() === req.user._id.toString();
      userMembership = await ClubMembership.findOne({
        club: club._id,
        student: req.user._id,
      });
    }

    return sendSuccess(res, 200, 'Club details retrieved', {
      club,
      upcomingEvents,
      memberCount,
      userMembership,
      isOrganizer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/clubs
 * @desc    Create a new club
 * @access  Private (Organizer, College Admin, Platform Admin)
 */
const createClub = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      logo,
      bannerImage,
      membershipPolicy,
      externalMembershipAllowed,
      activities,
      achievements,
    } = req.body;

    if (!name || !description || !category) {
      return sendError(res, 400, 'Please provide name, description, and category for the club.');
    }

    let collegeId = req.user.college;
    if (req.user.role === 'platform_admin' && req.body.college) {
      collegeId = req.body.college;
    }

    if (!collegeId) {
      return sendError(res, 400, 'User must belong to a college to create a club.');
    }

    const club = await Club.create({
      name: name.trim(),
      description,
      category,
      logo: logo || '',
      bannerImage: bannerImage || '',
      college: collegeId,
      organizer: req.user._id,
      membershipPolicy: membershipPolicy || 'Open to all interested students.',
      externalMembershipAllowed: externalMembershipAllowed !== undefined ? externalMembershipAllowed : true,
      status: req.user.role === 'platform_admin' || req.user.role === 'college_admin' ? 'active' : 'active',
      activities: Array.isArray(activities) ? activities : [],
      achievements: Array.isArray(achievements) ? achievements : [],
    });

    const populatedClub = await Club.findById(club._id).populate('college').populate('organizer', 'name email');

    return sendSuccess(res, 201, 'Club created successfully!', { club: populatedClub });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/clubs/:id/membership-requests
 * @desc    Request membership in a club
 * @access  Private (Student)
 */
const requestClubMembership = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { requestMessage } = req.body;

    const club = await Club.findById(id).populate('college');
    if (!club) {
      return sendError(res, 404, 'Club not found.');
    }

    // Check if external student is permitted
    const studentCollegeId = req.user.college?._id?.toString() || req.user.college?.toString();
    const clubCollegeId = club.college?._id?.toString() || club.college?.toString();

    if (studentCollegeId !== clubCollegeId && !club.externalMembershipAllowed) {
      return sendError(
        res,
        403,
        `This club is currently only accepting members from ${club.college.name}.`
      );
    }

    // Check existing request
    const existing = await ClubMembership.findOne({
      club: club._id,
      student: req.user._id,
    });

    if (existing) {
      return sendError(
        res,
        409,
        `You already have a membership request for this club with status: ${existing.status}.`
      );
    }

    const membership = await ClubMembership.create({
      club: club._id,
      student: req.user._id,
      college: studentCollegeId,
      status: 'pending',
      requestMessage: requestMessage || 'I would like to join the club and contribute.',
    });

    // Notify club organizer
    await Notification.create({
      recipient: club.organizer,
      type: 'club_membership',
      title: 'New Club Membership Request',
      message: `${req.user.name} from ${req.user.college?.name || 'partner college'} requested to join ${club.name}.`,
      link: `/organizer/dashboard`,
    });

    return sendSuccess(res, 201, 'Membership request submitted successfully!', { membership });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/clubs/:id/membership-requests
 * @desc    Get all membership requests for a club (Organizer/Admin)
 * @access  Private
 */
const getClubMembershipRequests = async (req, res, next) => {
  try {
    const { id } = req.params;
    const club = await Club.findById(id);

    if (!club) {
      return sendError(res, 404, 'Club not found.');
    }

    const isOrganizer = club.organizer.toString() === req.user._id.toString();
    const isCollegeAdmin =
      req.user.role === 'college_admin' &&
      req.user.college &&
      req.user.college.toString() === club.college.toString();
    const isPlatformAdmin = req.user.role === 'platform_admin';

    if (!isOrganizer && !isCollegeAdmin && !isPlatformAdmin) {
      return sendError(res, 403, 'Forbidden: Not authorized to view membership requests for this club.');
    }

    const requests = await ClubMembership.find({ club: id })
      .populate('student', 'name email department year skills interests profileImage')
      .populate('college', 'name city state logo')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Membership requests retrieved', { requests });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/clubs/:id/membership-requests/:requestId
 * @desc    Approve or reject a club membership request
 * @access  Private (Club Organizer, College Admin, Platform Admin)
 */
const reviewClubMembershipRequest = async (req, res, next) => {
  try {
    const { id, requestId } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return sendError(res, 400, "Status must be either 'approved' or 'rejected'.");
    }

    const club = await Club.findById(id);
    if (!club) {
      return sendError(res, 404, 'Club not found.');
    }

    const isOrganizer = club.organizer.toString() === req.user._id.toString();
    const isCollegeAdmin =
      req.user.role === 'college_admin' &&
      req.user.college &&
      req.user.college.toString() === club.college.toString();
    const isPlatformAdmin = req.user.role === 'platform_admin';

    if (!isOrganizer && !isCollegeAdmin && !isPlatformAdmin) {
      return sendError(res, 403, 'Forbidden: Not authorized to review requests for this club.');
    }

    const membership = await ClubMembership.findById(requestId).populate('student');
    if (!membership) {
      return sendError(res, 404, 'Membership request not found.');
    }

    membership.status = status;
    membership.reviewedBy = req.user._id;
    membership.reviewedAt = new Date();
    await membership.save();

    // Notify student
    await Notification.create({
      recipient: membership.student._id,
      type: 'club_membership',
      title: `Club Membership ${status === 'approved' ? 'Approved!' : 'Update'}`,
      message: `Your membership request for ${club.name} was ${status}.`,
      link: `/clubs/${club._id}`,
    });

    return sendSuccess(res, 200, `Membership request marked as ${status}`, { membership });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClubs,
  getClubById,
  createClub,
  requestClubMembership,
  getClubMembershipRequests,
  reviewClubMembershipRequest,
};

