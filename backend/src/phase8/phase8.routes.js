const { Router } = require('express');
const multer = require('multer');
const authenticate = require('../shared/middleware/auth.middleware');
const controller = require('./phase8.controller');

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.get('/events/:eventId/planning-timeline', authenticate, controller.getPlanningTimeline);
router.get('/events/:eventId/budget-center', authenticate, controller.getBudgetCenter);
router.get('/admin/analytics/operations', authenticate, controller.getOperationalAnalytics);
router.get('/audit/activity', authenticate, controller.getAuditActivity);
router.get('/realtime/snapshot', authenticate, controller.getRealtimeSnapshot);
router.get('/search/global', authenticate, controller.globalSearch);

router.get('/documents', authenticate, controller.listDocuments);
router.post('/documents/upload', authenticate, upload.single('file'), controller.uploadDocument);

router.get('/bookings/:bookingId/messages', authenticate, controller.listBookingMessages);
router.post('/bookings/:bookingId/messages', authenticate, controller.createBookingMessage);

router.get('/vendors/:vendorId/availability', authenticate, controller.getVendorAvailability);
router.get('/vendor/availability', authenticate, controller.getMyAvailability);
router.patch('/vendor/availability/status', authenticate, controller.updateMyAvailabilityStatus);

module.exports = router;
