from workers.celery_app import celery
from database import supabase
from ml.orchestration.pipeline import run_pipeline

def save_image_to_db(task_id, img_type, image, prompt):
    supabase.table('generated_images').insert({
        'task_id': task_id,
        'image_type': img_type,
        'image_url': image,
        'prompt_used': prompt
    }).execute()

# BUTTON 1: White Background (1 image)
@celery.task
def generate_white_bg(task_id, product_name, image_url):
    results = run_pipeline(task_id, image_url, product_name, prompt_filters=["white_bg"])
    for r in results:
        save_image_to_db(task_id, r["type"], r["image"], r["prompt"])
    return {"task_id": task_id, "status": "completed", "count": len(results)}

# BUTTON 2: Luxury Theme (2 images)
@celery.task
def generate_luxury(task_id, product_name, image_url):
    results = run_pipeline(task_id, image_url, product_name, prompt_filters=["luxury_1", "luxury_2"])
    for r in results:
        save_image_to_db(task_id, r["type"], r["image"], r["prompt"])
    return {"task_id": task_id, "status": "completed", "count": len(results)}

# BUTTON 3: Creative Theme (2 images)
@celery.task
def generate_creative(task_id, product_name, image_url):
    results = run_pipeline(task_id, image_url, product_name, prompt_filters=["creative_1", "creative_2"])
    for r in results:
        save_image_to_db(task_id, r["type"], r["image"], r["prompt"])
    return {"task_id": task_id, "status": "completed", "count": len(results)}

# BUTTON 4: Human Model (3 images)
@celery.task
def generate_model(task_id, product_name, image_url):
    results = run_pipeline(task_id, image_url, product_name, prompt_filters=["model_front", "model_side", "model_closeup"])
    for r in results:
        save_image_to_db(task_id, r["type"], r["image"], r["prompt"])
    return {"task_id": task_id, "status": "completed", "count": len(results)}