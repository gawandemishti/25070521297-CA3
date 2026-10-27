# 🎓 CampusConnect — Multi-College Event & Club Management Platform

> **"Different Colleges. One Community."**  
> *"Your College Is Your Beginning. The World Is Your Campus."*

CampusConnect is a centralized, full-stack digital ecosystem designed to connect university campuses across India. Rather than serving an isolated institution, CampusConnect unites multiple colleges on a single shared platform—enabling cross-campus event discovery, inter-college competition registration, club memberships, student teammate matchmaking, and institutional governance.

---

## 🏛️ Key Highlights & Multi-College Capabilities

1. **Multi-College Ecosystem**: Multiple colleges coexist in the same persistent MongoDB database (`campusconnect`). Each verified college has an institutional profile, active clubs, published events, and student population.
2. **Participation Scopes**:
   - `Open to All Colleges` (e.g., Pan-India Hackathons & Workshops)
   - `Selected Partner Colleges` (e.g., Regional Robotics Battles)
   - `Internal Only` (Restricted exclusively to students of that institution)
3. **Server-Side Validation**:
   - Prevention of duplicate event registrations via unique compound MongoDB index `{ event: 1, student: 1 }`.
   - Event capacity enforcement and registration deadline checks.
   - Strict server-side Role-Based Access Control (RBAC).
4. **Interactive Role-Based Portals**:
   - **Student Dashboard**: Upcoming event tickets, joined clubs, pending team invitations, personalized event recommendations.
   - **Organizer Console**: Event publisher, attendee check-in manager, club membership reviewer.
   - **College Admin Dashboard**: College profile governance, campus clubs, institutional announcements.
   - **Platform Admin Command Center**: Live telemetry, Recharts analytics (category and geographic distribution), college verification approvals, user moderation.
5. **Teammate Finder & Networking**: Post collaboration requests for hackathons, search peers by specific tech stacks (e.g., Python, React, PyTorch, Figma), and send/accept connection requests.

---

## 🛠️ Mandatory Technology Stack

- **Frontend**: React.js 18, JavaScript (ES6+), HTML5, CSS3, React Router DOM v6, Axios, Lucide React icons, Recharts analytics.
  - *Strictly JavaScript & JSX only. No TypeScript.*
- **Backend**: Node.js v24, Express.js REST API, JSON request/response architecture, Helmet security headers, Express Rate Limiting, bcryptjs, JSON Web Tokens (JWT).
- **Database**: MongoDB, Mongoose ODM, inspected visually using **MongoDB Compass**.
- **Package Management**: npm.

---

## 📂 Project Structure

```
25070521056_CA3/
├── client/                          # React Frontend (Vite)
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── components/              # Navbar, Footer, EventCard, CollegeCard, ClubCard, StudentCard, ProtectedRoute
│   │   ├── context/                 # AuthContext (JWT management & session restoration)
│   │   ├── pages/                   # LandingPage, LoginPage, RegisterPage, EventsPage, EventDetailsPage,
│   │   │                            # CollegesPage, CollegeProfilePage, ClubsPage, ClubDetailsPage,
│   │   │                            # TeammatesPage, ProfilePage, StudentDashboard, OrganizerDashboard,
│   │   │                            # CollegeAdminDashboard, PlatformAdminDashboard
│   │   ├── services/                # Axios API instance with interceptors
│   │   ├── App.jsx                  # Main application routes
│   │   ├── main.jsx                 # React root renderer
│   │   └── index.css                # Navy, indigo & violet design system
│   ├── .env                         # Client environment variables
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js               # Dev server & proxy configuration
│
├── server/                          # Node.js & Express REST Backend
│   ├── config/                      # MongoDB connection (Native & Fallback engine)
│   ├── controllers/                 # authController, eventController, registrationController,
│   │                                # collegeController, clubController, teamController,
│   │                                # connectionController, postController, notificationController,
│   │                                # dashboardController, adminController, userController
│   │   ├── middleware/              # auth.js, roles.js, errorHandler.js
│   │   ├── models/                  # User, College, Event, EventRegistration, Club, ClubMembership,
│   │   │                            # Team, TeamInvitation, Connection, Post, Notification, Report
│   │   ├── routes/                  # Modular Express router endpoints
│   │   ├── scripts/                 # Development seed script (seed.js)
│   │   ├── utils/                   # apiResponse.js (unified response formatter)
│   │   ├── app.js                   # Express application setup, security, routes
│   │   ├── server.js                # Server entry point
│   │   ├── .env                     # Server environment variables
│   │   ├── .env.example
│   │   └── package.json
│
├── .gitignore
├── package.json                     # Root orchestrator scripts
└── README.md                        # Documentation & evaluation manual
```

