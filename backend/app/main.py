from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
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

app.include_router(router)


@app.on_event("startup")
def on_startup():
    # Recreate free-tool tables when schema expands (seeded on every boot).
    from app.models import FreeTool, ToolFaq, ToolFeature, ToolPopularItem

    for table in (
        ToolFaq.__table__,
        ToolFeature.__table__,
        ToolPopularItem.__table__,
        FreeTool.__table__,
    ):
        table.drop(bind=engine, checkfirst=True)

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
