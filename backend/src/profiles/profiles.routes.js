const { Router } = require('express');
const authenticate = require('../shared/middleware/auth.middleware');
const controller = require('./profiles.controller');

const router = Router();

router.get('/organizer/profile', authenticate, controller.getOrganizerProfile);
router.patch('/organizer/profile', authenticate, controller.updateOrganizerProfile);
router.get('/admin/settings', authenticate, controller.getAdminSettings);
router.patch('/admin/settings', authenticate, controller.updateAdminSettings);

module.exports = router;
