import os
import base64
import requests
from PIL import Image
import io
from dotenv import load_dotenv

load_dotenv()

STABILITY_API_KEY = os.getenv("STABILITY_API_KEY")

SDXL_IMG2IMG_URL = "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image"
SDXL_TXT2IMG_URL = "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image"


def prepare_image(image_path):
    """Convert image to SDXL-safe format"""
    img = Image.open(image_path).convert("RGB")
    img = img.resize((1024, 1024))

    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)

    return buffer


def generate_sdxl_text2image(prompt):
    """Generate an image from text using SDXL"""
    if not STABILITY_API_KEY:
        raise Exception("Missing STABILITY_API_KEY")

    headers = {
        "Authorization": f"Bearer {STABILITY_API_KEY}",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }

    negative_prompt = "bad anatomy, deformed, blurry, low quality, extra limbs, watermark, bad proportions, missing fingers"

    payload = {
        "cfg_scale": 7,
        "steps": 30,
        "text_prompts": [
            {
                "text": prompt,
                "weight": 1.0
            },
            {
                "text": negative_prompt,
                "weight": -1.0
            }
        ]
    }

    response = requests.post(
        SDXL_TXT2IMG_URL,
        headers=headers,
        json=payload,
        timeout=120
    )

    if response.status_code != 200:
        raise Exception(f"Stability API Error: {response.text}")

    result = response.json()
    image_b64 = result["artifacts"][0]["base64"]
    return base64.b64decode(image_b64)


def generate_sdxl_img2img(prompt, image_path, strength=0.4):
    """Generate an image from image using SDXL"""
    if not STABILITY_API_KEY:
        raise Exception("Missing STABILITY_API_KEY")

    headers = {
        "Authorization": f"Bearer {STABILITY_API_KEY}",
        "Accept": "application/json"
    }

    negative_prompt = "bad anatomy, deformed, blurry, low quality, extra limbs, watermark"

    data = {
        "init_image_mode": "IMAGE_STRENGTH",
        "image_strength": strength,
        "cfg_scale": 7,
        "steps": 30,
        "text_prompts[0][text]": prompt,
        "text_prompts[0][weight]": 1.0,
        "text_prompts[1][text]": negative_prompt,
        "text_prompts[1][weight]": -1.0
    }

    files = {
        "init_image": ("image.png", prepare_image(image_path), "image/png")
    }

    response = requests.post(
        SDXL_IMG2IMG_URL,
        headers=headers,
        data=data,
        files=files,
        timeout=120
    )

    if response.status_code != 200:
        raise Exception(response.text)

    result = response.json()

    image_b64 = result["artifacts"][0]["base64"]
    return base64.b64decode(image_b64)