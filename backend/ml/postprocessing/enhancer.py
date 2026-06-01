import os
import uuid
from PIL import Image, ImageOps

def focus_crop(img, center_x, center_y, zoom_factor):
    """Crops the image around a specific center point to zoom in on the product"""
    width, height = img.size
    crop_w = int(width / zoom_factor)
    crop_h = int(height / zoom_factor)
    
    left = center_x - crop_w // 2
    top = center_y - crop_h // 2
    right = center_x + crop_w // 2
    bottom = center_y + crop_h // 2
    
    # Boundary clamping so we don't crop outside the image
    if left < 0:
        right += abs(left)
        left = 0
    if right > width:
        left -= (right - width)
        right = width
    if top < 0:
        bottom += abs(top)
        top = 0
    if bottom > height:
        top -= (bottom - height)
        bottom = height
        
    left, top, right, bottom = max(0, left), max(0, top), min(width, right), min(height, bottom)
    
    cropped = img.crop((left, top, right, bottom))
    # Resize the cropped area back up to original resolution for a high-quality zoom
    return cropped.resize((width, height), Image.Resampling.LANCZOS)

def get_product_placement(product_name, bg_width, bg_height, product_width, product_height, image_type, gender=None):
    lower = str(product_name).lower() if product_name else ""
    x = (bg_width - product_width) // 2
    
    # Female base image usually has slightly different proportions. 
    # We adjust the base_y multiplier depending on the gender.
    if any(w in lower for w in ["shoe", "sneaker", "boot", "footwear"]):
        base_y = 0.88 if gender == 'female' else 0.85
        y = int(bg_height * base_y) - (product_height // 2)
        if product_height > product_width * 1.1:
            x = int(bg_width * 0.58) - (product_width // 2)
            
    elif any(w in lower for w in ["pant", "jean", "short", "skirt", "trouser", "legging"]):
        base_y = 0.65 if gender == 'female' else 0.60
        y = int(bg_height * base_y) - (product_height // 2)
        
    elif any(w in lower for w in ["hat", "cap", "beanie", "helmet"]):
        base_y = 0.10 if gender == 'female' else 0.08
        y = int(bg_height * base_y) - (product_height // 2)
        
    elif any(w in lower for w in ["glasses", "sunglass", "eyewear"]):
        base_y = 0.15 if gender == 'female' else 0.12
        y = int(bg_height * base_y) - (product_height // 2)
        
    elif any(w in lower for w in ["watch", "bracelet", "ring"]):
        base_y = 0.58 if gender == 'female' else 0.55
        y = int(bg_height * base_y) - (product_height // 2)
        x = int(bg_width * 0.38) - (product_width // 2) if gender == 'female' else int(bg_width * 0.35) - (product_width // 2)
        
    elif any(w in lower for w in ["shirt", "t-shirt", "jacket", "hoodie", "top", "sweater"]):
        base_y = 0.35 if gender == 'female' else 0.32
        y = int(bg_height * base_y) - (product_height // 2)
        
    else:
        base_y = 0.42 if gender == 'female' else 0.40
        y = int(bg_height * base_y) - (product_height // 2)
        
    return x, y

def get_product_scale(product_name, gender=None):
    # INCREASED BASE SIZES to make products much more prominent!
    lower = str(product_name).lower() if product_name else ""
    scale_mod = 0.85 if gender == 'female' else 1.0
    
    if any(w in lower for w in ["shoe", "sneaker", "boot", "footwear"]):
        return 0.35 * scale_mod
    elif any(w in lower for w in ["hat", "cap", "beanie", "helmet"]):
        return 0.25 * scale_mod
    elif any(w in lower for w in ["glasses", "sunglass", "eyewear"]):
        return 0.18 * scale_mod
    elif any(w in lower for w in ["watch", "bracelet", "ring"]):
        return 0.12 * scale_mod
    elif any(w in lower for w in ["pant", "jean", "short", "skirt", "trouser"]):
        return 0.55 * scale_mod
    else:
        return 0.55 * scale_mod

def enhance_image(generated_bg_path, original_clean_path, image_type=None, product_name=None, gender=None):
    try:
        bg_img = Image.open(generated_bg_path).convert("RGBA")
        
        # 1. Flip horizontally for side view so it looks like a different pose
        if image_type == "model_side":
            bg_img = ImageOps.mirror(bg_img)
            
        product_img = Image.open(original_clean_path).convert("RGBA")
        
        # 2. Dynamic scale factor
        if image_type and image_type in ["model_front", "model_side", "model_closeup"]:
            scale_factor = get_product_scale(product_name, gender=gender)
        else:
            scale_factor = 0.6 
            
        new_width = int(bg_img.width * scale_factor)
        ratio = new_width / product_img.width
        new_height = int(product_img.height * ratio)
        
        product_img = product_img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # 3. Calculate dynamic positions
        if image_type and image_type in ["model_front", "model_side", "model_closeup"]:
            x, y = get_product_placement(product_name, bg_img.width, bg_img.height, product_img.width, product_img.height, image_type, gender=gender)
        else:
            x = (bg_img.width - new_width) // 2
            y = (bg_img.height - new_height) // 2
            if image_type and image_type in ["luxury_1", "luxury_2", "creative_1", "creative_2"]:
                y = y + int(bg_img.height * 0.1)
            
        bg_img.alpha_composite(product_img, dest=(x, y))
        
        # 4. Smart Zoom Focus (Crop tightly around product for closeup)
        if image_type in ["model_front", "model_side", "model_closeup"]:
            product_center_x = x + (new_width // 2)
            product_center_y = y + (new_height // 2)
            
            zoom_factor = 1.0
            if image_type == "model_closeup":
                zoom_factor = 2.2 # Heavy zoom for closeup (Focuses completely on the product part)
            elif image_type == "model_side":
                zoom_factor = 1.3 # Slight zoom for side
            elif image_type == "model_front":
                zoom_factor = 1.1 # Very slight crop for front
                
            if zoom_factor > 1.0:
                bg_img = focus_crop(bg_img, product_center_x, product_center_y, zoom_factor)
        
        output_dir = "ml/output"
        os.makedirs(output_dir, exist_ok=True)
        final_path = os.path.join(output_dir, f"final_{uuid.uuid4().hex}.png")
        
        bg_img.save(final_path, format="PNG")
        
        return final_path
    except Exception as e:
        print(f"Enhancement error: {e}")
        return generated_bg_path