require('dotenv').config();
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../server');
const User = require('../models/User');
const CheckIn = require('../models/CheckIn');
const { getWeek } = require('../controllers/checkInController');

chai.use(chaiHttp);
const { expect } = chai;

// use test database so real data is not touch
const TEST_DB = process.env.MONGO_URI.replace('/coursefeedback', '/coursefeedback_test');

const makeStudent = async (name) => {
    const user = await User.create({ name, email: `${name}@test.com`, password: 'Pass1234' });
    return jwt.sign({ id: user.id }, process.env.JWT_SECRET);
};

const send = (token, body) => chai.request(app)
    .post('/api/checkins')
    .set('Authorization', `Bearer ${token}`)
    .send(body);

describe('Weekly check-in (CFS-9, CFS-10, CFS-11)', () => {
    let amy;
    let ben;

    before(async () => {
        await mongoose.connect(TEST_DB);
        await CheckIn.init();
    });
    after(() => mongoose.disconnect());
    beforeEach(async () => {
        process.env.SEMESTER_START = '2026-01-05';
        await User.deleteMany({});
        await CheckIn.deleteMany({});
        amy = await makeStudent('amy');
        ben = await makeStudent('ben');
    });

    it('is week 2 when today is 10 days after semester start', () => {
        process.env.SEMESTER_START = '2026-11-02';
        expect(getWeek(new Date('2026-11-12'))).to.equal(2);
    });

    it('is not open before semester start', async () => {
        process.env.SEMESTER_START = '2099-01-01';
        const res = await send(amy, { pace: 3, clarity: 3, workload: 3 });
        expect(res).to.have.status(400);
    });

    it('reject second check-in in same week', async () => {
        await send(amy, { pace: 3, clarity: 3, workload: 3 });
        const res = await send(amy, { pace: 3, clarity: 3, workload: 3 });
        expect(res).to.have.status(409);
    });

    it('reject rating 6 and save nothing', async () => {
        const res = await send(amy, { pace: 6, clarity: 3, workload: 3 });
        expect(res).to.have.status(400);
        expect(await CheckIn.countDocuments()).to.equal(0);
    });

    it('student only see own check-ins', async () => {
        await send(amy, { pace: 3, clarity: 3, workload: 3 });
        await send(ben, { pace: 2, clarity: 4, workload: 3 });
        const res = await chai.request(app).get('/api/checkins/mine').set('Authorization', `Bearer ${amy}`);
        expect(res.body).to.have.length(1);
    });
});
