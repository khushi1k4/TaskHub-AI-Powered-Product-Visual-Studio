def get_layout(image_type: str):

    if image_type == "white_bg":
        return {
            "scale": 0.65,
            "position": "center"
        }

    if image_type.startswith("luxury"):
        return {
            "scale": 0.70,
            "position": "center"
        }

    if image_type.startswith("creative"):
        return {
            "scale": 0.60,
            "position": "bottom_center"
        }

    if image_type.startswith("model"):
        return {
            "scale": 0.85,
            "position": "human_fit"
        }

    return {
        "scale": 0.7,
        "position": "center"
    }