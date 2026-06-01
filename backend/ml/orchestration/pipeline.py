import time
from ml.preprocessing.background_removal import remove_background
from ml.preprocessing.reference_builder import build_reference_image
from ml.vision.product_analyzer import analyze_product
from ml.prompt_engine.prompt_builder import build_all_prompts
from ml.postprocessing.image_validator import validate_image
from ml.postprocessing.quality_checker import run_quality_checks
from ml.postprocessing.enhancer import enhance_image

from ml.generation.cloudflare import generate_with_cloudflare
from ml.generation.sdxl_human import generate_human_with_sdxl

def run_pipeline(task_id, image_url, product_name, prompt_filters=None, gender=None):

    print("\n========== PIPELINE START ==========")
    print("TASK ID:", task_id)
    print("IMAGE URL TYPE:", type(image_url))
    print("PRODUCT NAME:", product_name)

    # ---------------- STEP 1 ----------------
    print("\nSTEP 1 -> Background removal")
    clean = remove_background(image_url)
    print("CLEAN IMAGE:", clean)

    # ---------------- STEP 2 ----------------
    print("\nSTEP 2 -> Reference lock")
    ref = build_reference_image(clean)
    
    if isinstance(ref, list):
        ref = ref[0]

    # ---------------- STEP 3 ----------------
    print("\nSTEP 3 -> Vision analysis")
    product_data = analyze_product(clean)

    # ---------------- STEP 4 ----------------
    print("\nSTEP 4 -> Prompt building")
    prompts = build_all_prompts(
        product_name,
        product_data,
        reference_image=ref,
        gender=gender
    )

    # Filter out prompts that weren't requested by the specific button
    if prompt_filters:
        prompts = [p for p in prompts if p["type"] in prompt_filters]

    print(f"TOTAL PROMPTS TO GENERATE: {len(prompts)}")

    results = []
    
    # ---------------- STEP 5 ----------------
    for i, p in enumerate(prompts):
        print(f"\n--- GENERATING {i+1}/{len(prompts)}: {p['type']} ---")
        try:
            if p["type"] in ["model_front", "model_side", "model_closeup"]:
                # Pass gender to SDXL Image-to-Image
                img = generate_human_with_sdxl(
                    p["prompt"],
                    ref,
                    product_name,
                    gender=gender
                )
            else:
                # Use original Cloudflare generator for the 5 backgrounds
                img = generate_with_cloudflare(
                    p["prompt"],
                    p["type"],
                    ref
                )

            print("RAW OUTPUT:", img)

            ok, msg = validate_image(img)
            if not ok:
                continue

            ok, msg = run_quality_checks(img)
            if not ok:
                continue

            # Pass the 'clean' transparent image here for the overlay composite!
            final = enhance_image(img, clean, p["type"], product_name)

            results.append({
                "type": p["type"],
                "image": final,
                "prompt": p["prompt"]
            })

            print("SAVED FINAL IMAGE:", final)

            # Delay to prevent Rate Limits
            print("Waiting 1 second before next generation...")
            time.sleep(1)

        except Exception as e:
            print("ERROR:", e)

    print("\n========== PIPELINE END ==========")
    return results