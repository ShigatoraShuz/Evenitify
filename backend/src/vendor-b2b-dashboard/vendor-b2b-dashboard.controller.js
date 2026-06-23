const asyncHandler = require('../shared/utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../shared/utils/response');
const vendorService = require('./vendor-b2b-dashboard.service');

const getProfile = asyncHandler(async (req, res) => {
  const profile = await vendorService.getProfile(req.user);
  return sendSuccess(res, profile);
});

const updateProfile = asyncHandler(async (req, res) => {
  const profile = await vendorService.updateProfile(req.user, req.validated.body);
  return sendSuccess(res, profile);
});

const listServices = asyncHandler(async (req, res) => {
  const services = await vendorService.listServices(req.user);
  return sendSuccess(res, services);
});

const createService = asyncHandler(async (req, res) => {
  const service = await vendorService.createService(req.user, req.validated.body);
  return sendCreated(res, service);
});

const updateService = asyncHandler(async (req, res) => {
  const service = await vendorService.updateService(
    req.user,
    req.validated.params.serviceId,
    req.validated.body
  );
  return sendSuccess(res, service);
});

module.exports = { getProfile, updateProfile, listServices, createService, updateService };
