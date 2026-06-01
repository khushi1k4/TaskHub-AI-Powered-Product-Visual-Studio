import os
import uuid
from PIL import Image
from ml.config import OUTPUT_DIR
from ml.composition.layout_engine import get_layout


def compose(background_path, product_path, image_type):

    bg = Image.open(background_path).convert("RGBA")
    product = Image.open(product_path).convert("RGBA")

    layout = get_layout(image_type)

    # resize product based on background
    bg_w, bg_h = bg.size

    scale = layout["scale"]

    new_w = int(bg_w * scale)
    aspect = product.size[1] / product.size[0]
    new_h = int(new_w * aspect)

    product = product.resize((new_w, new_h), Image.Resampling.LANCZOS)

    # position logic
    if layout["position"] == "center":
        x = (bg_w - new_w) // 2
        y = (bg_h - new_h) // 2

    elif layout["position"] == "bottom_center":
        x = (bg_w - new_w) // 2
        y = int(bg_h * 0.55)

    elif layout["position"] == "human_fit":
        x = (bg_w - new_w) // 2
        y = int(bg_h * 0.40)

    else:
        x = 0
        y = 0

    # composite
    bg.paste(product, (x, y), product)

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    out_path = os.path.join(
        OUTPUT_DIR,
        f"composed_{uuid.uuid4().hex}.png"
    )

    bg.save(out_path, "PNG")

    return out_path