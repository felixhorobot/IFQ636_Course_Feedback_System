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

const updateMyCheckIn = async (req, res) => {
    const { pace, clarity, workload, request, anonymous } = req.body;
    try {
        const checkIn = await CheckIn.findOne({ _id: req.params.id, student: req.user.id });
        if (!checkIn) return res.status(404).json({ message: 'Check-in not found' });
        // after staff reply, student can not change it
        if (checkIn.status === 'Replied') {
            return res.status(409).json({ message: 'Staff already replied, so this check-in is locked' });
        }
        checkIn.pace = pace;
        checkIn.clarity = clarity;
        checkIn.workload = workload;
        checkIn.request = request;
        checkIn.anonymous = anonymous;
        const updated = await checkIn.save();
        res.json(updated);
    } catch (error) {
        if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
        res.status(500).json({ message: error.message });
    }
};

const getWeekCheckIns = async (req, res) => {
    try {
        const week = Number(req.query.week) || getWeek() || 1;
        const all = await CheckIn.find({ week }).populate('student', 'name email');

        // average use every check-in in the week, archived one also count
        let averages = null;
        if (all.length > 0) {
            averages = {};
            for (const key of ['pace', 'clarity', 'workload']) {
                const total = all.reduce((sum, c) => sum + c[key], 0);
                averages[key] = Math.round((total / all.length) * 10) / 10;
            }
        }

        const list = req.query.archived === 'true' ? all : all.filter((c) => !c.archived);
        // for anonymous check-in, do not send student name and email to browser
        const checkIns = list.map((c) => {
            const item = c.toObject();
            if (item.anonymous) item.student = null;
            return item;
        });
        res.json({ week, currentWeek: getWeek(), count: all.length, averages, checkIns });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const replyToCheckIn = async (req, res) => {
    const reply = (req.body.reply || '').trim();
    if (!reply) return res.status(400).json({ message: 'Please write a reply before sending' });
    try {
        const checkIn = await CheckIn.findById(req.params.id);
        if (!checkIn) return res.status(404).json({ message: 'Check-in not found' });
        if (checkIn.status === 'Replied') return res.status(409).json({ message: 'This check-in already has a reply' });
        checkIn.reply = reply;
        checkIn.status = 'Replied';
        await checkIn.save();
        res.json({ message: 'Reply sent' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const archiveCheckIn = async (req, res) => {
    try {
        const checkIn = await CheckIn.findById(req.params.id);
        if (!checkIn) return res.status(404).json({ message: 'Check-in not found' });
        // only archive after staff reply
        if (checkIn.status !== 'Replied') {
            return res.status(409).json({ message: 'Only replied check-in can be archived' });
        }
        checkIn.archived = true;
        await checkIn.save();
        res.json({ message: 'Check-in archived' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getWeek, getCurrent, addCheckIn, getMyCheckIns, updateMyCheckIn, getWeekCheckIns, replyToCheckIn, archiveCheckIn,
};
