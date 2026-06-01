import os
from gradio_client import Client, handle_file

def generate_free_vton(human_image_path, product_image_path, garment_description="Product"):
    """
    Uses a free Hugging Face Space to apply a garment to a human model.
    No API keys or paid credits required.
    """
    print("Connecting to free Hugging Face VTON model...")
    
    try:
        # Connect to the popular open-source IDM-VTON space
        client = Client("yisol/IDM-VTON")
        
        # The API requires a specific dictionary format for the human image (background)
        human_input = {
            "background": handle_file(human_image_path),
            "layers": [],
            "composite": None
        }

        # Send the request to the free public server
        result = client.predict(
            dict=human_input,
            garm_img=handle_file(product_image_path),
            garment_des=garment_description,
            is_checked=True,          # Auto-masking enabled
            is_checked_crop=False,    # Keep original image ratio
            denoise_steps=30,
            seed=42,
            api_name="/tryon"
        )
        
        # The result returns a tuple where the first item is the local path 
        # to the newly generated image saved in your temp folder
        generated_image_path = result[0]
        
        print(f"VTON Success! Image temporarily saved at: {generated_image_path}")
        return generated_image_path
        
    except Exception as e:
        print(f"Error during free VTON generation: {e}")
        return None