# Course Feedback System

A small web app for one QUT unit. Each week a student sends a short check-in to the teaching team. The check-in asks if the class pace is too slow or too fast, how clear the explanation was, and if the assignment workload is too much. The student can also add a special request and can choose to stay anonymous. The teaching team can see the result of each week and reply, so they can change the teaching while the semester is still running and do not need to wait for the end of semester survey or long email.

This project is built on top of the IFQ636 starter project (task manager with login).

**Deployment URL:** http://3.26.53.221:3000 (AWS EC2, instance ID `i-09c43950488fbf683`)
The public IP changes when the instance is stopped and started again, see Known limitations.

## User roles and main workflows

| Role | What they can do |
|---|---|
| Student | Register, log in, send one check-in each week, edit it before staff reply, see own check-ins and replies |
| Teaching staff | Log in with a seeded account, see the check-ins and average ratings of a week, reply, archive a replied check-in |

- **W1 Student weekly check-in:** log in, answer 3 questions from 1 to 5, add a request if needed, send.
- **W2 Staff response (main workflow):** log in, pick a week, read the averages and check-ins, reply, then the student sees the reply and the check-in is locked.

## Architecture summary

```
Browser (React + Tailwind)  ->  Express API (Node.js)  ->  MongoDB Atlas (Mongoose)
        port 3000                    port 5001
```

- **Frontend** (`frontend/`): React pages for login, register, profile, weekly check-in, my check-ins and the staff dashboard. Shared components are `RatingInput` and `CheckInCard`. QUT colours are set once in `tailwind.config.js`.
- **Backend** (`backend/`): Express routes, controllers and models. Login uses JWT. `protect` checks the token and `requireRole` checks the role, so a student gets 403 on a staff API.
- **Database:** two collections, `users` (with a `role` field) and `checkins`. A unique index on student and week makes sure one student only has one check-in each week.
- **Week number** is worked out by the server from `SEMESTER_START` in `.env`, so the student does not pick a week.
- **Anonymous check-in:** the database still keeps the student ID, but the staff API does not send the name or email to the browser.

Main API:

| Method | Path | Role | Use |
|---|---|---|---|
| POST | `/api/auth/register`, `/api/auth/login` | everyone | create account (always student), log in |
| GET | `/api/checkins/current` | student | this week and my check-in for it |
| POST | `/api/checkins` | student | send this week's check-in |
| GET | `/api/checkins/mine` | student | my check-ins and replies |
| PUT | `/api/checkins/:id` | student | edit my check-in while it is Open |
| GET | `/api/checkins?week=3&archived=false` | staff | check-ins and averages of a week |
| PUT | `/api/checkins/:id/reply` | staff | reply, status becomes Replied |
| PUT | `/api/checkins/:id/archive` | staff | hide a replied check-in from the list |

## Local setup

You need Node.js 18 or newer, Git and a MongoDB Atlas database.

1. Clone the repository.
   ```
   git clone https://github.com/felixhorobot/IFQ636_Course_Feedback_System.git
   cd IFQ636_Course_Feedback_System
   ```
2. Backend
   ```
   cd backend
   npm install
   cp .env.example .env
   ```
   Fill in `.env`:

   | Name | Meaning |
   |---|---|
   | `MONGO_URI` | Atlas connection string, database name `coursefeedback` |
   | `JWT_SECRET` | any long random text |
   | `PORT` | `5001` |
   | `STAFF_NAME`, `STAFF_EMAIL`, `STAFF_PASSWORD` | the teaching staff account made by the seed script |
   | `SEMESTER_START` | first day of week 1, for example `2026-11-02` |

   Then make the staff account and start the API:
   ```
   npm run seed
   npm run dev
   ```
3. Frontend, in a second terminal
   ```
   cd frontend
   npm install
   npm start
   ```
   Open http://localhost:3000.
4. Tests (they use a separate `coursefeedback_test` database)
   ```
   cd backend
   npm test
   ```

## Deployment on EC2 (manual, no CI/CD)

The app runs on the university AWS account, Ubuntu EC2 (t2.micro), set up like Module 2.10.

1. In the `student-allowed` security group, add inbound rules for SSH (22), Custom TCP 3000 and Custom TCP 5001. The source is **My IP** only, not 0.0.0.0/0.
2. In MongoDB Atlas, Network Access, allow the EC2 to connect (see Known limitations).
3. Connect with PuTTY or `ssh` and install the tools:
   ```
   sudo apt update
   sudo apt install git nodejs npm -y
   sudo npm install -g pm2
   ```
4. Get the code and install the backend:
   ```
   git clone https://github.com/felixhorobot/IFQ636_Course_Feedback_System.git ~/app
   cd ~/app/backend
   npm ci --omit=dev
   nano .env        # same names as the local .env, never commit this file
   npm run seed
   ```
5. The t2.micro has only 1 GB memory, so the React build is made on a PC (`npm run build` in `frontend`) and copied to `~/app/frontend/build` with `pscp` or `scp`.
6. Start both parts with pm2 and keep them running after a reboot:
   ```
   pm2 start ~/app/backend/server.js --name cfs-backend
   pm2 serve ~/app/frontend/build 3000 --spa --name cfs-frontend
   pm2 startup
   pm2 save
   ```
7. Open `http://<EC2 public IP>:3000`.

The frontend calls the API on the same host as the page (`axiosConfig.jsx`), so nothing needs to change in the code when the IP changes.

## Known limitations

- The EC2 public IP changes after the instance is stopped and started, so the URL above changes too. pm2 starts the app again by itself after a reboot.
- MongoDB Atlas allows every IP address, because the EC2 IP is not fixed. The database is still protected by its user name and a strong password.
- Inbound rules only allow My IP, so other people need their own IP added before they can open the URL.
- One unit only. Coordinator and tutor share one staff role with the same rights.
- Anonymous means anonymous to the teaching staff only. The database still knows who sent it.
- One reply for each check-in, no chat. There is no email or push notification, the student sees the reply after login.
- The starter project uses old packages (for example Create React App and Mongoose 6) and `npm audit` shows warnings. They were not upgraded, as the unit does not ask for it.
- Publishing a reply as a FAQ (CFS-16) is not built.

## Project links

- Jira: https://homingfelixho.atlassian.net/jira/software/projects/CFS
- Figma: https://www.figma.com/design/ubRRj9UZFnVhBQlFE0rfYy
