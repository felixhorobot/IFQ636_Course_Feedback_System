const mongoose = require('mongoose');

// pace and workload: 3 mean just right. clarity: 5 mean very clear
const checkInSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    week: { type: Number, required: true },
    pace: { type: Number, required: true, min: 1, max: 5 },
    clarity: { type: Number, required: true, min: 1, max: 5 },
    workload: { type: Number, required: true, min: 1, max: 5 },
    request: { type: String, maxlength: 500 },
    anonymous: { type: Boolean, default: false },
    status: { type: String, enum: ['Open', 'Replied'], default: 'Open' },
    reply: { type: String },
    archived: { type: Boolean, default: false },
}, { timestamps: true });

// one check-in for each student in a week
checkInSchema.index({ student: 1, week: 1 }, { unique: true });

module.exports = mongoose.model('CheckIn', checkInSchema);
