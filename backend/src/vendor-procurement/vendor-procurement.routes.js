const { Router } = require('express');
const router = Router();

router.get('/vendors', (req, res) => res.json({ success: true, data: [] }));
router.get('/vendors/:vendorId', (req, res) => res.json({ success: true, data: null }));
router.get('/events/:eventId/requirements', (req, res) => res.json({ success: true, data: [] }));
router.post('/events/:eventId/requirements', (req, res) => res.status(201).json({ success: true, data: null }));
router.patch('/requirements/:requirementId', (req, res) => res.json({ success: true, data: null }));
router.delete('/requirements/:requirementId', (req, res) => res.status(204).send());

module.exports = router;
