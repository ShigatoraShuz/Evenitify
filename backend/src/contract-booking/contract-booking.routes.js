const { Router } = require('express');
const authenticate = require('../shared/middleware/auth.middleware');
const requireRole = require('../shared/middleware/role.middleware');
const validate = require('../shared/middleware/validate.middleware');
const controller = require('./contract-booking.controller');
const { createBookingSchema, bookingIdSchema, eventBookingsSchema } = require('./contract-booking.validator');

const router = Router();

router.post('/', authenticate, requireRole('organizer'), validate(createBookingSchema), controller.createBooking);
router.get('/:bookingId', authenticate, requireRole('organizer', 'vendor', 'admin'), validate(bookingIdSchema), controller.getBooking);

module.exports = router;
