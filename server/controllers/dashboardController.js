const User = require('../models/User');
const College = require('../models/College');
const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const Club = require('../models/Club');
const ClubMembership = require('../models/ClubMembership');
const TeamInvitation = require('../models/TeamInvitation');
const Report = require('../models/Report');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * @route   GET /api/dashboard/student
 * @desc    Get comprehensive student dashboard data
 * @access  Private (Student)
 */
const getStudentDashboard = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const now = new Date();

    const [
      registrations,
      memberships,
      teamInvitations,
      recommendedEvents,
      recentEvents,
    ] = await Promise.all([
      EventRegistration.find({ student: studentId, registrationStatus: { $ne: 'cancelled' } })
        .populate({
          path: 'event',
          populate: { path: 'organizingCollege', select: 'name city state logo' },
        })
        .sort({ registeredAt: -1 }),

      ClubMembership.find({ student: studentId })
        .populate({
          path: 'club',
          populate: { path: 'college', select: 'name city state logo' },
        })
        .sort({ createdAt: -1 }),

      TeamInvitation.find({ recipient: studentId, status: 'pending' })
        .populate('team')
        .populate('event', 'title startDate bannerImage')
        .populate('sender', 'name profileImage'),

      // Recommend events matching student's skills or interests or upcoming
      Event.find({
        status: 'published',
        startDate: { $gte: now },
      })
        .populate('organizingCollege', 'name city state logo')
        .sort({ startDate: 1 })
        .limit(4),

      Event.find({ status: 'published' })
        .populate('organizingCollege', 'name city state logo')
        .sort({ createdAt: -1 })
        .limit(4),
    ]);

    const upcomingRegistrations = registrations.filter(
      (r) => r.event && new Date(r.event.startDate) >= now
    );
    const pastRegistrations = registrations.filter(
      (r) => r.event && new Date(r.event.endDate) < now
    );

    return sendSuccess(res, 200, 'Student dashboard retrieved', {
      user: req.user,
      stats: {
        totalRegistrations: registrations.length,
        upcomingEventsCount: upcomingRegistrations.length,
        pastEventsCount: pastRegistrations.length,
        joinedClubsCount: memberships.filter((m) => m.status === 'approved').length,
        pendingClubRequestsCount: memberships.filter((m) => m.status === 'pending').length,
        pendingTeamInvitesCount: teamInvitations.length,
      },
      upcomingRegistrations,
      pastRegistrations,
      memberships,
      teamInvitations,
      recommendedEvents,
      recentEvents,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/dashboard/organizer
 * @desc    Get organizer dashboard data
 * @access  Private (Organizer, College Admin, Platform Admin)
 */
const getOrganizerDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Events organized by this user (or if college admin, their college events)
    const eventQuery =
      req.user.role === 'college_admin'
        ? { organizingCollege: req.user.college }
        : { organizer: userId };

    const [events, clubs] = await Promise.all([
      Event.find(eventQuery)
        .populate('organizingCollege', 'name city state logo')
        .populate('organizingClub', 'name logo')
        .sort({ createdAt: -1 }),

      Club.find({ organizer: userId }).populate('college', 'name city state logo'),
    ]);

    const eventIds = events.map((e) => e._id);
    const clubIds = clubs.map((c) => c._id);

    const [registrations, pendingClubRequests] = await Promise.all([
      EventRegistration.find({ event: { $in: eventIds } })
        .populate('student', 'name email department year college')
        .populate('event', 'title')
        .populate('college', 'name city state')
        .sort({ registeredAt: -1 }),

      ClubMembership.find({ club: { $in: clubIds }, status: 'pending' })
        .populate('student', 'name email department year skills interests')
        .populate('club', 'name')
        .populate('college', 'name city state'),
    ]);

    const totalRegistrations = registrations.length;
    const confirmedRegistrations = registrations.filter((r) => r.registrationStatus === 'confirmed').length;
    const attendedCount = registrations.filter((r) => r.attendanceStatus === true).length;

    return sendSuccess(res, 200, 'Organizer dashboard retrieved', {
      stats: {
        totalEvents: events.length,
        publishedEvents: events.filter((e) => e.status === 'published').length,
        draftEvents: events.filter((e) => e.status === 'draft').length,
        totalClubs: clubs.length,
        totalRegistrations,
        confirmedRegistrations,
        attendedCount,
        pendingClubRequestsCount: pendingClubRequests.length,
      },
      events,
      clubs,
      recentRegistrations: registrations.slice(0, 10),
      pendingClubRequests,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/dashboard/college-admin
 * @desc    Get college admin dashboard restricted to their authorized college
 * @access  Private (College Admin, Platform Admin)
 */
const getCollegeAdminDashboard = async (req, res, next) => {
  try {
    let collegeId = req.user.college;
    if (req.user.role === 'platform_admin' && req.query.collegeId) {
      collegeId = req.query.collegeId;
    }

    if (!collegeId) {
      return sendError(res, 400, 'No college assigned to this administrator.');
    }

    const college = await College.findById(collegeId);
    if (!college) {
      return sendError(res, 404, 'College record not found.');
    }

    const [studentsCount, organizersCount, clubs, events, pendingClubRequests] = await Promise.all([
      User.countDocuments({ college: collegeId, role: 'student', isActive: true }),
      User.countDocuments({ college: collegeId, role: 'organizer', isActive: true }),
      Club.find({ college: collegeId }).populate('organizer', 'name email'),
      Event.find({ organizingCollege: collegeId }).sort({ createdAt: -1 }),
      ClubMembership.find({
        club: { $in: await Club.find({ college: collegeId }).distinct('_id') },
        status: 'pending',
      }).populate('student', 'name email').populate('club', 'name'),
    ]);

    const eventIds = events.map((e) => e._id);
    const totalRegistrations = await EventRegistration.countDocuments({ event: { $in: eventIds } });

    return sendSuccess(res, 200, 'College Admin dashboard retrieved', {
      college,
      stats: {
        totalStudents: studentsCount,
        totalOrganizers: organizersCount,
        totalClubs: clubs.length,
        totalEvents: events.length,
        publishedEvents: events.filter((e) => e.status === 'published').length,
        totalRegistrations,
        pendingClubRequestsCount: pendingClubRequests.length,
      },
      clubs,
      events,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/dashboard/platform-admin
 * @desc    Get platform-wide statistics for Platform Admin (with charts data)
 * @access  Private (Platform Admin)
 */
const getPlatformAdminDashboard = async (req, res, next) => {
  try {
    const [
      totalColleges,
      verifiedColleges,
      pendingColleges,
      totalStudents,
      totalOrganizers,
      totalClubs,
      totalEvents,
      publishedEvents,
      totalRegistrations,
      pendingReports,
      recentColleges,
      recentEvents,
      recentUsers,
    ] = await Promise.all([
      College.countDocuments(),
      College.countDocuments({ verificationStatus: 'verified' }),
      College.countDocuments({ verificationStatus: 'pending' }),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'organizer' }),
      Club.countDocuments(),
      Event.countDocuments(),
      Event.countDocuments({ status: 'published' }),
      EventRegistration.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      College.find().sort({ createdAt: -1 }).limit(5),
      Event.find().populate('organizingCollege', 'name').sort({ createdAt: -1 }).limit(5),
      User.find().populate('college', 'name').sort({ createdAt: -1 }).limit(5),
    ]);

    // Aggregate category distribution for charts
    const categoryDistribution = await Event.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { name: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);

    // Aggregate delivery mode distribution
    const modeDistribution = await Event.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$deliveryMode', count: { $sum: 1 } } },
      { $project: { name: '$_id', count: 1, _id: 0 } },
    ]);

    // Colleges by state
    const collegesByState = await College.aggregate([
      { $group: { _id: '$state', count: { $sum: 1 } } },
      { $project: { state: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);

    return sendSuccess(res, 200, 'Platform admin dashboard retrieved', {
      stats: {
        totalColleges,
        verifiedColleges,
        pendingColleges,
        totalStudents,
        totalOrganizers,
        totalClubs,
        totalEvents,
        publishedEvents,
        totalRegistrations,
        pendingReports,
      },
      charts: {
        categoryDistribution,
        modeDistribution,
        collegesByState,
      },
      recentColleges,
      recentEvents,
      recentUsers,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudentDashboard,
  getOrganizerDashboard,
  getCollegeAdminDashboard,
  getPlatformAdminDashboard,
};

