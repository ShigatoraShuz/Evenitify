const AppError = require('../utils/appError');

function requireRole(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401, 'AUTH_REQUIRED');
    }

    const userRoles = req.user.roles || [req.user.role].filter(Boolean);
    const hasRole = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      throw new AppError('Insufficient permissions', 403, 'FORBIDDEN');
    }

    next();
  };
}

module.exports = requireRole;
