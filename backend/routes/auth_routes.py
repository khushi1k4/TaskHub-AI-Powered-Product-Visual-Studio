from flask import Blueprint, request, jsonify
from decorators import require_auth
from database import supabase, supabase_admin
import resend
from config import Config
from supabase import create_client

resend.api_key = Config.RESEND_API_KEY
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.json
    try:
        res = supabase_admin.auth.admin.create_user({
            "email": data.get('email'),
            "password": data.get('password'),
            "email_confirm": True,
            "user_metadata": {
                "full_name": data.get('full_name'),
                "role": data.get('role', 'user')
            }
        })
        
        # Upsert into the public.users table to avoid duplicate key errors if Supabase has a trigger
        supabase_admin.table('users').upsert({
            "id": res.user.id,
            "email": data.get('email'),
            "full_name": data.get('full_name'),
            "role": data.get('role', 'user')
        }).execute()
        
        return jsonify({"message": "User created successfully", "user_id": res.user.id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    try:
        res = supabase.auth.sign_in_with_password({
            "email": data.get('email'),
            "password": data.get('password')
        })
        
        user_profile = supabase_admin.table("users").select("*").eq("id", res.user.id).execute()
        
        return jsonify({
            "access_token": res.session.access_token,
            "refresh_token": res.session.refresh_token,
            "user": user_profile.data[0] if user_profile.data else {}
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 401

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    email = request.json.get('email')
    try:
        res = supabase.auth.admin.generate_link({"type": "recovery", "email": email})
        action_link = res.properties.action_link
        
        resend.Emails.send({
            "from": "TaskHub <noreply@yourdomain.com>",
            "to": email,
            "subject": "Reset your Password",
            "html": f"<p>Click <a href='{action_link}'>here</a> to reset your password.</p>"
        })
        return jsonify({"message": "Reset link sent successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@auth_bp.route('/me', methods=['GET'])
@require_auth(allowed_roles=['admin', 'user'])
def get_me():
    # request.user is injected by your @require_auth decorator
    return jsonify({"user": request.user}), 200

@auth_bp.route('/users', methods=['GET'])
@require_auth(allowed_roles=['admin'])
def get_users():
    try:
        res = supabase_admin.table('users').select('id, email, full_name, role').execute()
        return jsonify(res.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@auth_bp.route('/logout', methods=['POST'])
@require_auth(allowed_roles=['admin', 'user'])
def logout():
    try:
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        supabase.auth.admin.sign_out(token)
        return jsonify({"message": "Logged out successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@auth_bp.route('/oauth/callback', methods=['POST'])
@require_auth(allowed_roles=['admin', 'user'])
def oauth_callback():
    try:
        user = request.user
        
        frontend_user = request.json.get('user', {}) if request.json else {}
        created_at = frontend_user.get('created_at', '')
        last_sign_in_at = frontend_user.get('last_sign_in_at', '')
        
        # Check if the user already exists in the public.users table
        existing_user = supabase_admin.table('users').select('id, role').eq('id', user['id']).execute()
        
        # A user is considered "new" if they don't exist OR if their created_at and last_sign_in_at are practically identical (brand new signup, trigger fired)
        is_new_user = not existing_user.data or (created_at and last_sign_in_at and created_at == last_sign_in_at)
        
        if is_new_user:
            # Get full name and role from the frontend request
            data = request.json or {}
            user_metadata = frontend_user.get('user_metadata', {})
            full_name = user_metadata.get('full_name', '')
            requested_role = data.get('role')
            
            # Use the requested role if provided, otherwise default to 'user'
            final_role = requested_role if requested_role in ['admin', 'user'] else 'user'
            
            # Upsert into public.users (upsert handles cases where trigger already inserted them)
            supabase_admin.table('users').upsert({
                "id": user['id'],
                "email": user['email'],
                "full_name": full_name,
                "role": final_role
            }).execute()
            
            # Also update the user's metadata in Auth so get_user returns the correct role in the future
            if final_role == 'admin':
                supabase_admin.auth.admin.update_user_by_id(user['id'], {"user_metadata": {"role": "admin"}})
                
            role = final_role
        else:
            role = existing_user.data[0].get('role', 'user')
            
        return jsonify({"message": "OAuth user synced successfully", "role": role}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400