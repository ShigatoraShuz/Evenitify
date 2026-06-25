const { Router } = require('express');
const multer = require('multer');
const authenticate = require('../shared/middleware/auth.middleware');
const requireRole = require('../shared/middleware/role.middleware');
const AppError = require('../shared/utils/appError');
const controller = require('./phase8.controller');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.jpg', '.jpeg', '.png', '.txt'];
    const ext = file.originalname.substring(file.originalname.lastIndexOf('.')).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new AppError('Invalid file type. Allowed: ' + allowed.join(', '), 400, 'INVALID_FILE_TYPE'));
    }
  }
});
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

router.post('/organizer/vendor-requests', authenticate, requireRole('organizer', 'admin'), controller.createOrganizerVendorRequest);
router.get('/organizer/vendor-requests', authenticate, requireRole('organizer', 'admin'), controller.listOrganizerVendorRequests);
router.get('/organizer/vendor-requests/:requestId', authenticate, requireRole('organizer', 'admin'), controller.fetchOrganizerVendorRequest);
router.get('/organizer/vendor-requests/:requestId/messages', authenticate, requireRole('organizer', 'admin'), controller.listOrganizerVendorMessages);
router.post('/organizer/vendor-requests/:requestId/messages', authenticate, requireRole('organizer', 'admin'), controller.createOrganizerVendorMessage);
router.patch('/organizer/vendor-requests/:requestId/accept', authenticate, requireRole('organizer', 'admin'), controller.acceptOrganizerVendorRequest);
router.patch('/organizer/vendor-requests/:requestId/reject', authenticate, requireRole('organizer', 'admin'), controller.rejectOrganizerVendorRequest);
router.patch('/organizer/vendor-requests/:requestId/confirm', authenticate, requireRole('organizer', 'admin'), controller.confirmOrganizerVendorRequest);
router.get('/organizer/vendor-requests/:requestId/timeline', authenticate, requireRole('organizer', 'admin'), controller.getOrganizerVendorTimeline);

router.get('/vendors/:vendorId/availability', authenticate, controller.getVendorAvailability);
router.get('/vendor/availability', authenticate, controller.getMyAvailability);
router.patch('/vendor/availability/status', authenticate, controller.updateMyAvailabilityStatus);

router.get('/vendor/requests/:requestId/messages', authenticate, controller.listVendorRequestMessages);
router.post('/vendor/requests/:requestId/messages', authenticate, controller.createVendorRequestMessage);

module.exports = router;
