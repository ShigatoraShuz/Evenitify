const asyncHandler = require('../shared/utils/asyncHandler');
const { sendSuccess } = require('../shared/utils/response');
const service = require('./organizer-dashboard.service');

const getDashboard = asyncHandler(async (req, res) => sendSuccess(res, await service.getDashboard(req.user)));
const getSummary = asyncHandler(async (req, res) => sendSuccess(res, await service.getSummary(req.user)));
const getEvents = asyncHandler(async (req, res) => sendSuccess(res, await service.getEvents(req.user)));
const getDrafts = asyncHandler(async (req, res) => sendSuccess(res, await service.getDrafts(req.user)));
const getVendorRequests = asyncHandler(async (req, res) => sendSuccess(res, await service.getVendorRequests(req.user)));
const getBookings = asyncHandler(async (req, res) => sendSuccess(res, await service.getBookings(req.user)));
const getRecommendedVendors = asyncHandler(async (req, res) => sendSuccess(res, await service.getRecommendedVendors(req.user)));
const getActivities = asyncHandler(async (req, res) => sendSuccess(res, await service.getActivities(req.user)));
const getNotifications = asyncHandler(async (req, res) => sendSuccess(res, await service.getNotifications(req.user)));

module.exports = {
  getDashboard,
  getSummary,
  getEvents,
  getDrafts,
  getVendorRequests,
  getBookings,
  getRecommendedVendors,
  getActivities,
  getNotifications
};