---

## ⚡ Quick Start & Execution Guide

### Prerequisites
- Node.js (v18+) and npm
- MongoDB Community Server (running on `mongodb://127.0.0.1:27017`)
- MongoDB Compass (for visual verification)

### 1. Database Seeding
To populate MongoDB with **5 demonstration colleges**, all 4 user roles, **11 events**, **8 clubs**, registrations, and collaboration posts:
```bash
npm run seed
```
*(Or inside `server/`: `npm run seed`)*

### 2. Running Backend Server
```bash
npm run dev:server
```
*(Runs Express API on `http://localhost:5000`)*

### 3. Running Frontend Application
```bash
npm run dev:client
```
*(Runs Vite client on `http://localhost:5173`)*

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🔑 Demo Accounts for University Evaluation

All demonstration accounts use the password: `password123`

| Role | Account Name | Email Address | Capabilities |
| :--- | :--- | :--- | :--- |
| **Platform Administrator** | Aditya Verma (Admin) | `admin@campusconnect.edu` | Verify colleges, manage users, view Recharts platform telemetry, resolve reports |
| **College Administrator** | Prof. Rajesh Kulkarni | `admin@apex-tech.edu.in` | Manage Apex Institute profile, publish announcements, view campus clubs |
| **College Administrator** | Dr. Sunita Sharma | `admin@horizon.edu.in` | Manage Horizon College Mumbai profile & announcements |
| **Event Organizer** | Vikram Malhotra | `organizer.apex@campusconnect.edu` | Publish events, view registrations, mark attendee check-ins, approve club requests |
| **Event Organizer** | Ananya Iyer | `organizer.horizon@campusconnect.edu` | Manage Horizon E-Cell & Mumbai competitions |
| **Event Organizer** | Rohan Deshmukh | `organizer.vanguard@campusconnect.edu` | Manage Vanguard Robotics Lab & RoboWars arena |
| **Student (Bengaluru)** | Aarav Mehta | `aarav.student@campusconnect.edu` | Explore events, manage tickets, request club joins, post team requests |
| **Student (Mumbai)** | Pooja Nair | `pooja.student@campusconnect.edu` | Cross-college hackathon registration, AI student collective |
| **Student (Hyderabad)** | Kabir Singhania | `kabir.student@campusconnect.edu` | Hardware engineering, cross-college team member |
| **Student (Delhi)** | Diya Sen | `diya.student@campusconnect.edu` | UI/UX designer, inter-college design jam participant |

> **Tip for Evaluators**: On the `/login` page, click any of the **Quick Evaluation Demo Account** pills to autofill and log in instantly with one click!

---

## 🧭 Inspecting Data with MongoDB Compass

MongoDB Compass is the official graphical client for exploring MongoDB data.

1. Open **MongoDB Compass**.
2. Connect to the connection string:
   ```text
   mongodb://127.0.0.1:27017
   ```
3. Locate and click on the **`campusconnect`** database in the left sidebar.
4. Inspect the collections:
   - **`colleges`**: 5 fictional institutions across Bengaluru, Mumbai, Hyderabad, New Delhi, Chennai.
   - **`events`**: 11 events showing diverse scopes (`all`, `selected_colleges`, `own_college_only`).
   - **`eventregistrations`**: Persistent registrations containing `ticketCode` (e.g., `CC-XXXXXX-XXXX`).
   - **`clubs`**: 8 active clubs with `externalMembershipAllowed` flags.
   - **`clubmemberships`**: Membership requests with statuses (`pending`, `approved`, `rejected`).
   - **`users`**: Verified accounts with bcrypt `passwordHash`, role badges, and skill sets.
   - **`teams`**: Formed hackathon teams (e.g., `Team ByteCraft`).
   - **`posts`**: Student collaboration requests.
   - **`notifications`**: Persistent in-app user notifications.

---

## 🧪 Key Test Scenarios & Verification Matrix

