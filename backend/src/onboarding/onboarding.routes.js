const { Router } = require('express');
const authenticate = require('../shared/middleware/auth.middleware');
const validate = require('../shared/middleware/validate.middleware');
const controller = require('./onboarding.controller');
const { onboardingCompleteSchema } = require('./onboarding.validator');

const router = Router();

router.get('/status', authenticate, controller.getStatus);
router.post('/complete', authenticate, validate(onboardingCompleteSchema), controller.complete);

module.exports = router;
