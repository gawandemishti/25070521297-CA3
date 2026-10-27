/**
 * Standardized API Response Utilities
 * Enforces consistent JSON format across all CampusConnect endpoints
 */

const sendSuccess = (res, statusCode = 200, message = 'Success', data = null, pagination = null) => {
  const response = {
    success: true,
    message,
  };
  if (data !== null) {
    response.data = data;
  }
  if (pagination !== null) {
    response.pagination = pagination;
  }
  return res.status(statusCode).json(response);
};

const sendError = (res, statusCode = 500, message = 'An error occurred', errors = []) => {
  let errorArray = [];
  if (Array.isArray(errors)) {
    errorArray = errors;
  } else if (typeof errors === 'string') {
    errorArray = [{ message: errors }];
  } else if (errors && typeof errors === 'object') {
    errorArray = [errors];
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errors: errorArray,
  });
};

module.exports = {
  sendSuccess,
  sendError,
};

