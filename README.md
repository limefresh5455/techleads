# LeadIntel.ai

React + FastAPI + PostgreSQL landing page matching the LeadIntel product design.

## Stack

- **Frontend:** React (Vite) + Tailwind CSS
- **Backend:** Python FastAPI + SQLAlchemy
- **Database:** PostgreSQL 14 (local, port 5433)

## Quick start

### 1. Initialize PostgreSQL 14 database

PostgreSQL 14 must be running on **port 5433**.

```powershell
.\scripts\init-pg14.ps1
```

Default superuser password: `postgres`. Override with `$env:POSTGRES_PASSWORD`.

### 2. Backend

```powershell
cd backend
.\run.ps1
```

API docs: http://127.0.0.1:8000/docs

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://127.0.0.1:5173

## Environment

`backend/.env`:

```
DATABASE_URL=postgresql+psycopg2://techleads:techleads@localhost:5433/techleads
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

## Main API routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/landing` | Full landing payload (nav, techs, categories, pricing, features) |
| GET | `/api/technologies` | Technology datasets |
| GET | `/api/technologies/search?q=` | Search technologies |
| GET | `/api/categories` | Browse categories |
| GET | `/api/pricing` | Pricing plans + features |
| POST | `/api/contact` | Contact form submissions |

On startup the API creates tables and seeds sample data automatically.
