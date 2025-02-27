from flask import Blueprint, request, jsonify, session
from controllers.auth_ctrl import AuthController
from controllers.user_ctrl import UserModel
from middleware.auth_middleware import public_route, login_required
import logging

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/whoami', methods=['GET'])
def whoami():
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    return AuthController.get_current_user()

@auth_bp.route('/login', methods=['POST'])
@public_route
def login():
    data = request.get_json()
    return AuthController.login(data)

@auth_bp.route('/register', methods=['POST'])
@public_route
def register():
    data = request.get_json()
    return AuthController.register(data)

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    return AuthController.logout()

@auth_bp.route('/confirm/<token>')
@public_route
def confirm_email(token):
    logging.error(f"Token: {token}")
    email = AuthController.confirm_token(token)
    logging.error(f"Email: {email}")
    if email:
        user = UserModel.get_by_email(email)
        logging.error(f"User: {user}")
        if not user['is_email_verified']:
            logging.error("Verifying mail")
            return UserModel.verified(user['id'])  # Redirect to a profile page or home
        else:
            logging.error("Email verified")
            return jsonify({"message": "Email already verified"}), 400
    else:
        return jsonify({"message": "The confirmation link is invalid or has expired."}), 400 