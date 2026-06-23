const AppError = require('../utils/appError');
const logger = require('../utils/logger');

function errorMiddleware(err, req, res, _next) {
  const requestId = req.id || 'unknown';

  if (err instanceof AppError) {
    logger.warn(err.message, {
      requestId,
      statusCode: err.statusCode,
      errorCode: err.errorCode,
      path: req.path
    });

    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.errorCode,
        message: err.message
      },
      meta: { requestId }
    });
  }

  logger.error(err.message, {
    requestId,
    stack: err.stack,
    path: req.path
  });

  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
    },
    meta: { requestId }
  });
}

module.exports = errorMiddleware;
