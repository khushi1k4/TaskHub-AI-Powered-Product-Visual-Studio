from functools import wraps
from flask import request, jsonify
from database import supabase


def require_auth(allowed_roles=None):

    if allowed_roles is None:
        allowed_roles = []

    def decorator(f):

        @wraps(f)
        def decorated_function(*args, **kwargs):

            auth_header = request.headers.get("Authorization")

            if not auth_header:
                return jsonify({
                    "error": "Unauthorized"
                }), 401

            token = auth_header.replace(
                "Bearer ",
                ""
            )

            try:

                from database import supabase_admin, supabase
                
                # Use the proxies which handle connections safely
                user = supabase.auth.get_user(token)
                
                if not user.user:
                    return jsonify({
                        "error": "Invalid token"
                    }), 401

                user_id = user.user.id
                
                # Always fetch role from public.users using admin client to bypass RLS
                user_record = supabase_admin.table('users').select('role').eq('id', user_id).execute()
                role = user_record.data[0]['role'] if user_record.data else "user"

                if allowed_roles and role not in allowed_roles:
                    return jsonify({
                        "error": "Forbidden"
                    }), 403

                request.user = {
                    "id": user_id,
                    "role": role,
                    "email": user.user.email
                }

            except Exception as e:
                import traceback
                with open("error_log_auth.txt", "w") as err_file:
                    err_file.write(traceback.format_exc())
                return jsonify({
                    "error": str(e)
                }), 401

            return f(*args, **kwargs)

        return decorated_function

    return decorator