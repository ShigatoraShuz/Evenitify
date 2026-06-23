const AppError = require('../utils/appError');

function validate(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query
    });

    if (!result.success) {
      const firstError = result.error.issues[0];
      throw new AppError(
        firstError.message,
        400,
        'VALIDATION_ERROR'
      );
    }

    req.validated = result.data;
    next();
  };
}

module.exports = validate;
