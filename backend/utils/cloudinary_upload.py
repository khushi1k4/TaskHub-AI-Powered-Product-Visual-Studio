import cloudinary
import cloudinary.uploader
from config import Config

cloudinary.config(
  cloud_name=Config.CLOUDINARY_CLOUD_NAME,
  api_key=Config.CLOUDINARY_API_KEY,
  api_secret=Config.CLOUDINARY_API_SECRET
)

def upload_image(image_data):
    try:
        result = cloudinary.uploader.upload(image_data, folder="taskhub/products")
        return result.get('secure_url')
    except Exception as e:
        raise Exception(f"Cloudinary upload failed: {str(e)}")