def build_tryon_prompt(product_name, view="front"):
    base_subject = "realistic Indian fashion model"

    view_map = {
        "front": "front view, facing camera, centered pose",
        "side": "side profile view, looking to right, natural posture",
        "closeup": "upper body close-up shot focusing on clothing details"
    }

    return f"""
Ultra realistic fashion photography of a {base_subject}.
{view_map[view]}.

The model is naturally wearing the product: {product_name}.
Correct clothing fit on body, realistic fabric folding, proper draping,
professional ecommerce studio lighting, white seamless background,
8k, sharp focus, high detail fashion advertisement.
"""