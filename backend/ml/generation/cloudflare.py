import os
import uuid
import base64
import requests
import io
from PIL import Image
from dotenv import load_dotenv

load_dotenv()

KEY = os.getenv("CLOUDFLARE_API_KEY")
ACCOUNT = os.getenv("CLOUDFLARE_ACCOUNT_ID")

TEXT_TO_IMAGE_MODEL = "@cf/stabilityai/stable-diffusion-xl-base-1.0"
IMG_TO_IMG_MODEL = "@cf/runwayml/stable-diffusion-v1-5-img2img"

def to_byte_array(path):
    with Image.open(path) as img:
        if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
            img = img.convert("RGBA")
            white_bg = Image.new('RGBA', img.size, (255, 255, 255, 255))
            white_bg = Image.alpha_composite(white_bg, img)
            img = white_bg.convert('RGB')
        elif img.mode != 'RGB':
            img = img.convert('RGB')
            
        img.thumbnail((450, 450), Image.Resampling.LANCZOS)
        
        canvas = Image.new('RGB', (512, 512), (255, 255, 255))
        offset = ((512 - img.width) // 2, (512 - img.height) // 2)
        canvas.paste(img, offset)
        
        buffer = io.BytesIO()
        # Increased JPEG quality to 100 for maximum clarity before generation
        canvas.save(buffer, format="JPEG", quality=100) 
        
        return list(buffer.getvalue())

def generate_with_cloudflare(prompt, image_type, reference_image):
    
    headers = {
        "Authorization": f"Bearer {KEY}",
        "Content-Type": "application/json"
    }

    if image_type in ["model_front", "model_side", "model_closeup", "front_view", "side_view", "closeup_view"]:
        url = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT}/ai/run/{IMG_TO_IMG_MODEL}"
        
        negative_prompt = "ugly, deformed, disfigured, poor anatomy, bad face, extra limbs, bad hands, missing fingers, floating limbs, blurred, distorted, mutated, text, watermark, bad skin, unnatural skin tone"
        
        payload = {
            "prompt": prompt,
            "negative_prompt": negative_prompt,
            "image": to_byte_array(reference_image),
            "strength": 0.82,  
            "guidance": 8.0,   
            "num_steps": 20    # 🚨 FIXED: Cloudflare max limit is 20 steps!
        }
    else:
        url = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT}/ai/run/{TEXT_TO_IMAGE_MODEL}"
        
        payload = {
            "prompt": prompt,
            "negative_prompt": "ugly, text, watermark, deformed, messy, distorted"
        }

    r = requests.post(url, json=payload, headers=headers, timeout=120)

    if r.status_code != 200:
        raise Exception(f"Cloudflare Error {r.status_code}: {r.text}")

    output_dir = "ml/output"
    os.makedirs(output_dir, exist_ok=True)
    
    output_path = os.path.join(output_dir, f"{uuid.uuid4().hex}.png")

    content_type = r.headers.get("Content-Type", "")
    if "image" in content_type:
        with open(output_path, "wb") as f:
            f.write(r.content)
        return output_path

    try:
        data = r.json()
        result = data.get("result", {})
        image_data = result.get("image") or result
        
        if isinstance(image_data, str):
            with open(output_path, "wb") as f:
                f.write(base64.b64decode(image_data))
            return output_path
            
        return image_data
    except ValueError:
        with open(output_path, "wb") as f:
            f.write(r.content)
        return output_path