from flask import Blueprint, request, jsonify
from decorators import require_auth
from database import supabase, supabase_admin
from utils.cloudinary_upload import upload_image
from utils.email_service import send_task_assigned_email, send_task_accepted_email, send_task_revision_email, send_task_submitted_email, send_task_cancelled_email, send_task_reassigned_email

task_bp = Blueprint('tasks', __name__)

VALID_TRANSITIONS = {
    'pending': ['assigned'],
    'assigned': ['in_progress'],
    'in_progress': ['submitted'],
    'submitted': ['accepted', 'revision_requested'],
    'revision_requested': ['in_progress']
}

@task_bp.route('/', methods=['POST'])
@require_auth(allowed_roles=['admin'])
def create_task():
    # Automatically detect if Postman is sending raw JSON or Form-Data
    if request.is_json:
        data = request.json
        image_data = data.get('product_image') # Expects base64 string
    else:
        data = request.form
        image_data = request.files.get('product_image') # Expects physical file upload

    try:
        gender = data.get('gender')
        if gender not in ['male', 'female']:
            return jsonify({"error": "Gender must be either 'male' or 'female'"}), 400

        assigned_user_email = data.get('assigned_user_email')
        if not assigned_user_email:
            return jsonify({"error": "Admin must provide the assigned_user_email"}), 400

        assigned_user_email = assigned_user_email.strip()

        # Look up the user's ID using their email address
        user_res = supabase_admin.table('users').select('id').ilike('email', assigned_user_email).execute()
        if not user_res.data:
            return jsonify({"error": f"User with email '{assigned_user_email}' not found"}), 404
        
        assigned_user_id = user_res.data[0]['id']

        if not image_data:
            return jsonify({"error": "product_image is required"}), 400

        # Upload image to Cloudinary (Works with both Base64 and File objects!)
        image_url = upload_image(image_data)
        
        task_data = {
            "product_name": data.get('product_name'),
            "task_title": data.get('task_title'),
            "description": data.get('description'),
            "product_image_url": image_url,
            "gender": gender,
            "assigned_user_id": assigned_user_id,
            "admin_id": request.user['id'],
            "due_date": data.get('due_date'),
            "status": "assigned"
        }
        
        # Pass as a list to avoid PGRST116 if RLS hides the inserted row
        res = supabase_admin.table('tasks').insert([task_data]).execute()
        
        # Send Assignment Email
        admin_name = request.user.get('user_metadata', {}).get('full_name', 'Admin')
        send_task_assigned_email(assigned_user_email, task_data["task_title"], task_data["due_date"], admin_name)
        
        if res.data and len(res.data) > 0:
            return jsonify(res.data[0]), 201
        else:
            return jsonify({"message": "Task created successfully (data hidden by RLS)", "task": task_data}), 201
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400

