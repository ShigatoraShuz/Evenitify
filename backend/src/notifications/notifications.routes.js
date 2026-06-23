const { Router } = require('express');
const authenticate = require('../shared/middleware/auth.middleware');
const validate = require('../shared/middleware/validate.middleware');
const controller = require('./notifications.controller');
const { notificationIdSchema, paginationSchema } = require('./notifications.validator');

const router = Router();

router.use(authenticate);

router.get('/', validate(paginationSchema), controller.listNotifications);
router.get('/unread-count', controller.getUnreadCount);
router.patch('/:notificationId/read', validate(notificationIdSchema), controller.markAsRead);
router.patch('/read-all', controller.markAllAsRead);

module.exports = router;
