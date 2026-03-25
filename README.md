# Fixify — Home Services Booking Platform

A full-stack home services marketplace connecting homeowners in Angeles City, Pampanga with verified service professionals across Plumbing, Electrical, and Cleaning categories.

Built with Angular 21, Node.js, Express.js, and MongoDB Atlas.

---

## Tech Stack

**Frontend**
- Angular 21 (Standalone Components)
- TypeScript 5.x
- Tailwind CSS v4
- Angular Signals

**Backend**
- Node.js v18 LTS
- Express.js v4
- JSON Web Token (JWT)
- bcrypt.js

**Database**
- MongoDB Atlas (Cloud-hosted NoSQL)
- Mongoose v7 ODM

---

## Project Structure
```
FINAL-PROJECT-AWEB/
├── fixify/                 ← Angular 21 frontend
└── fixify-backend/         ← Node.js/Express backend
```

---

## Prerequisites

Make sure you have the following installed before proceeding:

- [Node.js v18 LTS](https://nodejs.org)
- [Angular CLI](https://angular.dev) — install via `npm install -g @angular/cli`
- [Git](https://git-scm.com)
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account and cluster
- [VS Code](https://code.visualstudio.com) (recommended)

---

## 1. Clone the Repository
```bash
git clone https://github.com/yourusername/fixify.git
cd fixify
```

---

## 2. MongoDB Atlas Setup

1. Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas) and log in
2. Create a new project and a free shared cluster
3. Under **Database Access** — create a new database user with a username and password
4. Under **Network Access** — click **Add IP Address** and select **Allow Access from Anywhere** (`0.0.0.0/0`)
5. Under **Databases** — click **Connect** on your cluster → **Connect your application**
6. Copy the connection string — it looks like this:
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```
7. Replace `<username>` and `<password>` with your database user credentials

---

## 3. Backend Setup
```bash
cd fixify-backend
```

### Install dependencies
```bash
npm install
```

### Create environment file

Create a `.env` file in the `fixify-backend` root folder:
```bash
# fixify-backend/.env

MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/fixify-db?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
```

Replace:
- `MONGO_URI` — paste your MongoDB Atlas connection string
- `JWT_SECRET` — any long random string e.g. `fixify_super_secret_2025`
- `PORT` — leave as 5000

### Create Admin Account

Run this once to seed the admin account into the database:
```bash
node createAdmin.js
```

Note the admin email and password printed in the terminal — you will need these to log in as admin.

### Start the backend server
```bash
npm start
```

Or if you have nodemon installed:
```bash
npm run dev
```

The backend will run at `http://localhost:5000`

To verify it is working, open your browser and visit:
```
http://localhost:5000/api/test
```

You should see:
```json
{ "message": "Backend is working!" }
```

---

## 4. Frontend Setup

Open a new terminal window:
```bash
cd fixify
```

### Install dependencies
```bash
npm install
```

### Start the Angular development server
```bash
ng serve
```

The frontend will run at `http://localhost:4200`

Open your browser and visit `http://localhost:4200`

---

## 5. Seed Demo Data (Optional)

To populate the database with realistic demo data simulating one month of platform activity — providers, customers, bookings, reviews, and notifications:
```bash
cd fixify-backend
node seedDemo.js
```

Then seed messages:
```bash
node seedMessages.js
```

### What gets seeded

- 15 providers (12 verified, 3 pending) across Plumbing, Electrical, and Cleaning
- 10 customers with realistic Filipino names
- 37 bookings (completed, in-progress, confirmed, pending, cancelled)
- 16 customer reviews with provider responses
- ~70 notifications
- 15 conversations with ~100 messages

### Demo login credentials

All seeded accounts use the password: `Fixify@2025`

| Role | Email |
|------|-------|
| Customer | adrian.sarmiento@gmail.com |
| Customer | lanieshane.perez@gmail.com |
| Provider (Plumbing) | roberto.delacruz@fixify.ph |
| Provider (Electrical) | edgar.mendoza@fixify.ph |
| Provider (Cleaning) | maria.santos@fixify.ph |

> Admin credentials are set separately via `createAdmin.js`

---

## 6. Running Both Servers

You need **two terminals running simultaneously**:

**Terminal 1 — Backend**
```bash
cd fixify-backend
npm start
```

**Terminal 2 — Frontend**
```bash
cd fixify
ng serve
```

Then open `http://localhost:4200` in your browser.

---

## 7. User Roles

| Role | Access |
|------|--------|
| Customer | Browse providers, book services, pay, confirm completion, leave reviews, messages |
| Provider | Manage profile and services, accept and manage jobs, view earnings, respond to reviews, messages |
| Admin | Verify and suspend providers, manage users, monitor bookings, moderate reviews, platform stats |

---

## 8. Key Features

- Verified provider marketplace — admin approves all providers before they appear on search
- Structured booking lifecycle — pending → confirmed → in-progress → completed
- Escrow payment system — payment held until customer confirms job completion
- Role-based authentication using JWT
- In-app messaging between customers and providers
- Real-time notification bell with unread count
- Star rating and review system tied to verified completed bookings
- Provider and customer dashboards
- Admin dashboard with full platform oversight
- Responsive design — works on desktop and mobile browsers

---

## 9. Environment Variables Reference

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `PORT` | Backend server port (default: 5000) |

---

## 10. Common Issues

**Angular build errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
ng serve
```

**Cannot connect to MongoDB**
- Check your `.env` file has the correct `MONGO_URI`
- Make sure your IP is whitelisted in MongoDB Atlas Network Access
- Make sure your database username and password are correct in the connection string

**Port already in use**
```bash
# Kill process on port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Kill process on port 4200 (Windows)
netstat -ano | findstr :4200
taskkill /PID <PID> /F
```

**Seed script fails**
- Make sure the backend `.env` file exists with a valid `MONGO_URI`
- Make sure you are running the seed scripts from inside the `fixify-backend` folder

---

## 11. Scripts Reference

| Command | Location | Description |
|---------|----------|-------------|
| `npm start` | fixify-backend | Start the Express server |
| `npm run dev` | fixify-backend | Start with nodemon (auto-restart) |
| `node createAdmin.js` | fixify-backend | Create the admin account |
| `node seedDemo.js` | fixify-backend | Seed demo providers, customers, bookings, reviews |
| `node seedMessages.js` | fixify-backend | Seed demo conversations and messages |
| `ng serve` | fixify | Start the Angular dev server |
| `ng build` | fixify | Build for production |

---

## 12. Team

| Name | Role |
|------|------|
| Adrian Sarmiento | Project Manager & Full-Stack Developer |
| Kurt Justine Sicat | Angular Frontend Developer |
| Martin Conrad Villanueva | UI/UX Designer |
| Krisean Tienzo | Technical Writer & Backend Developer |
| Clarence Lane Parungao | UI/UX Designer |

---

## 13. Course

Advanced Dynamic Web Development (6AWEB)
Holy Angel University — School of Computing
March 2026
