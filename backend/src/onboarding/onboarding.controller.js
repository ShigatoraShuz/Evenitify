const asyncHandler = require('../shared/utils/asyncHandler');
const { sendSuccess } = require('../shared/utils/response');
const onboardingService = require('./onboarding.service');

const getStatus = asyncHandler(async (req, res) => {
  const result = await onboardingService.getStatus(req.user.id);
  return sendSuccess(res, result);
});

const complete = asyncHandler(async (req, res) => {
  const result = await onboardingService.complete(req.user.id, req.validated.body);
  return sendSuccess(res, result);
});

module.exports = { getStatus, complete };
