const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * @route   POST /api/events/:id/register
 * @desc    Register current student for an event with strict multi-college validations
 * @access  Private (Student)
 */
const registerForEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const student = req.user;

    const event = await Event.findById(id).populate('organizingCollege');
    if (!event) {
      return sendError(res, 404, 'Event not found.');
    }

    if (event.status !== 'published') {
      return sendError(res, 400, 'This event is not open for registration.');
    }

    // 1. Check registration deadline
    const now = new Date();
    if (now > new Date(event.registrationDeadline)) {
      return sendError(
        res,
        400,
        `Registration closed on ${new Date(event.registrationDeadline).toLocaleDateString()}.`
      );
    }

    // 2. Check event capacity
    if (event.capacity > 0 && event.registeredCount >= event.capacity) {
      return sendError(res, 400, 'Sorry, this event has reached maximum capacity.');
    }

    // 3. Multi-College Eligibility Check
    const studentCollegeId = student.college?._id?.toString() || student.college?.toString();
    const eventCollegeId = event.organizingCollege?._id?.toString() || event.organizingCollege?.toString();

    if (event.participationScope === 'own_college_only') {
      if (studentCollegeId !== eventCollegeId) {
        return sendError(
          res,
          403,
          `Eligibility restriction: This event is exclusively open to students of ${event.organizingCollege.name}.`
        );
      }
    } else if (event.participationScope === 'selected_colleges') {
      const allowedList = (event.allowedColleges || []).map((c) =>
        c._id ? c._id.toString() : c.toString()
      );
      if (studentCollegeId !== eventCollegeId && !allowedList.includes(studentCollegeId)) {
        return sendError(
          res,
          403,
          'Eligibility restriction: Your college is not eligible to participate in this specific event.'
        );
      }
    }

    // 4. Duplicate Registration Check
    const existingRegistration = await EventRegistration.findOne({
      event: event._id,
      student: student._id,
      registrationStatus: { $ne: 'cancelled' },
    });

    if (existingRegistration) {
      return sendError(res, 409, 'You are already registered for this event.', {
        ticketCode: existingRegistration.ticketCode,
      });
    }

    // 5. Create Registration & increment counter
    const registration = await EventRegistration.create({
      event: event._id,
      student: student._id,
      college: studentCollegeId,
      registrationStatus: 'confirmed',
      notes: req.body.notes || '',
    });

    event.registeredCount = (event.registeredCount || 0) + 1;
    await event.save();

    // 6. Issue in-app notification
    await Notification.create({
      recipient: student._id,
      type: 'registration_status',
      title: 'Registration Confirmed!',
      message: `You have successfully registered for "${event.title}". Your ticket ID is ${registration.ticketCode}.`,
      link: `/events/${event._id}`,
    });

    const populatedReg = await EventRegistration.findById(registration._id)
      .populate('event')
      .populate('college', 'name city state logo');

    return sendSuccess(res, 201, 'Registration confirmed successfully!', {
      registration: populatedReg,
    });
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, 409, 'Duplicate registration detected. You are already registered for this event.');
    }
    next(error);
  }
};

/**
 * @route   GET /api/registrations/me
 * @desc    Get all event registrations for current student
 * @access  Private
 */
const getMyRegistrations = async (req, res, next) => {
  try {
    const registrations = await EventRegistration.find({
      student: req.user._id,
      registrationStatus: { $ne: 'cancelled' },
    })
      .populate({
        path: 'event',
        populate: [
          { path: 'organizingCollege', select: 'name city state logo' },
          { path: 'organizingClub', select: 'name logo' },
        ],
      })
      .sort({ registeredAt: -1 });

    return sendSuccess(res, 200, 'User registrations retrieved', { registrations });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/registrations/:id
 * @desc    Cancel an event registration
 * @access  Private
 */
const cancelRegistration = async (req, res, next) => {
  try {
    const { id } = req.params;

    const registration = await EventRegistration.findById(id).populate('event');
    if (!registration) {
      return sendError(res, 404, 'Registration not found.');
    }

    // Only student who owns it, or admin
    if (
      registration.student.toString() !== req.user._id.toString() &&
      req.user.role !== 'platform_admin'
    ) {
      return sendError(res, 403, 'Forbidden: You cannot cancel another student registration.');
    }

    if (registration.registrationStatus === 'cancelled') {
      return sendError(res, 400, 'Registration is already cancelled.');
    }

    registration.registrationStatus = 'cancelled';
    await registration.save();

    // Decrement registered count
    if (registration.event) {
      const event = await Event.findById(registration.event._id);
      if (event && event.registeredCount > 0) {
        event.registeredCount = Math.max(0, event.registeredCount - 1);
        await event.save();
      }
    }

    return sendSuccess(res, 200, 'Registration successfully cancelled.');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/registrations/:id
 * @desc    Update attendance or registration status (Organizer/Admin)
 * @access  Private
 */
const updateRegistrationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { attendanceStatus, registrationStatus } = req.body;

    const registration = await EventRegistration.findById(id).populate('event');
    if (!registration) {
      return sendError(res, 404, 'Registration not found');
    }

    if (attendanceStatus !== undefined) {
      registration.attendanceStatus = Boolean(attendanceStatus);
    }

    if (registrationStatus) {
      registration.registrationStatus = registrationStatus;
    }

    await registration.save();
    return sendSuccess(res, 200, 'Registration updated', { registration });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerForEvent,
  getMyRegistrations,
  cancelRegistration,
  updateRegistrationStatus,
};

