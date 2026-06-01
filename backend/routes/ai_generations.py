from flask import Blueprint, request, jsonify
from database import supabase
from decorators import require_auth
from tasks.notification_tasks import generate_ai_image_task, generate_dynamic_ai_image_task
from utils.cloudinary_upload import upload_image

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/generate', methods=['POST'])
@require_auth(allowed_roles=['admin', 'user'])
def generate_ai_dynamic():
    # Handle both multipart/form-data (file uploads) and JSON
    if request.is_json:
        data = request.json
        image_data = data.get('product_image')
        product_name = data.get('product_name')
        gender = data.get('gender')
        task_id = data.get('task_id')
    else:
        data = request.form
        image_data = request.files.get('product_image') or data.get('product_image')
        product_name = data.get('product_name')
        gender = data.get('gender')
        task_id = data.get('task_id')

    if not image_data or not product_name or not gender:
        return jsonify({"error": "product_image, product_name, and gender are required"}), 400

    # 1. Upload to Cloudinary if it's a file or Base64 (Skip if already a URL)
    if isinstance(image_data, str) and image_data.startswith('http'):
        image_url = image_data
    else:
        try:
            image_url = upload_image(image_data)
        except Exception as e:
            return jsonify({"error": f"Failed to upload image: {str(e)}"}), 500

    # 2. Enqueue the task with dynamic parameters (generates all 8 images)
    job = generate_dynamic_ai_image_task.delay(
        image_url, 
        product_name, 
        gender, 
        task_id
    )

    return jsonify({'job_id': job.id, 'status': 'queued'}), 202

@ai_bp.route('/tasks/<task_id>/generate', methods=['POST'])
@require_auth(allowed_roles=['admin', 'user'])
def generate_ai(task_id):
    data = request.json
    prompt = data.get('prompt')
    
    # Enqueue background job via Celery
    job = generate_ai_image_task.delay(task_id, prompt)
    
    return jsonify({'job_id': job.id, 'status': 'queued'}), 202

@ai_bp.route('/jobs/<job_id>/status', methods=['GET'])
@require_auth(allowed_roles=['admin', 'user'])
def job_status(job_id):
    from tasks.notification_tasks import generate_ai_image_task, generate_dynamic_ai_image_task
    # Try fetching the dynamic task first, fallback to the old one if needed
    try:
        job = generate_dynamic_ai_image_task.AsyncResult(job_id)
        if job.status == 'PENDING' and not job.info:
            job = generate_ai_image_task.AsyncResult(job_id)
    except:
        job = generate_ai_image_task.AsyncResult(job_id)
        
    return jsonify({
        'job_id': job.id,
        'status': job.status,
        'result': job.result if job.status == 'SUCCESS' else None
    })

@ai_bp.route('/tasks/<task_id>/generations', methods=['GET'])
@require_auth(allowed_roles=['admin', 'user'])
def get_generations(task_id):
    try:
        from database import supabase_admin
        result = supabase_admin.table('generated_images').select('*').eq('task_id', task_id).execute()
        return jsonify(result.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@ai_bp.route('/generations/<gen_id>', methods=['DELETE'])
@require_auth(allowed_roles=['admin', 'user'])
def delete_generation(gen_id):
    try:
        supabase.table('generated_images').delete().eq('id', gen_id).execute()
        return jsonify({'message': 'Deleted successfully'}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400