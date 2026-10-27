const Team = require('../models/Team');
const TeamInvitation = require('../models/TeamInvitation');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * @route   POST /api/teams
 * @desc    Create a new team for a hackathon / competition
 * @access  Private (Student)
 */
const createTeam = async (req, res, next) => {
  try {
    const { name, eventId, projectIdea, maxMembers } = req.body;

    if (!name || !eventId) {
      return sendError(res, 400, 'Please provide team name and target event.');
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return sendError(res, 404, 'Event not found.');
    }

    // Check if user is already a leader or member of a team for this event
    const existingTeam = await Team.findOne({
      event: eventId,
      $or: [{ leader: req.user._id }, { 'members.user': req.user._id }],
      status: { $ne: 'disbanded' },
    });

    if (existingTeam) {
      return sendError(res, 400, 'You are already in an active team for this event.');
    }

    const team = await Team.create({
      name: name.trim(),
      event: eventId,
      leader: req.user._id,
      projectIdea: projectIdea || '',
      maxMembers: maxMembers || event.maxTeamSize || 4,
      members: [
        {
          user: req.user._id,
          roleInTeam: 'Team Lead',
          joinedAt: new Date(),
        },
      ],
    });

    const populatedTeam = await Team.findById(team._id)
      .populate('leader', 'name email department year skills')
      .populate('members.user', 'name email department year skills profileImage')
      .populate('event', 'title startDate endDate bannerImage');

    return sendSuccess(res, 201, 'Team created successfully!', { team: populatedTeam });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/teams
 * @desc    Get teams (optionally filtered by event or my teams)
 * @access  Private
 */
const getTeams = async (req, res, next) => {
  try {
    const { eventId, myTeams } = req.query;

    const query = { status: { $ne: 'disbanded' } };

    if (eventId) {
      query.event = eventId;
    }

    if (myTeams === 'true') {
      query.$or = [{ leader: req.user._id }, { 'members.user': req.user._id }];
    }

    const teams = await Team.find(query)
      .populate('leader', 'name email department year skills')
      .populate('members.user', 'name email department year skills profileImage')
      .populate('event', 'title startDate bannerImage deliveryMode venue')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Teams retrieved', { teams });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/teams/:id
 * @desc    Get single team details
 * @access  Private
 */
const getTeamById = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('leader', 'name email department year skills profileImage')
      .populate('members.user', 'name email department year skills profileImage')
      .populate('event');

    if (!team) {
      return sendError(res, 404, 'Team not found.');
    }

    return sendSuccess(res, 200, 'Team details retrieved', { team });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/teams/:id/invitations
 * @desc    Invite a student to join team
 * @access  Private (Team Leader)
 */
const inviteMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { recipientId, message } = req.body;

    const team = await Team.findById(id).populate('event');
    if (!team) {
      return sendError(res, 404, 'Team not found.');
    }

    if (team.leader.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Only the team leader can invite members.');
    }

    if (team.members.length >= team.maxMembers) {
      return sendError(res, 400, 'Team has already reached maximum capacity.');
    }

    // Check if recipient is already in team
    const isAlreadyMember = team.members.some((m) => m.user.toString() === recipientId);
    if (isAlreadyMember) {
      return sendError(res, 400, 'User is already a member of this team.');
    }

    // Check existing pending invitation
    const existing = await TeamInvitation.findOne({
      team: team._id,
      recipient: recipientId,
      status: 'pending',
    });

    if (existing) {
      return sendError(res, 409, 'Invitation already sent to this user.');
    }

    const invitation = await TeamInvitation.create({
      team: team._id,
      event: team.event._id,
      sender: req.user._id,
      recipient: recipientId,
      message: message || `Join our team "${team.name}" for ${team.event.title}!`,
    });

    // Notify recipient
    await Notification.create({
      recipient: recipientId,
      sender: req.user._id,
      type: 'team_invitation',
      title: 'Team Invitation Received!',
      message: `${req.user.name} invited you to join team "${team.name}" for ${team.event.title}.`,
      link: `/student/dashboard`,
    });

    return sendSuccess(res, 201, 'Invitation sent successfully', { invitation });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/teams/:id/invitations/:invitationId
 * @desc    Accept or reject a team invitation
 * @access  Private (Recipient Student)
 */
const respondToInvitation = async (req, res, next) => {
  try {
    const { id, invitationId } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'

    if (!['accepted', 'rejected'].includes(status)) {
      return sendError(res, 400, "Status must be either 'accepted' or 'rejected'.");
    }

    const invitation = await TeamInvitation.findById(invitationId);
    if (!invitation) {
      return sendError(res, 404, 'Invitation not found.');
    }

    if (invitation.recipient.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Forbidden: This invitation was not addressed to you.');
    }

    invitation.status = status;
    await invitation.save();

    if (status === 'accepted') {
      const team = await Team.findById(id);
      if (team && team.members.length < team.maxMembers) {
        team.members.push({
          user: req.user._id,
          roleInTeam: 'Member',
          joinedAt: new Date(),
        });
        await team.save();

        // Notify team leader
        await Notification.create({
          recipient: team.leader,
          sender: req.user._id,
          type: 'team_invitation',
          title: 'Team Invitation Accepted',
          message: `${req.user.name} has joined your team "${team.name}".`,
          link: `/teams/${team._id}`,
        });
      }
    }

    return sendSuccess(res, 200, `Team invitation ${status}`, { invitation });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTeam,
  getTeams,
  getTeamById,
  inviteMember,
  respondToInvitation,
};

