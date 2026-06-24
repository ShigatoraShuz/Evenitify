const { Router } = require('express');
const authenticate = require('../shared/middleware/auth.middleware');
const validate = require('../shared/middleware/validate.middleware');
const controller = require('./auth.controller');
const { registerSchema, loginSchema, syncProfileSchema, refreshSchema } = require('./auth.validator');

const router = Router();

router.post('/register', validate(registerSchema), controller.register);
router.post('/login', validate(loginSchema), controller.login);
router.get('/me', authenticate, controller.getMe);
router.post('/sync-profile', authenticate, validate(syncProfileSchema), controller.syncProfile);
router.post('/refresh', validate(refreshSchema), controller.refreshSession);
router.post('/logout', controller.logout);

module.exports = router;
