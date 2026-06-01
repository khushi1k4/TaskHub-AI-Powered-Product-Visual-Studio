def build_all_prompts(product_name, product_data=None, reference_image=None, gender=None):
    product_str = product_name if product_name else "product"
    lower_product = product_str.lower()
    
    # Strictly determine the subject based on explicit gender
    gender_lower = gender.lower() if gender else None
    if gender_lower == 'male':
        subject = "Indian man"
    elif gender_lower == 'female':
        subject = "Indian woman"
    else:
        # Fallback for when gender isn't explicitly provided
        if any(word in lower_product for word in ["men", "male", "boy", "guy"]):
            subject = "Indian man"
        elif any(word in lower_product for word in ["women", "female", "girl", "lady", "ladies"]):
            subject = "Indian woman"
        else:
            subject = "Indian person"

    return [
        {
            "type": "white_bg",
            "prompt": "A seamless, infinite pure solid white studio backdrop, perfectly smooth blank surface, minimalist, isolated on white background, bright studio lighting, photorealistic, 8k, crisp details."
        },
        {
            "type": "luxury_1",
            "prompt": "A seamless, infinite solid black marble tile studio backdrop, perfectly smooth, highly polished shiny reflective surface, blank minimalist design, isolated, dramatic cinematic lighting, ultra realistic, 8k resolution, crisp details."
        },
        {
            "type": "luxury_2",
            "prompt": "A seamless, infinite premium rich red velvet studio backdrop, perfectly smooth luxurious fabric texture, blank minimalist surface, isolated, dramatic studio lighting, photorealistic, 8k resolution, crisp details."
        },
        {
            "type": "creative_1",
            "prompt": "Empty sand at a beautiful beach sunset, advertising scene, instagram marketing style, warm golden hour lighting, ocean waves in background, no objects."
        },
        {
            "type": "creative_2",
            "prompt": "vibrant neon lighting background, commercial advertisement, cinematic depth of field, no objects."
        },
        {
            "type": "model_front",
            "prompt": f"Front view of a simple and elegant real human {subject}. The person is wearing the exact same reference product ('{product_str}') correctly and naturally at the right place on the body. Natural body figure, authentic Indian skin tone person, simple and not overly fancy, lifestyle advertisement photography, photorealistic, 8k resolution."
        },
        {
            "type": "model_side",
            "prompt": f"Side profile at 45degree tilt angle of a simple and elegant real human {subject}. The person is wearing the exact same reference product ('{product_str}') correctly and naturally at the right place on the body. Natural body figure, authentic Indian skin tone person, looking away gently, simple and not overly fancy, high quality image, lifestyle advertisement photography, photorealistic, 8k resolution."
        },
        {
            "type": "model_closeup",
            "prompt": f"Close-up advertisement shot of a simple, and elegant real human {subject}. The person is wearing the exact same reference product ('{product_str}') correctly and naturally at the right place on the body. Authentic Indian skin tone person, simple and not overly fancy, macro photography, photorealistic, studio lighting, 8k resolution."
        }
    ]