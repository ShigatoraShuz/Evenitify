const { Router } = require('express');
const authenticate = require('../shared/middleware/auth.middleware');
const requireRole = require('../shared/middleware/role.middleware');
const validate = require('../shared/middleware/validate.middleware');
const controller = require('./admin-operations.controller');
const {
  vendorVerificationSchema,
  bookingOverrideSchema,
  paginationSchema
} = require('./admin-operations.validator');

const router = Router();

router.use(authenticate, requireRole('admin'));

router.get('/dashboard/summary', controller.getDashboardSummary);

router.get('/users', validate(paginationSchema), controller.listUsers);
router.get('/events', validate(paginationSchema), controller.listEvents);
router.get('/bookings', validate(paginationSchema), controller.listBookings);
router.get('/vendors', validate(paginationSchema), controller.listVendors);

router.patch(
  '/vendors/:vendorId/verification',
  validate(vendorVerificationSchema),
  controller.updateVendorVerification
);

router.patch(
  '/bookings/:bookingId/override-status',
  validate(bookingOverrideSchema),
  controller.overrideBookingStatus
);

module.exports = router;
