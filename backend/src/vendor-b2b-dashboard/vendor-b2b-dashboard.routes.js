const { Router } = require('express');
const router = Router();

router.get('/bookings', (req, res) => res.json({ success: true, data: [] }));
router.get('/bookings/:bookingId', (req, res) => res.json({ success: true, data: null }));
router.patch('/bookings/:bookingId/status', (req, res) => res.json({ success: true, data: null }));

module.exports = router;
