const AppError = require('../utils/appError');

function requireRole(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user || (!req.user.role && !req.user.roles?.length)) {
      throw new AppError('User role not found', 403, 'ROLE_NOT_FOUND');
    }

    const userRoles = req.user.roles?.length ? req.user.roles : [req.user.role];

    if (!userRoles.some((role) => allowedRoles.includes(role))) {
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
