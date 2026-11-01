# 🩸 BloodBridge – Blood Donation Portal

A **full-stack MERN mini project** connecting blood donors with hospitals in real time.
Built with React 18 + Vite, Node/Express, MongoDB, Socket.io, and Docker.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS 3, React Router v6, Axios, Socket.io-client |
| State | Context API + useReducer (AuthContext, NotificationContext) |
| Backend | Node 20, Express, Mongoose, jsonwebtoken, bcryptjs |
| Security | Helmet, CORS, express-rate-limit, express-mongo-sanitize, express-validator |
| Real-time | Socket.io (JWT-auth'd connections, blood-group rooms) |
| Database | MongoDB 7 |
| DevOps | Docker, docker-compose, GitHub Actions |
| Deploy | Render (backend) + Vercel (frontend) |

---

## Demo Logins

| Role | Email | Password |
|---|---|---|
| 🔴 Admin | admin@blood.com | Admin@123 |
| 🏥 Hospital | hospital@blood.com | Hospital@123 |
| 🩸 Donor | donor@blood.com | Donor@123 |

Additional donors: donor2@blood.com … donor6@blood.com (all `Donor@123`)

---

## How to Run

### Option A – Docker (recommended, zero setup)

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd blood-donation-portal

# 2. Copy env file (default values work out of the box)
cp .env.example .env

# 3. Start all 3 containers
docker compose up --build
```

| URL | Service |
|---|---|
| http://localhost:8080 | Frontend |
| http://localhost:5000/api/health | Backend API |
| localhost:27018 | MongoDB (host port) |

The backend auto-seeds demo data on first start. No extra steps needed.

---

### Option B – Manual (local Node + MongoDB)

```bash
# ── Backend ──────────────────────────────────────────
cd backend
cp .env.example .env       # set MONGO_URI to your local MongoDB
npm install
npm run seed               # create demo users & requests
npm run dev                # starts on :5000

# ── Frontend (new terminal) ──────────────────────────
cd frontend
cp .env.example .env       # set VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                # starts on :5173
```

---

## API Summary

```
GET    /api/health
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
PUT    /api/donors/me
GET    /api/donors
POST   /api/requests
GET    /api/requests
GET    /api/requests/:id
PATCH  /api/requests/:id/status
DELETE /api/requests/:id
POST   /api/requests/:id/respond
GET    /api/requests/:id/responses
GET    /api/admin/stats
GET    /api/admin/users
DELETE /api/admin/users/:id
```

Full Postman collection in `postman/BloodDonationPortal.postman_collection.json`.
Import it and run the **Login** request first – the test script saves the token automatically.

---

## Running Tests

```bash
cd backend
npm test      # 7 jest + supertest tests, no DB needed
```

---

## Experiment ↔ File Mapping

| # | Experiment | Files / Folders |
|---|---|---|
| 1 | Responsive UIs with Tailwind CSS | `frontend/src/**/*.jsx`, `frontend/tailwind.config.js`, `frontend/src/index.css` |
| 2 | React Hooks (useEffect, useContext, custom hooks) | `frontend/src/hooks/useFetch.js`, `useSocket.js`, `useDebounce.js`; every page (useEffect for title/fetch, useContext for auth) |
| 3 | Complex state with Context API | `frontend/src/context/AuthContext.jsx`, `NotificationContext.jsx` |
| 4 | REST API + MongoDB + Mongoose | `backend/src/models/`, `backend/src/controllers/`, `backend/src/routes/`, `backend/src/config/db.js` |
| 5 | Secure production-ready APIs | `backend/src/middleware/auth.js`, `roles.js`, `validate.js`, `errorHandler.js`; `app.js` (helmet, cors, rate-limit, sanitize) |
| 6 | Authentication & JWT roles | `backend/src/controllers/auth.js`, `backend/src/middleware/auth.js`, `roles.js` |
| 7 | Validating APIs with Postman | `postman/BloodDonationPortal.postman_collection.json` |
| 8 | Real-time via WebSockets | `backend/src/sockets/index.js`, `frontend/src/hooks/useSocket.js`, real-time emits in `controllers/requests.js` |
| 9 | CI/CD – GitHub Actions + Render/Vercel | `.github/workflows/ci.yml` |
| 10 | Full-stack deployment with Docker | `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile`, `frontend/nginx.conf` |

---

## Deploying to Render + Vercel

### Backend → Render

1. Push the repo to GitHub.
2. Create a new **Web Service** on [render.com](https://render.com) pointing at the `backend/` folder.
3. Set environment variables:
   - `MONGO_URI` – your MongoDB Atlas `mongodb+srv://...` connection string (**Render does not host MongoDB; use Atlas free tier**)
   - `JWT_SECRET` – a random 32-char string
   - `CLIENT_URL` – your Vercel frontend URL (comma-separated if multiple)
4. Add `RENDER_DEPLOY_HOOK_URL` as a GitHub Actions secret to enable auto-deploys.

### Frontend → Vercel

1. Import the repo in [vercel.com](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Set env var `VITE_API_URL` to your Render backend URL (`https://your-app.onrender.com/api`).
4. Vercel deploys automatically on every push to `main` via its own GitHub integration (no Actions step needed).

> **MongoDB Atlas** free tier (M0) is sufficient for this project.
> Create a cluster at [cloud.mongodb.com](https://cloud.mongodb.com), whitelist all IPs (`0.0.0.0/0`), and copy the `mongodb+srv://` URI into the Render env var.
