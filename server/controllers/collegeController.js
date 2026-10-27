const College = require('../models/College');
const Event = require('../models/Event');
const Club = require('../models/Club');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * @route   GET /api/colleges
 * @desc    Get all colleges with search and filtering
 * @access  Public
 */
const getColleges = async (req, res, next) => {
  try {
    const { search, city, state, status, page = 1, limit = 12 } = req.query;

    const query = {};

    // By default, public directory shows verified colleges, unless status is explicitly requested (e.g., admin view)
    if (status) {
      query.verificationStatus = status;
    } else {
      query.verificationStatus = { $in: ['verified', 'pending'] };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } },
      ];
    }

    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    if (state) {
      query.state = { $regex: state, $options: 'i' };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [colleges, total] = await Promise.all([
      College.find(query).sort({ verificationStatus: 1, name: 1 }).skip(skip).limit(limitNum),
      College.countDocuments(query),
    ]);

    // Enhance colleges with live event & club counts
    const collegeIds = colleges.map((c) => c._id);
    const [eventCounts, clubCounts] = await Promise.all([
      Event.aggregate([
        { $match: { organizingCollege: { $in: collegeIds }, status: 'published' } },
        { $group: { _id: '$organizingCollege', count: { $sum: 1 } } },
      ]),
      Club.aggregate([
        { $match: { college: { $in: collegeIds }, status: 'active' } },
        { $group: { _id: '$college', count: { $sum: 1 } } },
      ]),
    ]);

    const eventCountMap = {};
    eventCounts.forEach((ec) => (eventCountMap[ec._id.toString()] = ec.count));

    const clubCountMap = {};
    clubCounts.forEach((cc) => (clubCountMap[cc._id.toString()] = cc.count));

    const enrichedColleges = colleges.map((c) => {
      const obj = c.toObject();
      obj.eventCount = eventCountMap[c._id.toString()] || 0;
      obj.clubCount = clubCountMap[c._id.toString()] || 0;
      return obj;
    });

    return sendSuccess(
      res,
      200,
      'Colleges retrieved successfully',
      { colleges: enrichedColleges },
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
 * @route   GET /api/colleges/:id
 * @desc    Get single college profile by ID or slug
 * @access  Public
 */
const getCollegeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let college;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      college = await College.findById(id);
    } else {
      college = await College.findOne({ slug: id.toLowerCase() });
    }

    if (!college) {
      return sendError(res, 404, 'College not found.');
    }

    // Get counts
    const [eventCount, clubCount] = await Promise.all([
      Event.countDocuments({ organizingCollege: college._id, status: 'published' }),
      Club.countDocuments({ college: college._id, status: 'active' }),
    ]);

    const collegeData = college.toObject();
    collegeData.eventCount = eventCount;
    collegeData.clubCount = clubCount;

    return sendSuccess(res, 200, 'College details retrieved', { college: collegeData });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/colleges/:id/events
 * @desc    Get all events for a specific college
 * @access  Public
 */
const getCollegeEvents = async (req, res, next) => {
  try {
    const { id } = req.params;
    const events = await Event.find({ organizingCollege: id, status: 'published' })
      .populate('organizingClub', 'name logo')
      .sort({ startDate: 1 });

    return sendSuccess(res, 200, 'College events retrieved', { events });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/colleges/:id/clubs
 * @desc    Get all clubs for a specific college
 * @access  Public
 */
const getCollegeClubs = async (req, res, next) => {
  try {
    const { id } = req.params;
    const clubs = await Club.find({ college: id, status: 'active' })
      .populate('organizer', 'name email')
      .sort({ name: 1 });

    return sendSuccess(res, 200, 'College clubs retrieved', { clubs });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/colleges
 * @desc    Submit a new college registration
 * @access  Private
 */
const createCollege = async (req, res, next) => {
  try {
    const { name, description, city, state, website, logo, establishedYear } = req.body;

    if (!name || !city || !state) {
      return sendError(res, 400, 'Name, city, and state are required.');
    }

    const existing = await College.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (existing) {
      return sendError(res, 409, 'A college with this name is already registered on CampusConnect.');
    }

    // Default status is 'pending' unless created by platform_admin
    const verificationStatus = req.user.role === 'platform_admin' ? 'verified' : 'pending';

    const college = await College.create({
      name: name.trim(),
      description: description || '',
      city: city.trim(),
      state: state.trim(),
      website: website || '',
      logo: logo || '',
      establishedYear: establishedYear || null,
      verificationStatus,
      submittedBy: req.user._id,
      approvedBy: req.user.role === 'platform_admin' ? req.user._id : null,
    });

    return sendSuccess(res, 201, 'College registration submitted for verification', { college });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/colleges/:id
 * @desc    Update college profile
 * @access  Private (College Admin of this college, or Platform Admin)
 */
const updateCollege = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { description, website, logo, bannerImage, announcements, achievements, city, state } = req.body;

    const college = await College.findById(id);
    if (!college) {
      return sendError(res, 404, 'College not found');
    }

    // Authorization check: College admin can only edit their own college
    if (req.user.role === 'college_admin') {
      if (!req.user.college || req.user.college.toString() !== college._id.toString()) {
        return sendError(res, 403, 'Forbidden: You can only manage your own college profile.');
      }
    } else if (req.user.role !== 'platform_admin') {
      return sendError(res, 403, 'Unauthorized to update college profiles.');
    }

    if (description !== undefined) college.description = description;
    if (website !== undefined) college.website = website;
    if (logo !== undefined) college.logo = logo;
    if (bannerImage !== undefined) college.bannerImage = bannerImage;
    if (city !== undefined) college.city = city;
    if (state !== undefined) college.state = state;
    if (achievements !== undefined) college.achievements = achievements;

    // College announcement support
    if (req.body.newAnnouncement) {
      college.announcements.unshift({
        title: req.body.newAnnouncement.title,
        content: req.body.newAnnouncement.content,
        postedBy: req.user.name,
        date: new Date(),
      });
    }

    // Only platform admin can change verificationStatus
    if (req.body.verificationStatus && req.user.role === 'platform_admin') {
      college.verificationStatus = req.body.verificationStatus;
      college.approvedBy = req.user._id;
    }

    await college.save();
    return sendSuccess(res, 200, 'College profile updated successfully', { college });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getColleges,
  getCollegeById,
  getCollegeEvents,
  getCollegeClubs,
  createCollege,
  updateCollege,
};

