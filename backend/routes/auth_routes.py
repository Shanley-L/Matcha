from flask import Blueprint, request, jsonify
from controllers.auth_ctrl import AuthController
from controllers.user_ctrl import UserModel
import logging

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('login', methods=['POST'])
def login():
    data = request.get_json()
    return AuthController.login(data)

@auth_bp.route('register', methods=['POST'])
def register():
    data = request.get_json()
    return AuthController.register(data)

@auth_bp.route('logout', methods=['POST'])
def logout():
    return AuthController.logout()

@auth_bp.route('/confirm/<token>')
def confirm_email(token):
    email = AuthController.confirm_token(token)
    if email:
        user = UserModel.get_by_email(email)
        if not user['is_email_verified']:
            return UserModel.verified(user['id'])  # Redirect to a profile page or home
        else:
            logging.error("Email verified")
            return jsonify({"message": "Email already verified"}), 400
    else:
        return jsonify({"message": "The confirmation link is invalid or has expired."}), 400 