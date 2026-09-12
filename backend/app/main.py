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
        
    # Start the automatic background worker thread
    import threading
    from app.worker import process_queue
    import time

    def run_worker_loop():
        print("Starting automatic background worker thread...")
        while True:
            try:
                processed_count = process_queue(batch_size=10)
                if processed_count == 0:
                    time.sleep(5)
                else:
                    time.sleep(1)
            except Exception as e:
                print(f"Worker thread error: {e}")
                time.sleep(10)

    # Daemon thread will stop automatically when FastAPI stops
    worker_thread = threading.Thread(target=run_worker_loop, daemon=True)
    worker_thread.start()

    # Start keep-alive ping thread
    def run_keep_alive():
        from app.api.routes import ping_keep_alive
        print("Starting keep-alive ping thread...")
        while True:
            try:
                ping_keep_alive()
            except Exception as e:
                print(f"Keep-alive thread error: {e}")
            time.sleep(300)  # Sleep for 5 minutes (300 seconds)

    keep_alive_thread = threading.Thread(target=run_keep_alive, daemon=True)
    keep_alive_thread.start()
