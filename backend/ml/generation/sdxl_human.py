import os
import uuid
import shutil
from PIL import Image, ImageFilter, ImageDraw
from ml.generation.sdxl_stability import generate_sdxl_img2img
from ml.postprocessing.enhancer import get_product_placement, get_product_scale

OUTPUT_DIR = "ml/output"
TEMP_DIR = "ml/temp"
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(TEMP_DIR, exist_ok=True)

def generate_human_with_sdxl(prompt, reference_image_path, product_name=None, gender=None):
    print(f"\n--- Smart Blending product onto real human ({product_name}) ---")
    
    # Strictly load the correct human base image based on the DB gender
    gender_lower = gender.lower() if gender else None
    
    if gender_lower == 'female':
        human_image_path = "ml/female.png"
    elif gender_lower == 'male':
        human_image_path = "ml/male.png"
    else:
        # Fallback to guessing if gender is somehow not provided
        human_image_path = "ml/male.png"
        lower_product = str(product_name).lower() if product_name else ""
        if any(word in lower_product for word in ["women", "female", "girl", "lady", "ladies"]):
            human_image_path = "ml/female.png"
        elif "women" in prompt.lower() or "female" in prompt.lower():
            human_image_path = "ml/female.png"
        
    if not os.path.exists(human_image_path):
        if os.path.exists("ml/human.png"):
            human_image_path = "ml/human.png"
        else:
            print(f"Error: Base human image not found at {human_image_path}")
            return None

    try:
        bg_img = Image.open(human_image_path).convert("RGBA")
        
        # VERY IMPORTANT FIX: SDXL always returns 1024x1024. 
        # We must resize our human image to 1024x1024 to prevent the "images do not match" error!
        bg_img = bg_img.resize((1024, 1024), Image.Resampling.LANCZOS)
        
        product_img = Image.open(reference_image_path).convert("RGBA")
        
        # Scale product
        scale_factor = get_product_scale(product_name, gender=gender_lower)
        new_width = int(bg_img.width * scale_factor)
        ratio = new_width / product_img.width
        new_height = int(product_img.height * ratio)
        product_img = product_img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Get placement (re-using enhancer's logic so it perfectly aligns)
        x, y = get_product_placement(product_name, bg_img.width, bg_img.height, product_img.width, product_img.height, "model_front", gender=gender_lower)
        
        # Create the initial hard composite
        composite_img = bg_img.copy()
        composite_img.alpha_composite(product_img, dest=(x, y))
        
        temp_composite_path = os.path.join(TEMP_DIR, f"composite_{uuid.uuid4().hex}.png")
        composite_img.convert("RGB").save(temp_composite_path, format="PNG")
    except Exception as e:
        print(f"Error compositing: {e}")
        return None

    # 2. Use SDXL Img2Img to blend lighting/shadows and erase old underlying clothing
    try:
        print("Blending shadows and erasing old clothes with SDXL (strength 0.35)...")
        blended_bytes = generate_sdxl_img2img(
            prompt=prompt, 
            image_path=temp_composite_path, 
            strength=0.35 # Erases the old shoe underneath and adds natural shadows
        )
        
        temp_blended_path = os.path.join(TEMP_DIR, f"blended_{uuid.uuid4().hex}.png")
        with open(temp_blended_path, "wb") as f:
            f.write(blended_bytes)
            
        blended_img = Image.open(temp_blended_path).convert("RGBA")
        
    except Exception as e:
        print(f"SDXL Blending Error: {e}")
        return None

    # 3. Restoring the 100% REAL human face and body using a Soft Mask!
    try:
        # Create a black mask (pixels to keep from the real human)
        mask = Image.new('L', (bg_img.width, bg_img.height), 0)
        draw = ImageDraw.Draw(mask)
        
        # Draw a white rectangle around the product area with a margin (pixels to keep from SDXL)
        margin = 60
        draw.rectangle([
            max(0, x - margin), 
            max(0, y - margin), 
            min(bg_img.width, x + product_img.width + margin), 
            min(bg_img.height, y + product_img.height + margin)
        ], fill=255)
        
        # Blur the mask to create a soft, seamless transition between real skin and AI shadows
        mask = mask.filter(ImageFilter.GaussianBlur(30))
        
        # Combine the 100% real human face/body with the beautifully blended product area
        final_base_img = Image.composite(blended_img, bg_img, mask)
        
        final_output_path = os.path.join(OUTPUT_DIR, f"real_human_base_{uuid.uuid4().hex}.png")
        final_base_img.convert("RGB").save(final_output_path, format="PNG")
        
    except Exception as e:
        print(f"Error during soft masking: {e}")
        return None
        
    # Clean up temp files
    try:
        os.remove(temp_composite_path)
        os.remove(temp_blended_path)
    except:
        pass
        
    print(f"Selected real human model: {final_output_path}")
    return final_output_path