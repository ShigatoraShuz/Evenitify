const { Router } = require('express');
const authenticate = require('../shared/middleware/auth.middleware');
const requireRole = require('../shared/middleware/role.middleware');
const validate = require('../shared/middleware/validate.middleware');
const controller = require('./vendor-procurement.controller');
const {
  createRequirementSchema,
  updateRequirementSchema,
  requirementIdSchema,
  eventIdSchema
} = require('./vendor-procurement.validator');

const router = Router();

router.get('/events/:eventId/requirements', authenticate, requireRole('organizer', 'admin'), validate(eventIdSchema), controller.listRequirements);
router.post('/events/:eventId/requirements', authenticate, requireRole('organizer'), validate(createRequirementSchema), controller.createRequirement);
router.patch('/requirements/:requirementId', authenticate, requireRole('organizer'), validate(updateRequirementSchema), controller.updateRequirement);
router.delete('/requirements/:requirementId', authenticate, requireRole('organizer'), validate(requirementIdSchema), controller.deleteRequirement);

module.exports = router;
