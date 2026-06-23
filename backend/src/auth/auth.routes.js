const { Router } = require('express');
const router = Router();

router.get('/me', (req, res) => res.json({ success: true, data: null }));
router.post('/register', (req, res) => res.status(201).json({ success: true, data: null }));
router.post('/login', (req, res) => res.json({ success: true, data: null }));
router.post('/sync-profile', (req, res) => res.json({ success: true, data: null }));

module.exports = router;
