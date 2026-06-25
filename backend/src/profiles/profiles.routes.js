const { Router } = require('express');
const authenticate = require('../shared/middleware/auth.middleware');
const requireRole = require('../shared/middleware/role.middleware');
const validate = require('../shared/middleware/validate.middleware');
const controller = require('./profiles.controller');
const { organizerProfileSchema, adminSettingsSchema } = require('./profiles.validator');

const router = Router();

router.get('/organizer/profile', authenticate, requireRole('organizer', 'admin'), controller.getOrganizerProfile);
router.patch('/organizer/profile', authenticate, requireRole('organizer', 'admin'), validate(organizerProfileSchema), controller.updateOrganizerProfile);
router.get('/admin/settings', authenticate, requireRole('admin'), controller.getAdminSettings);
router.patch('/admin/settings', authenticate, requireRole('admin'), validate(adminSettingsSchema), controller.updateAdminSettings);

module.exports = router;
