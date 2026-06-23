const { Router } = require('express');
const authenticate = require('../shared/middleware/auth.middleware');
const requireRole = require('../shared/middleware/role.middleware');
const validate = require('../shared/middleware/validate.middleware');
const controller = require('./organizer-events.controller');
const { createEventSchema, updateEventSchema, eventIdSchema } = require('./organizer-events.validator');

const router = Router();

router.get('/', authenticate, requireRole('organizer', 'admin'), controller.listEvents);
router.post('/', authenticate, requireRole('organizer'), validate(createEventSchema), controller.createEvent);
router.get('/:eventId', authenticate, requireRole('organizer', 'admin'), validate(eventIdSchema), controller.getEvent);
router.patch('/:eventId', authenticate, requireRole('organizer'), validate(updateEventSchema), controller.updateEvent);

module.exports = router;
