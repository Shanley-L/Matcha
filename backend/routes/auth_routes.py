from flask import Blueprint, request
from controllers.auth_ctrl import AuthController

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