| # | Test Scenario | Expected Outcome | Verification |
| :--- | :--- | :--- | :--- |
| 1 | **Multi-College Discovery** | A student from Mumbai (Horizon) browses events and sees HackBengaluru hosted by Apex Institute. | ✅ Visible on `/events` and `/events/:id` |
| 2 | **Cross-College Registration** | Pooja (Horizon College) registers for HackBengaluru (`scope: all`). | ✅ Success! Issues ticket `CC-XXXXXX` and increments count in MongoDB. |
| 3 | **Scope Restriction Enforcement** | Pooja attempts to register for Apex Intra-College Algorithm Championship (`scope: own_college_only`). | ✅ **Rejected with HTTP 403 Forbidden**: *"Eligibility restriction: This event is exclusively open to students of Apex Institute of Technology."* |
| 4 | **Duplicate Registration Prevention** | A student attempts to register for the same event twice. | ✅ **Rejected with HTTP 409 Conflict**: Returns existing ticket code. |
| 5 | **Capacity Enforcement** | Registration on an event where `registeredCount >= capacity`. | ✅ **Rejected with HTTP 400**: *"Sorry, this event has reached maximum capacity."* |
| 6 | **Organizer Management** | Vikram (Apex Organizer) logs into `/organizer/dashboard`. | ✅ Can create events, view attendee list, toggle check-ins, approve club members. |
| 7 | **College Verification Workflow** | Platform Admin logs in, opens `/platform-admin/dashboard`, and views Zenith Global Institute (`status: pending`). | ✅ Admin clicks "Approve & Verify". Status updates to `verified` in MongoDB. |
| 8 | **Teammate Finder & Posts** | Students post collaboration requests with required skills; peers reply. | ✅ Persistent in `posts` collection; visible on `/teammates`. |

---

## 📡 REST API Endpoints Overview

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register student account (enforces `role: 'student'`)
- `POST /api/auth/login` — Authenticate and receive JWT
- `GET /api/auth/me` — Fetch currently authenticated user
- `PATCH /api/auth/change-password` — Change password
- `POST /api/auth/logout` — Logout session

### Events & Registrations (`/api/events`, `/api/registrations`)
- `GET /api/events` — Filter events by college, category, scope, mode, pricing, date
- `GET /api/events/:id` — Event details + user registration status
- `POST /api/events` — Create event (Organizer, College Admin, Platform Admin)
- `PATCH /api/events/:id` — Update event details
- `DELETE /api/events/:id` — Soft-cancel or delete draft
- `POST /api/events/:id/register` — Register for event with scope and capacity check
- `GET /api/events/:id/registrations` — View attendees list (Organizer)
- `GET /api/registrations/me` — Student ticket history
- `DELETE /api/registrations/:id` — Cancel registration and release seat

### Colleges (`/api/colleges`)
- `GET /api/colleges` — Search colleges by city/state with event/club counts
- `GET /api/colleges/:id` — College profile details
- `POST /api/colleges` — Submit college profile
- `PATCH /api/colleges/:id` — Update profile or add announcements

### Clubs (`/api/clubs`)
- `GET /api/clubs` — Filter clubs by category, college, cross-college open status
- `GET /api/clubs/:id` — Club profile + membership status
- `POST /api/clubs/:id/membership-requests` — Request to join club
- `GET /api/clubs/:id/membership-requests` — Review membership requests
- `PATCH /api/clubs/:id/membership-requests/:requestId` — Approve / reject request

### Platform Administration (`/api/admin`)
- `GET /api/admin/colleges/pending` — List unverified colleges
- `PATCH /api/admin/colleges/:id/verification` — Approve / reject / suspend college
- `GET /api/admin/users` — List platform users with filter
- `PATCH /api/admin/users/:id/status` — Suspend / activate account or change role
- `GET /api/admin/reports` — Content moderation reports

### Dashboards (`/api/dashboard`)
- `GET /api/dashboard/student` — Student statistics, tickets, recommendations
- `GET /api/dashboard/organizer` — Organizer statistics, events, attendee numbers
- `GET /api/dashboard/college-admin` — Authorized college statistics and clubs
- `GET /api/dashboard/platform-admin` — Global telemetry and Recharts aggregate distributions

---

## 🛡️ Security Best Practices

1. **Password Protection**: Passwords salted and hashed with `bcryptjs` (cost factor 10).
2. **JWT Security**: Signed with server secret; passwords excluded from API outputs (`select: false` and `.toJSON()` deletion).
3. **HTTP Headers**: Armed with `helmet` for standard security headers against XSS and clickjacking.
4. **Rate Limiting**: `express-rate-limit` prevents brute-force attempts on `/api/auth`.
5. **No Frontend Privilege Escalation**: Role assignments and college ownership verified strictly on the server.

---

## 📜 License & Academic Integrity

Developed for academic evaluation and demonstration of advanced agentic full-stack engineering. Built with React.js, Node.js, Express.js, Mongoose, and MongoDB.

