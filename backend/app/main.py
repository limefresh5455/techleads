from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router as api_router
from app.api.admin_routes import router as admin_router
from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.services.migrate import migrate_user_columns, migrate_website_columns
from app.services.seed import seed_database
import app.models  # noqa: F401 — register all SQLAlchemy models

app = FastAPI(title="TechLeads.ai API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
app.include_router(admin_router)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    migrate_website_columns()
    migrate_user_columns()
    db = SessionLocal()
    try:
        # seed_database(db)
        pass
    finally:
        db.close()
