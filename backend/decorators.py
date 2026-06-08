from functools import wraps
from flask import request, jsonify
import traceback


def require_auth(allowed_roles=None):
    if allowed_roles is None:
        allowed_roles = []

    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):

            print("===== AUTH DECORATOR START =====")

            try:
                # Import inside function to avoid circular imports
                from database import supabase, supabase_admin

                # Get Authorization header
                auth_header = request.headers.get("Authorization")
                print(f"Auth Header Present: {bool(auth_header)}")

                if not auth_header:
                    print("No Authorization header")
                    return jsonify({
                        "error": "Unauthorized"
                    }), 401

                # Extract token
                token = auth_header.replace("Bearer ", "").strip()
                print(f"Token Length: {len(token)}")

                if not token:
                    print("Token missing")
                    return jsonify({
                        "error": "Token missing"
                    }), 401

                print("Calling Supabase get_user()...")

                # Verify JWT
                user_response = supabase.auth.get_user(token)

                print("Supabase get_user() completed")

                if not user_response or not user_response.user:
                    print("Invalid user")
                    return jsonify({
                        "error": "Invalid token"
                    }), 401

                user = user_response.user

                print(f"User ID: {user.id}")
                print(f"Email: {user.email}")

                print("Fetching role from users table...")

                user_record = (
                    supabase_admin
                    .table("users")
                    .select("role")
                    .eq("id", user.id)
                    .execute()
                )

                print("Users table query completed")

                role = "user"

                if user_record.data:
                    role = user_record.data[0].get("role", "user")

                print(f"Role: {role}")

                # Role check
                if allowed_roles and role not in allowed_roles:
                    print("Role not allowed")
                    return jsonify({
                        "error": "Forbidden"
                    }), 403

                # Attach user to request
                request.user = {
                    "id": user.id,
                    "email": user.email,
                    "role": role
                }

                print("Authentication successful")
                print("===== AUTH DECORATOR END =====")

                return f(*args, **kwargs)

            except Exception as e:
                print("===== AUTH ERROR =====")
                print(str(e))
                print(traceback.format_exc())

                try:
                    with open("auth_error.log", "a") as log_file:
                        log_file.write("\n\n")
                        log_file.write(traceback.format_exc())
                except:
                    pass

                return jsonify({
                    "error": str(e)
                }), 401

        return decorated_function

    return decorator