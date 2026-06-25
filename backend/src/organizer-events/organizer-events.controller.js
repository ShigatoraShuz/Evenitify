const asyncHandler = require('../shared/utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../shared/utils/response');
const eventService = require('./organizer-events.service');

const listEvents = asyncHandler(async (req, res) => {
  const events = await eventService.listEvents(req.user);
  return sendSuccess(res, events);
});

const getEvent = asyncHandler(async (req, res) => {
  const event = await eventService.getEvent(req.user, req.validated.params.eventId);
  return sendSuccess(res, event);
});

const createEvent = asyncHandler(async (req, res) => {
  const event = await eventService.createEvent(req.user, req.validated.body);
  return sendCreated(res, event);
});

const updateEvent = asyncHandler(async (req, res) => {
  const event = await eventService.updateEvent(req.user, req.validated.params.eventId, req.validated.body);
  return sendSuccess(res, event);
});

const getEventPortfolio = asyncHandler(async (req, res) => {
  const portfolio = await eventService.getEventPortfolio(req.user, req.validated.params.eventId);
  return sendSuccess(res, portfolio);
});

const getDashboardSummary = asyncHandler(async (req, res) => {
  const summary = await eventService.getDashboardSummary(req.user);
  return sendSuccess(res, summary);
});

const deleteEvent = asyncHandler(async (req, res) => {
  const result = await eventService.deleteEvent(req.user, req.validated.params.eventId);
  return sendSuccess(res, result);
});

module.exports = { listEvents, getEvent, createEvent, updateEvent, deleteEvent, getEventPortfolio, getDashboardSummary };
