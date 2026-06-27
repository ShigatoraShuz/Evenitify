const { Router } = require('express');
const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

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
  bookingIdSchema,
  requestChangesSchema,
  submitQuoteSchema
} = require('./vendor-b2b-dashboard.validator');

const router = Router();

router.get('/profile', authenticate, requireRole('vendor', 'admin'), controller.getProfile);
router.patch('/profile', authenticate, requireRole('vendor'), validate(profileUpdateSchema), controller.updateProfile);

router.get('/services', authenticate, requireRole('vendor'), controller.listServices);
router.post('/services', authenticate, requireRole('vendor'), validate(createServiceSchema), controller.createService);
router.post('/services/upload-image', authenticate, requireRole('vendor'), upload.single('image'), controller.uploadServiceImage);
router.patch('/services/:serviceId', authenticate, requireRole('vendor'), validate(updateServiceSchema), controller.updateService);
router.delete('/services/:serviceId', authenticate, requireRole('vendor'), validate(serviceIdSchema), controller.deleteService);

router.get('/bookings', authenticate, requireRole('vendor'), controller.listB2BBookings);
router.get('/bookings/:bookingId', authenticate, requireRole('vendor'), validate(bookingIdSchema), controller.getBookingDetail);
router.patch('/bookings/:bookingId/status', authenticate, requireRole('vendor'), validate(bookingStatusSchema), controller.updateBookingStatus);
router.post('/bookings/:bookingId/quote', authenticate, requireRole('vendor'), validate(submitQuoteSchema), controller.submitQuote);

router.get('/requests', authenticate, requireRole('vendor'), controller.listVendorRequests);
router.get('/requests/:bookingId', authenticate, requireRole('vendor'), validate(bookingIdSchema), controller.getVendorRequestDetail);
router.patch('/requests/:bookingId/view', authenticate, requireRole('vendor'), validate(bookingIdSchema), controller.viewVendorRequest);
router.patch('/requests/:bookingId/accept', authenticate, requireRole('vendor'), validate(bookingIdSchema), controller.acceptVendorRequest);
router.patch('/requests/:bookingId/reject', authenticate, requireRole('vendor'), validate(bookingIdSchema), controller.rejectVendorRequest);
router.patch('/requests/:bookingId/request-changes', authenticate, requireRole('vendor'), validate(requestChangesSchema), controller.requestChangesVendorRequest);

module.exports = router;
