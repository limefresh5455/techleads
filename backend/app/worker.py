import os
import sys
import time
import logging

# Set up path so we can import from app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models import EnrichmentQueue, Website, ImportJob
from app.services.detect_service import detect_and_store

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

def process_queue(batch_size: int = 10):
    """Fetches a batch of pending items from EnrichmentQueue and processes them."""
    db: Session = SessionLocal()
    try:
        # Fetch pending items
        items = (
            db.query(EnrichmentQueue)
            .filter(EnrichmentQueue.status == "pending")
            .order_by(EnrichmentQueue.created_at.asc())
            .limit(batch_size)
            .all()
        )
        
        if not items:
            return 0  # No items processed
            
        logger.info(f"Picked up {len(items)} items from queue.")
        
        for item in items:
            item.status = "processing"
            db.commit()
            
            website = db.query(Website).filter(Website.id == item.website_id).first()
            if not website:
                item.status = "failed"
                item.error_message = "Website not found in DB."
                db.commit()
                continue
                
            url = website.source_url or f"https://{website.domain}"
            logger.info(f"Enriching {url}...")
            
            try:
                # Call the actual enrichment function
                detect_and_store(db, url, use_techleads_api=True, force_refresh=True)
                
                item.status = "completed"
                
                # Update job progress if applicable
                if item.job_id:
                    job = db.query(ImportJob).filter(ImportJob.id == item.job_id).first()
                    if job:
                        job.processed_websites += 1
                        if job.processed_websites >= job.total_websites:
                            job.status = "completed"
                            
                db.commit()
                logger.info(f"Successfully enriched {url}.")
                
            except Exception as e:
                error_str = str(e)
                logger.error(f"Error enriching {url}: {error_str}")
                
                # Handle 429 specifically if it's from the LLM provider
                if "429" in error_str or "rate_limited" in error_str:
                    logger.warning(f"Rate limited by LLM on {url}. Will retry.")
                    item.status = "pending"  # put back in queue
                    item.retries += 1
                    item.error_message = error_str
                    db.commit()
                    # Sleep slightly to cool down
                    time.sleep(5)
                else:
                    item.status = "failed"
                    item.error_message = error_str
                    item.retries += 1
                    
                    if item.job_id:
                        job = db.query(ImportJob).filter(ImportJob.id == item.job_id).first()
                        if job:
                            job.failed_websites += 1
                            if (job.processed_websites + job.failed_websites) >= job.total_websites:
                                job.status = "completed"
                    
                    db.commit()
                    
        return len(items)
        
    finally:
        db.close()

if __name__ == "__main__":
    logger.info("Starting background worker...")
    while True:
        try:
            processed_count = process_queue(batch_size=10)
            if processed_count == 0:
                # Sleep a bit if queue is empty to avoid hammering DB
                time.sleep(5)
            else:
                # Small sleep between batches
                time.sleep(1)
        except KeyboardInterrupt:
            logger.info("Worker stopped by user.")
            break
        except Exception as e:
            logger.error(f"Worker encountered an error: {e}")
            time.sleep(10)
