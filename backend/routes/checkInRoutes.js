const express = require('express');
const {
    getCurrent, addCheckIn, getMyCheckIns, updateMyCheckIn, getWeekCheckIns, replyToCheckIn, archiveCheckIn,
} = require('../controllers/checkInController');
const { protect, requireRole } = require('../middleware/authMiddleware');
const router = express.Router();

// student
router.get('/current', protect, requireRole('student'), getCurrent);
router.get('/mine', protect, requireRole('student'), getMyCheckIns);
router.post('/', protect, requireRole('student'), addCheckIn);
router.put('/:id', protect, requireRole('student'), updateMyCheckIn);

// teaching staff
router.get('/', protect, requireRole('staff'), getWeekCheckIns);
router.put('/:id/reply', protect, requireRole('staff'), replyToCheckIn);
router.put('/:id/archive', protect, requireRole('staff'), archiveCheckIn);

module.exports = router;
