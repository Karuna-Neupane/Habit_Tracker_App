# Habitra

A full-stack habit tracking application. Add daily or weekly habits, build streaks, and track your progress through a calendar view, a contribution heatmap, and analytics charts - with an AI coach and chat (Gemini) that reviews your habit data and gives personalized feedback.

## Live Links

- **Frontend (Netlify):** https://habitra-the-habit-tracker.netlify.app/
- **Backend API (Render):** https://habit-tracker-app-backend-wdkj.onrender.com

## Features

- **Auth** - register, login, JWT sessions, "Continue with Google" sign-in, forgot/reset password via emailed code
- **Habits** - create, edit, delete, and mark daily/weekly habits complete; search, filter, and sort
- **Dashboard** - streaks, weekly/monthly progress, achievement badges, contribution heatmap, recent activity
- **Calendar** - week and month views of completion history
- **Analytics** - completion trends and per-habit comparisons (Recharts)
- **AI Coach** - one-click coaching summary plus a follow-up chat, powered by Gemini (falls back to a rule-based analysis if no API key is set)
- **Profile** - avatar, name, password change, account deletion
- Fully responsive UI, built with Tailwind CSS

## Tech Stack

| Layer      | Stack                                                         |
|------------|----------------------------------------------------------------|
| Frontend   | React, React Router, Tailwind CSS, Recharts, Axios, Vite, @react-oauth/google |
| Backend    | Node.js, Express, MongoDB (Mongoose), JWT, Nodemailer          |
| AI         | Google Gemini API                                              |

## Project Structure

```
Habit_Tracker_App/
├── src/                # React frontend
│   ├── components/     # Reusable UI (Navbar, Sidebar, HabitCard, GoogleAuthButton, AIChatBot, ...)
│   ├── pages/           # Route-level views (Dashboard, MyHabits, Calendar, ...)
│   ├── context/          # Auth & Habits context providers
│   └── utils/             # API client, streak math, validation
├── backend/
│   └── src/
│       ├── controllers/  # Route handlers
│       ├── models/        # Mongoose schemas (User, Habit, ChatMessage)
│       ├── routes/         # Express routers
│       ├── middleware/    # JWT verification, error handling
│       └── validators/    # Request validation rules
└── ...
```

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB connection string (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- SMTP credentials for password-reset emails
- A [Gemini API key](https://ai.google.dev/) for AI coaching
- A [Google OAuth Client ID](https://console.cloud.google.com/apis/credentials) for "Continue with Google"

### 1. Clone and install

```bash
git clone https://github.com/Karuna-Neupane/Habit_Tracker_App
cd Habit_Tracker_App

# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

### 2. Configure environment variables

Create the two `.env` files below and fill in your own values - **never commit real `.env` files** (both are already covered by `.gitignore`).

**`.env`** (project root - used by the Vite frontend)

```env
VITE_API_URL=http://localhost:3000/api

# Google OAuth Client ID (Web application) 
# GOOGLE_CLIENT_ID. Safe to expose to the browser; Client IDs aren't secret.
VITE_GOOGLE_CLIENT_ID=
```

**`backend/.env`**

```env
PORT=3000
NODE_ENV=development

# MongoDB connection string
MONGO_URI=

# Used to sign/verify JWTs. Generate with:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=

# SMTP settings for the "forgot password" reset-code email
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=

# Gemini API key for the AI Habit Coach.
# Optional — without it, /api/ai/coach falls back to a rule-based analysis.
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.6-flash

# Google OAuth Client ID (Web application), from
# https://console.cloud.google.com/apis/credentials — must match
# VITE_GOOGLE_CLIENT_ID above exactly. Without this set, the "Continue with
# Google" button will fail; the rest of the app is unaffected.
GOOGLE_CLIENT_ID=

# Production frontend origin, for CORS
FRONTEND_URL=
```

| File               | Variable         | Description                                  |
|---------------------|------------------|-----------------------------------------------|
| `.env`               | `VITE_API_URL`   | Base URL of the API (e.g. `http://localhost:3000/api`) |
| `.env`               | `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID, enables "Continue with Google" |
| `backend/.env`     | `MONGO_URI`      | MongoDB connection string                     |
| `backend/.env`     | `JWT_SECRET`     | Random secret used to sign JWTs               |
| `backend/.env`     | `SMTP_*`          | Email credentials for password-reset codes    |
| `backend/.env`     | `GEMINI_API_KEY`  | Enables AI coaching                |
| `backend/.env`     | `GOOGLE_CLIENT_ID` | Google OAuth Client ID, must match `VITE_GOOGLE_CLIENT_ID` |
| `backend/.env`     | `FRONTEND_URL`    | Production frontend origin, for CORS          |

#### Setting up "Continue with Google"

1. Go to [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials) and create an **OAuth 2.0 Client ID** of type **Web application**.
2. Under **Authorized JavaScript origins**, add `http://localhost:5173` (and your production frontend URL, once deployed).
3. Copy the generated Client ID into both `VITE_GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_ID` above - it's the same value in both places.

The button verifies the sign-in against Google's own endpoints on every request, so there's nothing else to configure. Accounts created this way are linked by email - a user who first registered with a password and later clicks "Continue with Google" with the same email gets the two methods merged into one account.

### 3. Run the app

Run the backend and frontend in two terminals:

```bash
# Terminal 1 — backend (http://localhost:3000)
cd backend
npm run dev

# Terminal 2 — frontend (http://localhost:5173)
npm run dev
```

The Vite dev server proxies `/api/*` requests to the backend, so no CORS setup is needed locally.

## API Overview

REST API served from `/api`:

| Resource | Endpoints |
|----------|-----------|
| Auth     | `POST /auth/register`, `POST /auth/login`, `POST /auth/google`, `GET /auth/me`, `PUT /auth/profile`, `PUT /auth/password`, `DELETE /auth/account`, `POST /auth/forgot-password`, `POST /auth/verify-reset-code`, `POST /auth/reset-password` |
| Habits   | `GET/POST /habits`, `GET/PUT/DELETE /habits/:id`, `POST/DELETE /habits/:id/complete`, `GET /habits/:id/history` |
| AI       | `POST /ai/coach`, `POST /ai/chat`, `GET /ai/chat/history`, `DELETE /ai/chat/history` |

A full Postman collection is included at `backend/HabitTracker.postman_collection.json`.

## Build for Production

```bash
npm run build     # outputs static frontend to /dist
```

Serve `/dist` with your host of choice and deploy `backend/` as a standard Node/Express service, pointing `VITE_API_URL` (and `VITE_GOOGLE_CLIENT_ID`) at your deployed values.
