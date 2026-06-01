import os
import shutil
import uuid
from ml.config import TEMP_DIR


def build_reference_image(clean_image):

    print("\n[REFERENCE BUILDER]")
    print("INPUT:", clean_image)
    print("TYPE:", type(clean_image))

    ref_path = os.path.join(TEMP_DIR, f"ref_{uuid.uuid4().hex}.png")

    shutil.copy(clean_image, ref_path)

    print("CREATED REF PATH:", ref_path)
    print("RETURN TYPE: str")

    return ref_path