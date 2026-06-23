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

module.exports = { createBooking, getBooking, listEventBookings };
