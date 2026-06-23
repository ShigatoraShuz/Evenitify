const { Router } = require('express');
const router = Router();

router.post('/', (req, res) => res.status(201).json({ success: true, data: null }));
router.get('/:bookingId', (req, res) => res.json({ success: true, data: null }));

module.exports = router;
