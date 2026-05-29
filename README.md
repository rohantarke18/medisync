# MediSync Pro — Web Edition

Modern healthcare dashboard. React frontend + Flask API + SQLite backend.

---

## Project Structure

```
medisync-web/
├── api/
│   ├── index.py          # Flask REST API
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── pages/        # Home, DoctorDashboard, PatientDashboard, PatientAuth
│   │   ├── components/   # Sidebar, ui primitives
│   │   └── lib/api.js    # API client
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── vercel.json
```

---

## Run Locally (5 minutes)

### 1. Backend (Flask API)

```bash
cd api
pip install flask flask-cors
python index.py
# → Running on http://localhost:5000
```

### 2. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
# → Running on http://localhost:5173
```

Open **http://localhost:5173** — Vite proxies `/api/*` to Flask automatically.

---

## Deploy to Vercel (Recommended)

### Prerequisites
- [Vercel account](https://vercel.com) (free)
- [Vercel CLI](https://vercel.com/docs/cli): `npm i -g vercel`

### Steps

```bash
# 1. Build frontend first
cd frontend && npm run build && cd ..

# 2. Deploy
vercel

# Follow prompts:
# - Link to project or create new
# - Root: ./
# - Vercel auto-detects vercel.json
```

Or connect your GitHub repo in the Vercel dashboard for auto-deploy on push.

### Environment Variables (Vercel dashboard)
None required by default. The SQLite database is created automatically on first run.

> **Note:** Vercel's Python runtime creates a fresh DB per cold start (serverless).  
> For persistent data in production, swap SQLite for a hosted database:
> - [PlanetScale](https://planetscale.com) (MySQL, free tier)
> - [Neon](https://neon.tech) (PostgreSQL, free tier)
> - [Supabase](https://supabase.com) (PostgreSQL, free tier)

---

## Deploy to Railway (Persistent SQLite — easier)

Railway runs your app as a long-running server, so SQLite persists naturally.

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

Add a `Procfile`:
```
web: cd frontend && npm run build && cd .. && python api/index.py
```

Or use **two separate Railway services**: one for Flask, one for the static frontend on Vercel.

---

## Deploy to Render

1. Create a new **Web Service** → connect your repo
2. Build command: `cd frontend && npm install && npm run build`
3. Start command: `python api/index.py`
4. Set port: `5000`

---

## Tech Stack

| Layer    | Tech                     |
|----------|--------------------------|
| Frontend | React 18, Vite, Tailwind |
| Charts   | Recharts                 |
| Backend  | Flask (Python)           |
| Database | SQLite (swap for Postgres in prod) |
| Deploy   | Vercel / Railway / Render |

---

## Sample Data

```
# Register a patient via Doctor Portal → Add Record page, or:

POST /api/patients
{
  "id": "PT001",
  "name": "Arjun Sharma",
  "age": 35,
  "blood_group": "B+",
  "allergies": "Penicillin",
  "phone": "+91 9876543210"
}
```
