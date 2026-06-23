const { Router } = require('express');
const authenticate = require('../shared/middleware/auth.middleware');
const requireRole = require('../shared/middleware/role.middleware');
const validate = require('../shared/middleware/validate.middleware');
const controller = require('./contract-booking.controller');
const {
  createContractSchema,
  contractIdSchema,
  contractStatusSchema,
  contractSignSchema,
  contractBookingIdSchema
} = require('./contract-booking.validator');

const router = Router();

router.post(
  '/:bookingId',
  authenticate,
  requireRole('organizer', 'admin'),
  validate(createContractSchema),
  controller.createContract
);

router.get(
  '/:bookingId',
  authenticate,
  requireRole('organizer', 'vendor', 'admin'),
  validate(contractBookingIdSchema),
  controller.getContractByBooking
);

router.patch(
  '/:contractId/status',
  authenticate,
  requireRole('organizer', 'vendor', 'admin'),
  validate(contractStatusSchema),
  controller.updateContractStatus
);

router.patch(
  '/:contractId/sign-organizer',
  authenticate,
  requireRole('organizer', 'admin'),
  validate(contractSignSchema),
  controller.signContractOrganizer
);

router.patch(
  '/:contractId/sign-vendor',
  authenticate,
  requireRole('vendor', 'admin'),
  validate(contractSignSchema),
  controller.signContractVendor
);

module.exports = router;
