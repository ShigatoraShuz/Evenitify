const asyncHandler = require('../shared/utils/asyncHandler');
const { sendSuccess } = require('../shared/utils/response');
const adminService = require('./admin-operations.service');

const getDashboardSummary = asyncHandler(async (req, res) => {
  const summary = await adminService.getDashboardSummary();
  return sendSuccess(res, summary);
});

const listUsers = asyncHandler(async (req, res) => {
  const result = await adminService.listUsers(req.user, req.validated.query);
  return sendSuccess(res, result.data, { total: result.total });
});

const listEvents = asyncHandler(async (req, res) => {
  const result = await adminService.listEvents(req.user, req.validated.query);
  return sendSuccess(res, result.data, { total: result.total });
});

const listBookings = asyncHandler(async (req, res) => {
  const result = await adminService.listBookings(req.user, req.validated.query);
  return sendSuccess(res, result.data, { total: result.total });
});

const listVendors = asyncHandler(async (req, res) => {
  const result = await adminService.listVendors(req.user, req.validated.query);
  return sendSuccess(res, result.data, { total: result.total });
});

const updateVendorVerification = asyncHandler(async (req, res) => {
  const result = await adminService.updateVendorVerification(
    req.user,
    req.validated.params.vendorId,
    req.validated.body
  );
  return sendSuccess(res, result);
});

const overrideBookingStatus = asyncHandler(async (req, res) => {
  const result = await adminService.overrideBookingStatus(
    req.user,
    req.validated.params.bookingId,
    req.validated.body
  );
  return sendSuccess(res, result);
});

module.exports = {
  getDashboardSummary,
  listUsers,
  listEvents,
  listBookings,
  listVendors,
  updateVendorVerification,
  overrideBookingStatus
};
