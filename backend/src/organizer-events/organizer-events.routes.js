const { Router } = require('express');
const authenticate = require('../shared/middleware/auth.middleware');
const requireRole = require('../shared/middleware/role.middleware');
const validate = require('../shared/middleware/validate.middleware');
const controller = require('./organizer-events.controller');
const bookingController = require('../contract-booking/contract-booking.controller');
const { createEventSchema, updateEventSchema, eventIdSchema } = require('./organizer-events.validator');
const { eventBookingsSchema } = require('../contract-booking/contract-booking.validator');

const router = Router();

router.get('/', authenticate, requireRole('organizer', 'admin'), controller.listEvents);
router.post('/', authenticate, requireRole('organizer'), validate(createEventSchema), controller.createEvent);
router.get('/:eventId', authenticate, requireRole('organizer', 'admin'), validate(eventIdSchema), controller.getEvent);
router.get('/:eventId/portfolio', authenticate, requireRole('organizer', 'admin'), validate(eventIdSchema), controller.getEventPortfolio);
router.patch('/:eventId', authenticate, requireRole('organizer'), validate(updateEventSchema), controller.updateEvent);
router.get('/:eventId/bookings', authenticate, requireRole('organizer', 'admin'), validate(eventBookingsSchema), bookingController.listEventBookings);

module.exports = router;
