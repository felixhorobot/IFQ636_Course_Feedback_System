const CheckIn = require('../models/CheckIn');

// work out teaching week from semester start date in .env, null if semester not start yet
const getWeek = (today = new Date()) => {
    const days = Math.floor((today - new Date(process.env.SEMESTER_START)) / (1000 * 60 * 60 * 24));
    if (days < 0) return null;
    return Math.floor(days / 7) + 1;
};

const getCurrent = async (req, res) => {
    try {
        const week = getWeek();
        const checkIn = await CheckIn.findOne({ student: req.user.id, week });
        res.json({ week, checkIn });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addCheckIn = async (req, res) => {
    const { pace, clarity, workload, request, anonymous } = req.body;
    try {
        const week = getWeek();
        if (!week) return res.status(400).json({ message: 'Check-in is not open yet' });
        const sent = await CheckIn.findOne({ student: req.user.id, week });
        if (sent) return res.status(409).json({ message: 'You already sent check-in for this week' });
        const checkIn = await CheckIn.create({
            student: req.user.id, week, pace, clarity, workload, request, anonymous,
        });
        res.status(201).json(checkIn);
    } catch (error) {
        // rating not 1 to 5 or request too long
        if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
        res.status(500).json({ message: error.message });
    }
};

const getMyCheckIns = async (req, res) => {
    try {
        const checkIns = await CheckIn.find({ student: req.user.id }).sort({ week: -1 });
        res.json(checkIns);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getWeek, getCurrent, addCheckIn, getMyCheckIns };
