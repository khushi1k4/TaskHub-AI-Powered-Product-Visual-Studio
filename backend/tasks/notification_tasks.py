from workers.celery_app import celery
from database import supabase_admin
import resend
from config import Config
import os
import sys

# Ensure backend directory is in sys.path for Celery Windows prefork child processes
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

from ml.orchestration.pipeline import run_pipeline
from utils.cloudinary_upload import upload_image

resend.api_key = Config.RESEND_API_KEY

@celery.task
def send_email_async(subject, recipient, body, html_body=None):
    try:
        resend.Emails.send({
            "from": Config.EMAIL_SENDER,
            "to": recipient,
            "subject": subject,
            "html": html_body or body
        })
        print(f"Sent email to {recipient}")
    except Exception as e:
        print(f"Failed to send email to {recipient}: {e}")

@celery.task
def generate_ai_image_task(task_id, prompt):
    prompt_filters = None
    if prompt == "White Background":
        prompt_filters = ["white_bg"]
    elif prompt == "Luxury Background":
        prompt_filters = ["luxury_1", "luxury_2"]
    elif prompt == "Creative/Artistic Background":
        prompt_filters = ["creative_1", "creative_2"]
    elif prompt == "Model Generation":
        prompt_filters = ["model_front", "model_side", "model_closeup"]

    # 1. Fetch task details from Supabase to pass to the ML pipeline
    task_res = supabase_admin.table('tasks').select('*').eq('id', task_id).execute()
    if not task_res.data:
        return {'status': 'error', 'message': 'Task not found'}
        
    task_data = task_res.data[0]
    product_image_url = task_data.get('product_image_url')
    product_name = task_data.get('product_name')
    gender = task_data.get('gender') # Fetch gender from DB
    
    # 2. Run the ML pipeline
    pipeline_results = run_pipeline(
        task_id=task_id,
        image_url=product_image_url,
        product_name=product_name,
        prompt_filters=prompt_filters,
        gender=gender # Pass gender here
    )
    
    uploaded_images = []
    
    # 3. Upload generated local images to Cloudinary and insert into DB
    for result in pipeline_results:
        local_path = result['image']
        image_type = result['type']
        used_prompt = result['prompt']
        
        try:
            cloudinary_url = upload_image(local_path)
            
            supabase_admin.table('generated_images').insert({
                'task_id': task_id,
                'image_url': cloudinary_url,
                'prompt_used': used_prompt,
                'image_type': image_type
            }).execute()
            
            uploaded_images.append(cloudinary_url)
            
            if os.path.exists(local_path):
                os.remove(local_path)
                
        except Exception as e:
            print(f"Failed to process image {local_path}: {e}")
    
    return {'status': 'completed', 'image_urls': uploaded_images}

@celery.task
def generate_dynamic_ai_image_task(image_url, product_name, gender, task_id=None):
    # Run the ML pipeline with dynamic inputs (generates all 8 images automatically)
    pipeline_results = run_pipeline(
        task_id=task_id or "dynamic_task",
        image_url=image_url,
        product_name=product_name,
        gender=gender
    )
    
    uploaded_images = []
    
    for result in pipeline_results:
        local_path = result['image']
        image_type = result['type']
        used_prompt = result['prompt']
        
        try:
            cloudinary_url = upload_image(local_path)
            
            # Save to DB if task_id is provided
            if task_id:
                supabase_admin.table('generated_images').insert({
                    'task_id': task_id,
                    'image_url': cloudinary_url,
                    'prompt_used': used_prompt,
                    'image_type': image_type
                }).execute()
                
            uploaded_images.append({
                "type": image_type,
                "url": cloudinary_url
            })
            
            if os.path.exists(local_path):
                os.remove(local_path)
                
        except Exception as e:
            print(f"Failed to process image {local_path}: {e}")
            
    return {'status': 'completed', 'images': uploaded_images}