// make the staff account. staff can not register by themself
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seed = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const exists = await User.findOne({ email: process.env.STAFF_EMAIL });
    if (exists) {
        console.log('Staff account already exist');
    } else {
        await User.create({
            name: process.env.STAFF_NAME,
            email: process.env.STAFF_EMAIL,
            password: process.env.STAFF_PASSWORD,
            role: 'staff',
        });
        console.log('Staff account created');
    }
    await mongoose.disconnect();
};

seed();
