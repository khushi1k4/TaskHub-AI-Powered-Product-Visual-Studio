import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

TEMP_DIR = os.path.join(BASE_DIR, "temp")
OUTPUT_DIR = os.path.join(BASE_DIR, "output")

os.makedirs(TEMP_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# =========================
# CLOUDLARE TEXT2IMAGE MODEL
# =========================

# ✅ BEST OPTION (HIGH QUALITY)
CLOUDFLARE_MODEL = "@cf/meta/llama-3.1-8b-instruct"

# Alternative (slower but stable)
# CLOUDFLARE_MODEL = "@cf/stabilityai/stable-diffusion-xl-base-1.0"

# =========================
# GENERATION SETTINGS
# =========================

STRENGTH = 0.0  # ❌ NOT USED in text2image (keep 0 or remove usage)
GUIDANCE = 7.5

MAX_RETRIES = 3