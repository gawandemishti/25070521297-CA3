const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/apiResponse');

const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return sendError(res, 401, 'Authentication required. Please log in.');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_campusconnect');
    
    const user = await User.findById(decoded.id).populate('college', 'name city state logo verificationStatus');
    
    if (!user) {
      return sendError(res, 401, 'User account no longer exists.');
    }

    if (!user.isActive) {
      return sendError(res, 403, 'Your account has been deactivated. Please contact support.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Session expired or invalid token. Please log in again.');
    }
    next(error);
  }
};

// Optional authentication - populates req.user if token is present, but doesn't block if not
const optionalAuthenticate = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_campusconnect');
      const user = await User.findById(decoded.id).populate('college', 'name city state logo verificationStatus');
      if (user && user.isActive) {
        req.user = user;
      }
    }
    next();
  } catch {
    // Proceed without req.user
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuthenticate,
};

