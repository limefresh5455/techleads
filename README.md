# TechLeads.ai

React + FastAPI + PostgreSQL landing page matching the TechLeads product design.

## Stack

- **Frontend:** React (Vite) + Tailwind CSS
- **Backend:** Python FastAPI + SQLAlchemy
- **Database:** PostgreSQL 16 (Docker)

## Quick start

### 1. Start PostgreSQL

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
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
