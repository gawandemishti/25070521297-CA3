const Connection = require('../models/Connection');
const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * @route   POST /api/connections/:userId
 * @desc    Send connection request to another student
 * @access  Private
 */
const sendConnectionRequest = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { message } = req.body;

    if (userId === req.user._id.toString()) {
      return sendError(res, 400, 'You cannot send a connection request to yourself.');
    }

    const existing = await Connection.findOne({
      $or: [
        { requester: req.user._id, recipient: userId },
        { requester: userId, recipient: req.user._id },
      ],
    });

    if (existing) {
      return sendError(res, 409, `A connection relationship already exists with status: ${existing.status}`);
    }

    const connection = await Connection.create({
      requester: req.user._id,
      recipient: userId,
      message: message || `Hi! I would like to connect on CampusConnect.`,
    });

    await Notification.create({
      recipient: userId,
      sender: req.user._id,
      type: 'connection_request',
      title: 'New Connection Request',
      message: `${req.user.name} sent you a connection request.`,
      link: `/teammates`,
    });

    return sendSuccess(res, 201, 'Connection request sent successfully!', { connection });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/connections/requests
 * @desc    Get pending received and sent connection requests
 * @access  Private
 */
const getConnectionRequests = async (req, res, next) => {
  try {
    const [received, sent, connections] = await Promise.all([
      Connection.find({ recipient: req.user._id, status: 'pending' })
        .populate('requester', 'name department year skills interests profileImage college')
        .populate({ path: 'requester', populate: { path: 'college', select: 'name city state logo' } }),
      Connection.find({ requester: req.user._id, status: 'pending' })
        .populate('recipient', 'name department year skills interests profileImage college')
        .populate({ path: 'recipient', populate: { path: 'college', select: 'name city state logo' } }),
      Connection.find({
        $or: [{ requester: req.user._id }, { recipient: req.user._id }],
        status: 'accepted',
      })
        .populate('requester', 'name email department year skills interests profileImage college')
        .populate('recipient', 'name email department year skills interests profileImage college'),
    ]);

    return sendSuccess(res, 200, 'Connections retrieved', {
      received,
      sent,
      connections,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/connections/:id
 * @desc    Accept or reject connection request
 * @access  Private
 */
const respondToConnectionRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'

    if (!['accepted', 'rejected'].includes(status)) {
      return sendError(res, 400, "Status must be 'accepted' or 'rejected'.");
    }

    const connection = await Connection.findById(id);
    if (!connection) {
      return sendError(res, 404, 'Connection request not found.');
    }

    if (connection.recipient.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Forbidden: This request was not sent to you.');
    }

    connection.status = status;
    await connection.save();

    if (status === 'accepted') {
      await Notification.create({
        recipient: connection.requester,
        sender: req.user._id,
        type: 'connection_request',
        title: 'Connection Accepted!',
        message: `${req.user.name} accepted your connection request.`,
        link: `/teammates`,
      });
    }

    return sendSuccess(res, 200, `Connection request ${status}`, { connection });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendConnectionRequest,
  getConnectionRequests,
  respondToConnectionRequest,
};

