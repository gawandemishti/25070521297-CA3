const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const College = require('../models/College');
const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * @route   GET /api/events
 * @desc    Get events with search, multiple filters, and pagination
 * @access  Public
 */
const getEvents = async (req, res, next) => {
  try {
    const {
      search,
      college,
      city,
      category,
      deliveryMode,
      scope,
      feeType, // 'free' or 'paid'
      timeframe, // 'upcoming', 'ongoing', 'past'
      status = 'published',
      page = 1,
      limit = 9,
      sortBy = 'startDate',
      order = 'asc',
    } = req.query;

    const query = {};

    // Only platform admins or organizers viewing their own events can see draft/cancelled
    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    if (college) {
      query.organizingCollege = college;
    }

    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (deliveryMode && deliveryMode !== 'All') {
      query.deliveryMode = deliveryMode;
    }

    if (scope && scope !== 'All') {
      query.participationScope = scope;
    }

    if (feeType === 'free') {
      query.fee = 0;
    } else if (feeType === 'paid') {
      query.fee = { $gt: 0 };
    }

    const now = new Date();
    if (timeframe === 'upcoming') {
      query.startDate = { $gte: now };
    } else if (timeframe === 'past') {
      query.endDate = { $lt: now };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    const sortDirection = order === 'desc' ? -1 : 1;

    const [events, total] = await Promise.all([
      Event.find(query)
        .populate('organizingCollege', 'name city state logo verificationStatus')
        .populate('organizingClub', 'name logo category')
        .populate('organizer', 'name email profileImage')
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(limitNum),
      Event.countDocuments(query),
    ]);

    return sendSuccess(
      res,
      200,
      'Events retrieved successfully',
      { events },
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
 * @route   GET /api/events/:id
 * @desc    Get single event details with user registration status
 * @access  Public (Optional Auth)
 */
const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let event;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      event = await Event.findById(id)
        .populate('organizingCollege')
        .populate('organizingClub')
        .populate('organizer', 'name email profileImage department year')
        .populate('allowedColleges', 'name city state logo');
    } else {
      event = await Event.findOne({ slug: id })
        .populate('organizingCollege')
        .populate('organizingClub')
        .populate('organizer', 'name email profileImage department year')
        .populate('allowedColleges', 'name city state logo');
    }

    if (!event) {
      return sendError(res, 404, 'Event not found.');
    }

    // Check if current user is registered
    let userRegistration = null;
    let isEligible = true;
    let eligibilityReason = 'Eligible for registration';

    if (req.user) {
      userRegistration = await EventRegistration.findOne({
        event: event._id,
        student: req.user._id,
        registrationStatus: { $ne: 'cancelled' },
      });

      // Check participation scope eligibility
      const userCollegeId = req.user.college?._id?.toString() || req.user.college?.toString();
      const eventCollegeId = event.organizingCollege?._id?.toString() || event.organizingCollege?.toString();

      if (event.participationScope === 'own_college_only') {
        if (userCollegeId !== eventCollegeId) {
          isEligible = false;
          eligibilityReason = `This event is restricted to students of ${event.organizingCollege.name}.`;
        }
      } else if (event.participationScope === 'selected_colleges') {
        const allowedIds = (event.allowedColleges || []).map((c) =>
          c._id ? c._id.toString() : c.toString()
        );
        if (userCollegeId !== eventCollegeId && !allowedIds.includes(userCollegeId)) {
          isEligible = false;
          eligibilityReason = 'Your college is not in the list of eligible colleges for this event.';
        }
      }
    }

    const isRegistrationClosed =
      new Date() > new Date(event.registrationDeadline) ||
      (event.capacity > 0 && event.registeredCount >= event.capacity);

    return sendSuccess(res, 200, 'Event retrieved successfully', {
      event,
      userRegistration,
      isEligible,
      eligibilityReason,
      isRegistrationClosed,
      seatsRemaining: Math.max(0, event.capacity - event.registeredCount),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/events
 * @desc    Create a new event
 * @access  Private (Organizer, College Admin, Platform Admin)
 */
const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      bannerImage,
      organizingClub,
      startDate,
      endDate,
      registrationDeadline,
      venue,
      deliveryMode,
      city,
      eligibility,
      participationScope,
      allowedColleges,
      capacity,
      fee,
      status,
      isTeamEvent,
      minTeamSize,
      maxTeamSize,
      tags,
      prizes,
      contactEmail,
      contactPhone,
    } = req.body;

    if (!title || !description || !category || !startDate || !endDate || !registrationDeadline || !venue) {
      return sendError(res, 400, 'Please provide all required event details.');
    }

    // Determine organizing college
    let organizingCollegeId = req.user.college;

    // Platform admin can specify organizing college
    if (req.user.role === 'platform_admin' && req.body.organizingCollege) {
      organizingCollegeId = req.body.organizingCollege;
    }

    if (!organizingCollegeId) {
      return sendError(res, 400, 'User is not associated with an approved college.');
    }

    // Check college verification
    const college = await College.findById(organizingCollegeId);
    if (!college) {
      return sendError(res, 404, 'Associated college not found.');
    }

    if (college.verificationStatus !== 'verified' && req.user.role !== 'platform_admin') {
      return sendError(
        res,
        403,
        'Cannot publish events while college profile is unverified or suspended. Please contact platform administrators.'
      );
    }

    // Date validation
    const sDate = new Date(startDate);
    const eDate = new Date(endDate);
    const rDeadline = new Date(registrationDeadline);

    if (eDate < sDate) {
      return sendError(res, 400, 'Event end date cannot be earlier than start date.');
    }

    if (rDeadline > eDate) {
      return sendError(res, 400, 'Registration deadline cannot be after event end date.');
    }

    const event = await Event.create({
      title: title.trim(),
      description,
      category,
      bannerImage: bannerImage || '',
      organizer: req.user._id,
      organizingCollege: organizingCollegeId,
      organizingClub: organizingClub || null,
      startDate: sDate,
      endDate: eDate,
      registrationDeadline: rDeadline,
      venue: venue.trim(),
      deliveryMode: deliveryMode || 'offline',
      city: city || college.city,
      eligibility: eligibility || 'Open to all enrolled students with valid ID.',
      participationScope: participationScope || 'all',
      allowedColleges: Array.isArray(allowedColleges) ? allowedColleges : [],
      capacity: capacity ? Number(capacity) : 100,
      fee: fee ? Number(fee) : 0,
      status: status || 'published',
      isTeamEvent: Boolean(isTeamEvent),
      minTeamSize: minTeamSize ? Number(minTeamSize) : 1,
      maxTeamSize: maxTeamSize ? Number(maxTeamSize) : 4,
      tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : [],
      prizes: prizes || '',
      contactEmail: contactEmail || req.user.email,
      contactPhone: contactPhone || '',
    });

    const populatedEvent = await Event.findById(event._id)
      .populate('organizingCollege', 'name city state logo')
      .populate('organizer', 'name email');

    return sendSuccess(res, 201, 'Event created successfully!', { event: populatedEvent });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/events/:id
 * @desc    Update event details
 * @access  Private (Event Organizer, College Admin of the college, Platform Admin)
 */
const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return sendError(res, 404, 'Event not found.');
    }

    // Role and ownership check
    const isOwner = event.organizer.toString() === req.user._id.toString();
    const isCollegeAdmin =
      req.user.role === 'college_admin' &&
      req.user.college &&
      req.user.college.toString() === event.organizingCollege.toString();
    const isPlatformAdmin = req.user.role === 'platform_admin';

    if (!isOwner && !isCollegeAdmin && !isPlatformAdmin) {
      return sendError(res, 403, 'Forbidden: You are not authorized to edit this event.');
    }

    const fieldsToUpdate = [
      'title',
      'description',
      'category',
      'bannerImage',
      'startDate',
      'endDate',
      'registrationDeadline',
      'venue',
      'deliveryMode',
      'city',
      'eligibility',
      'participationScope',
      'allowedColleges',
      'capacity',
      'fee',
      'status',
      'isTeamEvent',
      'minTeamSize',
      'maxTeamSize',
      'tags',
      'prizes',
      'contactEmail',
      'contactPhone',
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
      }
    });

    // Check if new announcement is attached
    if (req.body.newAnnouncement) {
      event.announcements.unshift({
        title: req.body.newAnnouncement.title,
        content: req.body.newAnnouncement.content,
        date: new Date(),
      });
    }

    await event.save();

    const updatedEvent = await Event.findById(event._id)
      .populate('organizingCollege')
      .populate('organizingClub')
      .populate('organizer', 'name email');

    return sendSuccess(res, 200, 'Event updated successfully', { event: updatedEvent });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/events/:id
 * @desc    Cancel or delete an event
 * @access  Private
 */
const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return sendError(res, 404, 'Event not found.');
    }

    const isOwner = event.organizer.toString() === req.user._id.toString();
    const isCollegeAdmin =
      req.user.role === 'college_admin' &&
      req.user.college &&
      req.user.college.toString() === event.organizingCollege.toString();
    const isPlatformAdmin = req.user.role === 'platform_admin';

    if (!isOwner && !isCollegeAdmin && !isPlatformAdmin) {
      return sendError(res, 403, 'Forbidden: You cannot delete this event.');
    }

    // Rather than hard deletion, set status to cancelled to preserve historical integrity, or hard delete if draft
    if (event.status === 'draft') {
      await Event.findByIdAndDelete(id);
      return sendSuccess(res, 200, 'Draft event deleted completely.');
    }

    event.status = 'cancelled';
    await event.save();

    return sendSuccess(res, 200, 'Event has been marked as cancelled.');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/events/:id/registrations
 * @desc    Get all registrations for an event
 * @access  Private (Event Organizer, College Admin, Platform Admin)
 */
const getEventRegistrations = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return sendError(res, 404, 'Event not found.');
    }

    const isOwner = event.organizer.toString() === req.user._id.toString();
    const isCollegeAdmin =
      req.user.role === 'college_admin' &&
      req.user.college &&
      req.user.college.toString() === event.organizingCollege.toString();
    const isPlatformAdmin = req.user.role === 'platform_admin';

    if (!isOwner && !isCollegeAdmin && !isPlatformAdmin) {
      return sendError(res, 403, 'Forbidden: You are not authorized to view registrations for this event.');
    }

    const registrations = await EventRegistration.find({ event: id })
      .populate('student', 'name email department year skills interests profileImage')
      .populate('college', 'name city state logo')
      .populate('team', 'name leader members')
      .sort({ registeredAt: -1 });

    return sendSuccess(res, 200, 'Registrations retrieved', {
      registrations,
      total: registrations.length,
      confirmed: registrations.filter((r) => r.registrationStatus === 'confirmed').length,
      attended: registrations.filter((r) => r.attendanceStatus === true).length,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventRegistrations,
};

