import logging
import cloudinary
import cloudinary.uploader
import cloudinary.api
from app.core.config import settings

logger = logging.getLogger(__name__)

_cloudinary_initialized = False

try:
    if settings.cloudinary_cloud_name and settings.cloudinary_api_key and settings.cloudinary_api_secret:
        cloudinary.config(
            cloud_name=settings.cloudinary_cloud_name,
            api_key=settings.cloudinary_api_key,
            api_secret=settings.cloudinary_api_secret,
            secure=True
        )
        _cloudinary_initialized = True
        logger.info("Cloudinary initialized successfully.")
    else:
        logger.warning("Cloudinary not initialized: Missing credentials in .env")
except Exception as e:
    logger.error(f"Failed to initialize Cloudinary: {e}")

def upload_file_to_cloudinary(file_path: str, folder: str = "avatars") -> str:
    """
    Uploads a file to Cloudinary and returns the secure URL.
    Returns empty string if Cloudinary is not configured or upload fails.
    """
    if not _cloudinary_initialized:
        logger.warning("Attempted to upload to Cloudinary, but it is not initialized.")
        return ""
        
    try:
        response = cloudinary.uploader.upload(
            file_path, 
            folder=folder,
            fetch_format="auto",
            quality="auto",
            width=500,
            height=500,
            crop="limit"
        )
        return response.get("secure_url", "")
    except Exception as e:
        logger.error(f"Error uploading to Cloudinary: {e}")
        return ""

def delete_file_from_cloudinary(file_url: str):
    """
    Deletes a file from Cloudinary using its secure URL.
    """
    if not _cloudinary_initialized or not file_url:
        return
        
    try:
        if "res.cloudinary.com" in file_url:
            parts = file_url.split("/upload/")
            if len(parts) > 1:
                path_parts = parts[1].split("/")
                if path_parts[0].startswith("v") and path_parts[0][1:].isdigit():
                    path_parts = path_parts[1:]
                
                public_id_with_ext = "/".join(path_parts)
                public_id = public_id_with_ext.rsplit(".", 1)[0]
                
                cloudinary.uploader.destroy(public_id)
                logger.info(f"Deleted {public_id} from Cloudinary.")
    except Exception as e:
        logger.error(f"Error deleting file from Cloudinary: {e}")
