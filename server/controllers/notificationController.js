const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * @route   GET /api/notifications
 * @desc    Get user notifications
 * @access  Private
 */
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name profileImage')
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    return sendSuccess(res, 200, 'Notifications retrieved', {
      notifications,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark a single notification as read
 * @access  Private
 */
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOne({
      _id: id,
      recipient: req.user._id,
    });

    if (!notification) {
      return sendError(res, 404, 'Notification not found');
    }

    notification.isRead = true;
    await notification.save();

    return sendSuccess(res, 200, 'Notification marked as read', { notification });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/notifications/read-all
 * @desc    Mark all user notifications as read
 * @access  Private
 */
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    return sendSuccess(res, 200, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};

