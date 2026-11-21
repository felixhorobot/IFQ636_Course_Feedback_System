require('dotenv').config();
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../server');
const User = require('../models/User');
const CheckIn = require('../models/CheckIn');

chai.use(chaiHttp);
const { expect } = chai;

// use test database so real data is not touch
const TEST_DB = process.env.MONGO_URI.replace('/coursefeedback', '/coursefeedback_test');

const makeUser = async (name, role) => {
    const user = await User.create({ name, email: `${name}@test.com`, password: 'Pass1234', role });
    return { id: user.id, token: jwt.sign({ id: user.id }, process.env.JWT_SECRET) };
};

const call = (method, url, who, body) => chai.request(app)[method](url)
    .set('Authorization', `Bearer ${who.token}`)
    .send(body);

describe('Staff response and edit lock (CFS-12 to CFS-15)', () => {
    let amy;
    let ben;
    let cat;
    let staff;

    before(async () => {
        await mongoose.connect(TEST_DB);
        await CheckIn.init();
    });
    after(() => mongoose.disconnect());
    beforeEach(async () => {
        process.env.SEMESTER_START = '2026-01-05';
        await User.deleteMany({});
        await CheckIn.deleteMany({});
        amy = await makeUser('amy', 'student');
        ben = await makeUser('ben', 'student');
        cat = await makeUser('cat', 'student');
        staff = await makeUser('sam', 'staff');
    });

    it('student can edit before reply, but not after reply (B3)', async () => {
        const sent = await call('post', '/api/checkins', amy, { pace: 3, clarity: 3, workload: 3 });
        const id = sent.body._id;
        const edit = await call('put', `/api/checkins/${id}`, amy, { pace: 4, clarity: 3, workload: 3 });
        expect(edit).to.have.status(200);

        await call('put', `/api/checkins/${id}/reply`, staff, { reply: 'We will slow down.' });
        const locked = await call('put', `/api/checkins/${id}`, amy, { pace: 5, clarity: 3, workload: 3 });
        expect(locked).to.have.status(409);
        expect((await CheckIn.findById(id)).pace).to.equal(4);
    });

    it('anonymous check-in never send student name or email to staff (C1)', async () => {
        await call('post', '/api/checkins', amy, { pace: 2, clarity: 4, workload: 3, anonymous: true });
        await call('post', '/api/checkins', ben, { pace: 3, clarity: 4, workload: 3 });
        const res = await call('get', '/api/checkins', staff);
        const text = JSON.stringify(res.body);
        expect(text).to.not.include('amy');
        expect(text).to.not.include(amy.id);
        expect(text).to.include('ben');
    });

    it('week average is same as hand calculation (D1)', async () => {
        // pace (1+2+4)/3 = 2.3, clarity (5+5+4)/3 = 4.7, workload (3+3+3)/3 = 3
        await call('post', '/api/checkins', amy, { pace: 1, clarity: 5, workload: 3 });
        await call('post', '/api/checkins', ben, { pace: 2, clarity: 5, workload: 3 });
        await call('post', '/api/checkins', cat, { pace: 4, clarity: 4, workload: 3 });
        const res = await call('get', '/api/checkins', staff);
        expect(res.body.averages).to.deep.equal({ pace: 2.3, clarity: 4.7, workload: 3 });
    });

    it('show empty list for a week with no check-in', async () => {
        const res = await call('get', '/api/checkins?week=1', staff);
        expect(res.body.checkIns).to.have.length(0);
        expect(res.body.averages).to.equal(null);
    });

    it('reject empty reply and second reply', async () => {
        const sent = await call('post', '/api/checkins', amy, { pace: 3, clarity: 3, workload: 3 });
        const id = sent.body._id;
        expect(await call('put', `/api/checkins/${id}/reply`, staff, { reply: '  ' })).to.have.status(400);
        expect(await call('put', `/api/checkins/${id}/reply`, staff, { reply: 'Thanks' })).to.have.status(200);
        expect(await call('put', `/api/checkins/${id}/reply`, staff, { reply: 'Again' })).to.have.status(409);
    });

    it('only archive replied check-in, and archived one still count in average', async () => {
        const sent = await call('post', '/api/checkins', amy, { pace: 5, clarity: 5, workload: 5 });
        const id = sent.body._id;
        expect(await call('put', `/api/checkins/${id}/archive`, staff)).to.have.status(409);
        await call('put', `/api/checkins/${id}/reply`, staff, { reply: 'Noted' });
        expect(await call('put', `/api/checkins/${id}/archive`, staff)).to.have.status(200);
        const res = await call('get', '/api/checkins', staff);
        expect(res.body.checkIns).to.have.length(0);
        expect(res.body.averages.pace).to.equal(5);
    });

    it('student can not use staff API (CFS-8)', async () => {
        expect(await call('get', '/api/checkins', amy)).to.have.status(403);
    });
});
