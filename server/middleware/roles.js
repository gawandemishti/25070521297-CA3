const { sendError } = require('../utils/apiResponse');

/**
 * Restricts access to specified user roles
 * Example: authorize('platform_admin', 'college_admin')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Unauthorized. Please log in.');
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `Access denied. Role '${req.user.role}' is not authorized for this action.`
      );
    }

    next();
  };
};

module.exports = {
  authorize,
};

