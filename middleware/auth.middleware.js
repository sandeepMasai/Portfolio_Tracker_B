const createHttpError = require('http-errors');

// This middleware can be used for additional authorization checks if needed,
// beyond just authenticating the JWT.
// For example, role-based access control (RBAC).
const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user) {
      return next(createHttpError(401, 'Unauthorized: No user found in request.'));
    }

    if (roles.length && !roles.includes(req.user.role)) {
      // User's role is not authorized
      return next(createHttpError(403, 'Forbidden: You do not have permission to access this resource.'));
    }

    // Authentication and authorization successful
    next();
  };
};

module.exports = { authorize };