const asyncHandler = require('../shared/utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../shared/utils/response');
const bookingService = require('./contract-booking.service');

const createBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking(req.user, req.validated.body);
  return sendCreated(res, booking);
});

const getBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.getBooking(req.user, req.validated.params.bookingId);
  return sendSuccess(res, booking);
});

const listEventBookings = asyncHandler(async (req, res) => {
  const bookings = await bookingService.listEventBookings(req.user, req.validated.params.eventId);
  return sendSuccess(res, bookings);
});

// Contract controllers

const createContract = asyncHandler(async (req, res) => {
  const contract = await bookingService.createContract(req.user, req.validated.params.bookingId, req.validated.body);
  return sendCreated(res, contract);
});

const getContractByBooking = asyncHandler(async (req, res) => {
  const contract = await bookingService.getContractByBooking(req.user, req.validated.params.bookingId);
  return sendSuccess(res, contract);
});

const updateContractStatus = asyncHandler(async (req, res) => {
  const contract = await bookingService.updateContractStatus(req.user, req.validated.params.contractId, req.validated.body);
  return sendSuccess(res, contract);
});

const signContractOrganizer = asyncHandler(async (req, res) => {
  const contract = await bookingService.signContractOrganizer(req.user, req.validated.params.contractId, req.validated.body);
  return sendSuccess(res, contract);
});

const signContractVendor = asyncHandler(async (req, res) => {
  const contract = await bookingService.signContractVendor(req.user, req.validated.params.contractId, req.validated.body);
  return sendSuccess(res, contract);
});

const awardQuote = asyncHandler(async (req, res) => {
  const result = await bookingService.awardQuote(req.user, req.validated.params.bookingId, req.validated.body);
  return sendSuccess(res, result);
});

module.exports = {
  createBooking,
  getBooking,
  listEventBookings,
  createContract,
  getContractByBooking,
  updateContractStatus,
  signContractOrganizer,
  signContractVendor,
  awardQuote
};