@task_bp.route('/<task_id>/status', methods=['PATCH'])
@require_auth(allowed_roles=['admin', 'user'])
def update_status(task_id):
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        data = request.form or {}
    new_status = data.get('status') or data.get('newStatus') or data.get('new_status')
    user = request.user
    
    if not new_status:
        return jsonify({"error": f"Missing status in request. Received: {data}"}), 400
    
    try:
        task_res = supabase_admin.table('tasks').select('*').eq('id', task_id).execute()
        if not task_res.data:
            return jsonify({"error": "Task not found"}), 404
            
        task = task_res.data[0]
        
        if user['role'] == 'user' and task['assigned_user_id'] != user['id']:
            return jsonify({"error": "Forbidden: Not assigned to this task"}), 403
            
        if task['status'] == 'accepted':
            return jsonify({"error": "Task has already been accepted and cannot be changed"}), 400
            
        allowed_next_states = VALID_TRANSITIONS.get(task['status'], [])
        if new_status not in allowed_next_states:
            return jsonify({"error": f"Invalid transition from {task['status']} to {new_status}"}), 400
            
        update_data = {"status": new_status}
        
        if new_status == 'revision_requested':
            update_data['revision_count'] = task['revision_count'] + 1
            
        res = supabase_admin.table('tasks').update(update_data).eq('id', task_id).execute()
        return jsonify(res.data[0] if res.data else {}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@task_bp.route('/dashboard-stats', methods=['GET'])
@require_auth(allowed_roles=['admin'])
def get_dashboard_stats():
    try:
        # Fetch only tasks assigned by this admin
        tasks_res = supabase_admin.table('tasks').select('*').eq('admin_id', request.user['id']).execute()
        tasks = tasks_res.data or []
        
        total_tasks = len(tasks)
        pending_reviews = sum(1 for t in tasks if t.get('status') == 'submitted')
        submissions = sum(1 for t in tasks if t.get('status') in ['submitted', 'accepted', 'revision_requested'])
        
        # Fetch users with role 'user'
        users_res = supabase_admin.table('users').select('id, full_name').eq('role', 'user').execute()
        users_data = users_res.data or []
        total_users = len(users_data)
        
        # Map user IDs to names for quick lookup
        user_names = {u['id']: u['full_name'] for u in users_data}
        
        # Get 10 most recent tasks (sorted by created_at desc)
        recent_tasks = sorted(tasks, key=lambda x: x.get('created_at', ''), reverse=True)[:10]
        
        # Attach user names to recent tasks
        for task in recent_tasks:
            task['assigned_user_name'] = user_names.get(task.get('assigned_user_id'), 'Unknown User')
            
        return jsonify({
            "stats": {
                "totalTasks": total_tasks,
                "pendingReviews": pending_reviews,
                "submissions": submissions,
                "users": total_users
            },
            "recentTasks": recent_tasks
        }), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400

@task_bp.route('/', methods=['GET'])
@require_auth(allowed_roles=['admin'])
def list_tasks():
    try:
        scope = request.args.get('scope')
        if scope == 'me':
            # Fetch only tasks assigned by this admin
            res = supabase_admin.table('tasks').select('*').eq('admin_id', request.user['id']).execute()
        else:
            # Fetch all tasks globally
            res = supabase_admin.table('tasks').select('*').execute()
        return jsonify(res.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@task_bp.route('/my-tasks', methods=['GET'])
@require_auth(allowed_roles=['admin', 'user'])
def my_tasks():
    try:
        res = supabase_admin.table('tasks').select('*').eq('assigned_user_id', request.user['id']).execute()
        tasks = res.data or []
        
        # Get all admins
        admins_res = supabase_admin.table('users').select('id, full_name').eq('role', 'admin').execute()
        admin_names = {u['id']: u['full_name'] for u in (admins_res.data or [])}
        
        for task in tasks:
            task['admin_name'] = admin_names.get(task.get('admin_id'), 'Admin')
            
        return jsonify(tasks), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400

@task_bp.route('/<task_id>', methods=['GET'])
@require_auth(allowed_roles=['admin', 'user'])
def get_task(task_id):
    try:
        res = supabase_admin.table('tasks').select('*').eq('id', task_id).execute()
        if not res.data:
            return jsonify({"error": "Task not found"}), 404
            
        task = res.data[0]
        if task.get('admin_id'):
            admin_res = supabase_admin.table('users').select('full_name, email').eq('id', task['admin_id']).execute()
            if admin_res.data:
                task['admin_name'] = admin_res.data[0]['full_name']
                task['admin_email'] = admin_res.data[0]['email']
                
        return jsonify(task), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@task_bp.route('/<task_id>', methods=['DELETE'])
@require_auth(allowed_roles=['admin', 'user'])
def delete_task(task_id):
    user = request.user
    try:
        if user['role'] == 'user':
            task_res = supabase_admin.table('tasks').select('status, assigned_user_id').eq('id', task_id).execute()
            if not task_res.data:
                return jsonify({"error": "Task not found"}), 404
            
            task = task_res.data[0]
            if str(task['assigned_user_id']) != str(user['id']):
                return jsonify({"error": "Forbidden: Not your task"}), 403
                
            if task['status'] != 'accepted':
                return jsonify({"error": "Users can only delete tasks after they have been accepted by an admin"}), 400
                
        if user['role'] == 'admin':
            # Check if task is incomplete and has assigned user
            task_res = supabase_admin.table('tasks').select('status, assigned_user_id, task_title').eq('id', task_id).execute()
            if task_res.data:
                t = task_res.data[0]
                if t['status'] != 'accepted' and t['assigned_user_id']:
                    # Get user email
                    old_user_res = supabase_admin.table('users').select('email').eq('id', t['assigned_user_id']).execute()
                    if old_user_res.data and len(old_user_res.data) > 0:
                        admin_name = request.user.get('user_metadata', {}).get('full_name', 'Admin')
                        send_task_cancelled_email(old_user_res.data[0]['email'], t.get('task_title', 'Untitled Task'), admin_name)

        supabase_admin.table('tasks').delete().eq('id', task_id).execute()
        return jsonify({"message": "Task deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@task_bp.route('/<task_id>/assign', methods=['POST'])
@require_auth(allowed_roles=['admin'])
def assign_task(task_id):
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        data = request.form or {}
        
    assigned_user_email = data.get('assigned_user_email')
    if not assigned_user_email:
        return jsonify({"error": f"Missing 'assigned_user_email' in request. Received: {data}"}), 400
        
    assigned_user_email = assigned_user_email.strip()
        
    try:
        user_res = supabase_admin.table('users').select('id').ilike('email', assigned_user_email).execute()
        if not user_res.data or len(user_res.data) == 0:
            return jsonify({"error": f"User with email '{assigned_user_email}' not found in the users table."}), 404
            
        # Get existing task to check for old user
        old_task_res = supabase_admin.table('tasks').select('assigned_user_id, task_title').eq('id', task_id).execute()
        old_user_id = old_task_res.data[0]['assigned_user_id'] if old_task_res.data else None
        
        res = supabase_admin.table('tasks').update({
            "assigned_user_id": user_res.data[0]['id'],
            "status": "assigned"
        }).eq('id', task_id).execute()
        
        if not res.data:
            return jsonify({"error": "Task not found or update failed."}), 404
            
        task = res.data[0]
        admin_name = request.user.get('user_metadata', {}).get('full_name', 'Admin')
        
        # Send Reassignment Email to OLD user
        if old_user_id and str(old_user_id) != str(user_res.data[0]['id']):
            old_user = supabase_admin.table('users').select('email').eq('id', old_user_id).execute()
            if old_user.data and len(old_user.data) > 0:
                send_task_reassigned_email(old_user.data[0]['email'], task.get("task_title", "Untitled Task"), admin_name)

        # Send Assignment Email to NEW user
        send_task_assigned_email(assigned_user_email, task.get("task_title", "Untitled Task"), task.get("due_date", ""), admin_name)
            
        return jsonify(task), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400


@task_bp.route('/<task_id>/accept', methods=['PUT'])
@require_auth(allowed_roles=['admin'])
def accept_task(task_id):
    try:
        task_res = supabase_admin.table('tasks').select('status, task_title, assigned_user_id').eq('id', task_id).execute()
        if not task_res.data:
            return jsonify({"error": "Task not found"}), 404
            
        if task_res.data[0]['status'] != 'submitted':
            return jsonify({"error": "Task can only be accepted after it has been submitted by the user"}), 400
            
        res = supabase_admin.table('tasks').update({"status": "accepted"}).eq('id', task_id).execute()
        
        # Send Accepted Email
        user_res = supabase_admin.table('users').select('email').eq('id', task_res.data[0]['assigned_user_id']).execute()
        if user_res.data and len(user_res.data) > 0:
            admin_name = request.user.get('user_metadata', {}).get('full_name', 'Admin')
            send_task_accepted_email(user_res.data[0]['email'], task_res.data[0].get('task_title', 'Untitled Task'), admin_name)
            
        return jsonify(res.data[0]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@task_bp.route('/<task_id>/request-revision', methods=['PUT'])
@require_auth(allowed_roles=['admin'])
def request_revision(task_id):
    try:
        task_res = supabase_admin.table('tasks').select('status, revision_count, task_title, assigned_user_id').eq('id', task_id).execute()
        if not task_res.data:
            return jsonify({"error": "Task not found"}), 404
            
        if task_res.data[0]['status'] != 'submitted':
            return jsonify({"error": "Revisions can only be requested after the task has been submitted by the user"}), 400
            
        count = task_res.data[0]['revision_count'] if task_res.data[0].get('revision_count') is not None else 0
        res = supabase_admin.table('tasks').update({
            "status": "revision_requested",
            "revision_count": count + 1
        }).eq('id', task_id).execute()
        
        # Send Revision Email
        user_res = supabase_admin.table('users').select('email').eq('id', task_res.data[0]['assigned_user_id']).execute()
        if user_res.data and len(user_res.data) > 0:
            admin_name = request.user.get('user_metadata', {}).get('full_name', 'Admin')
            send_task_revision_email(user_res.data[0]['email'], task_res.data[0].get('task_title', 'Untitled Task'), admin_name)
            
        return jsonify(res.data[0]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@task_bp.route('/<task_id>/start', methods=['PUT'])
@require_auth(allowed_roles=['user'])
def start_task(task_id):
    try:
        task_res = supabase_admin.table('tasks').select('status, assigned_user_id').eq('id', task_id).execute()
        if not task_res.data:
            return jsonify({"error": "Task not found"}), 404
            
        task = task_res.data[0]
        if task['assigned_user_id'] != request.user['id']:
            return jsonify({"error": "Forbidden: Not assigned to this task"}), 403
            
        if task['status'] == 'accepted':
            return jsonify({"error": "Task has already been accepted and cannot be changed"}), 400
            
        res = supabase_admin.table('tasks').update({"status": "in_progress"}).eq('id', task_id).execute()
        return jsonify(res.data[0] if res.data else {}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@task_bp.route('/<task_id>/submit', methods=['POST'])
@require_auth(allowed_roles=['user'])
def submit_task(task_id):
    try:
        task_res = supabase_admin.table('tasks').select('status, assigned_user_id, admin_id').eq('id', task_id).execute()
        if not task_res.data:
            return jsonify({"error": "Task not found"}), 404
            
        task = task_res.data[0]
        if task['assigned_user_id'] != request.user['id']:
            return jsonify({"error": "Forbidden: Not assigned to this task"}), 403
            
        if task['status'] == 'accepted':
            return jsonify({"error": "Task has already been accepted and cannot be changed"}), 400
            
        res = supabase_admin.table('tasks').update({"status": "submitted"}).eq('id', task_id).execute()
        
        # Send Submission Email to Admin
        admin_res = supabase_admin.table('users').select('email, full_name').eq('id', task['admin_id']).execute()
        if admin_res.data and len(admin_res.data) > 0:
            admin = admin_res.data[0]
            user_name = request.user.get('user_metadata', {}).get('full_name', 'User')
            send_task_submitted_email(admin['email'], admin['full_name'], user_name, task.get('task_title', 'Untitled Task'))
            
        return jsonify(res.data[0] if res.data else {}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400