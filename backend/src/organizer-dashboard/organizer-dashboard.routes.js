const { Router } = require('express');
const authenticate = require('../shared/middleware/auth.middleware');
const requireRole = require('../shared/middleware/role.middleware');
const controller = require('./organizer-dashboard.controller');

const router = Router();

router.use(authenticate, requireRole('organizer', 'admin'));

router.get('/', controller.getDashboard);
router.get('/summary', controller.getSummary);
router.get('/events', controller.getEvents);
router.get('/drafts', controller.getDrafts);
router.get('/vendor-requests', controller.getVendorRequests);
router.get('/bookings', controller.getBookings);
router.get('/recommended-vendors', controller.getRecommendedVendors);
router.get('/activities', controller.getActivities);
router.get('/notifications', controller.getNotifications);

module.exports = router;
