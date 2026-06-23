const asyncHandler = require('../shared/utils/asyncHandler');
const { sendSuccess, sendCreated, sendNoContent } = require('../shared/utils/response');
const procurementService = require('./vendor-procurement.service');

const listRequirements = asyncHandler(async (req, res) => {
  const requirements = await procurementService.listRequirements(
    req.user,
    req.validated.params.eventId
  );
  return sendSuccess(res, requirements);
});

const createRequirement = asyncHandler(async (req, res) => {
  const requirement = await procurementService.createRequirement(
    req.user,
    req.validated.params.eventId,
    req.validated.body
  );
  return sendCreated(res, requirement);
});

const updateRequirement = asyncHandler(async (req, res) => {
  const requirement = await procurementService.updateRequirement(
    req.user,
    req.validated.params.requirementId,
    req.validated.body
  );
  return sendSuccess(res, requirement);
});

const deleteRequirement = asyncHandler(async (req, res) => {
  await procurementService.deleteRequirement(
    req.user,
    req.validated.params.requirementId
  );
  return sendNoContent(res);
});

module.exports = { listRequirements, createRequirement, updateRequirement, deleteRequirement };
