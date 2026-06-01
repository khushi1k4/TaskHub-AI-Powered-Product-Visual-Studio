import os
import uuid
import requests
from ml.config import TEMP_DIR
import base64


def download_if_url(image_input: str):

    if image_input.startswith("http"):
        r = requests.get(image_input, timeout=30)

        path = os.path.join(TEMP_DIR, f"{uuid.uuid4().hex}.jpg")

        with open(path, "wb") as f:
            f.write(r.content)

        return path

    return image_input

def image_to_base64(path):

    with open(path, "rb") as f:
        encoded = base64.b64encode(f.read()).decode("utf-8")

    return f"data:image/png;base64,{encoded}"