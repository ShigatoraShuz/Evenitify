const AppError = require('../utils/appError');

function requireRole(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user || !req.user.role) {
      throw new AppError('User role not found', 403, 'ROLE_NOT_FOUND');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(
        `Access denied. Required role: ${allowedRoles.join(' or ')}`,
        403,
        'FORBIDDEN'
      );
    }

    next();
  };
}

module.exports = requireRole;
