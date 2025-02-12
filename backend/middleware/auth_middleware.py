from functools import wraps
from flask import session, jsonify, request
from models.user_model import UserModel
import logging

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({"message": "Authentication required"}), 401
        return f(*args, **kwargs)
    return decorated_function

def email_verified_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            logging.error("Authentication required")
            return jsonify({"message": "Authentication required"}), 401
        
        user = UserModel.get_by_id(session['user_id'])
        if not user or not user.get('is_email_verified'):
            logging.error(f"Email verification required for user {user}")
            return jsonify({"message": "Email verification required"}), 403
        return f(*args, **kwargs)
    return decorated_function

def public_route(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        return f(*args, **kwargs)
    return decorated_function 