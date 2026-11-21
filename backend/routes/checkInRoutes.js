const express = require('express');
const { getCurrent, addCheckIn, getMyCheckIns } = require('../controllers/checkInController');
const { protect, requireRole } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/current', protect, requireRole('student'), getCurrent);
router.get('/mine', protect, requireRole('student'), getMyCheckIns);
router.post('/', protect, requireRole('student'), addCheckIn);

module.exports = router;
