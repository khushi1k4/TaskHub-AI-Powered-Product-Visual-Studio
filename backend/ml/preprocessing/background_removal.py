import os
import uuid
from rembg import remove
from ml.config import TEMP_DIR
from ml.utils.file_io import download_if_url


def remove_background(image_input):

    image_path = download_if_url(image_input)

    with open(image_path, "rb") as f:
        output = remove(f.read())

    out_path = os.path.join(TEMP_DIR, f"{uuid.uuid4().hex}.png")

    with open(out_path, "wb") as f:
        f.write(output)

    return out_path