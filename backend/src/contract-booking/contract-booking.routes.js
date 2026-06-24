const { Router } = require('express');
const authenticate = require('../shared/middleware/auth.middleware');
const requireRole = require('../shared/middleware/role.middleware');
const validate = require('../shared/middleware/validate.middleware');
const controller = require('./contract-booking.controller');
const { createBookingSchema, bookingIdSchema, eventBookingsSchema, awardQuoteSchema } = require('./contract-booking.validator');

const router = Router();

router.post('/', authenticate, requireRole('organizer'), validate(createBookingSchema), controller.createBooking);

router.post('/:bookingId/award', authenticate, requireRole('organizer'), validate(awardQuoteSchema), controller.awardQuote);

// Contract endpoints are intentionally mounted under /contracts in app.js
// Booking organizer/vendor/admin access is enforced in the service and route middleware.


router.get('/:bookingId', authenticate, requireRole('organizer', 'vendor', 'admin'), validate(bookingIdSchema), controller.getBooking);

module.exports = router;
