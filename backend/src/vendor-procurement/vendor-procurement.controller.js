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

const vendorService = require('../vendor-b2b-dashboard/vendor-b2b-dashboard.service');

const searchVendors = asyncHandler(async (req, res) => {
  const filters = {
    category: req.query.category,
    location: req.query.location,
    minBudget: req.query.minBudget ? parseFloat(req.query.minBudget) : undefined,
    maxBudget: req.query.maxBudget ? parseFloat(req.query.maxBudget) : undefined,
    minRating: req.query.minRating ? parseFloat(req.query.minRating) : undefined
  };

  const vendors = await vendorService.searchVendors(filters);
  return sendSuccess(res, vendors);
});

const getVendorProfile = asyncHandler(async (req, res) => {
  const vendor = await vendorService.getVendorProfile(req.params.vendorId);
  return sendSuccess(res, vendor);
});

module.exports = { listRequirements, createRequirement, updateRequirement, deleteRequirement, searchVendors, getVendorProfile };
