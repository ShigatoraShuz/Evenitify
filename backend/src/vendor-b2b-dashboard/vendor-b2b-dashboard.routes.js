const { Router } = require('express');
const authenticate = require('../shared/middleware/auth.middleware');
const requireRole = require('../shared/middleware/role.middleware');
const validate = require('../shared/middleware/validate.middleware');
const controller = require('./vendor-b2b-dashboard.controller');
const {
  profileUpdateSchema,
  createServiceSchema,
  updateServiceSchema,
  serviceIdSchema,
  bookingStatusSchema,
  bookingIdSchema
} = require('./vendor-b2b-dashboard.validator');

const router = Router();

router.get('/profile', authenticate, requireRole('vendor', 'admin'), controller.getProfile);
router.patch('/profile', authenticate, requireRole('vendor'), validate(profileUpdateSchema), controller.updateProfile);

router.get('/services', authenticate, requireRole('vendor'), controller.listServices);
router.post('/services', authenticate, requireRole('vendor'), validate(createServiceSchema), controller.createService);
router.patch('/services/:serviceId', authenticate, requireRole('vendor'), validate(updateServiceSchema), controller.updateService);

router.get('/bookings', authenticate, requireRole('vendor'), controller.listB2BBookings);
router.get('/bookings/:bookingId', authenticate, requireRole('vendor'), validate(bookingIdSchema), controller.getBookingDetail);
router.patch('/bookings/:bookingId/status', authenticate, requireRole('vendor'), validate(bookingStatusSchema), controller.updateBookingStatus);

module.exports = router;
