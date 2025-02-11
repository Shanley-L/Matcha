from flask import Blueprint, request
from controllers.user_ctrl import UserController

user_bp = Blueprint('user_bp', __name__)

@user_bp.route('profile', methods=['GET'])
def get_user_profile():
    return UserController.get_user_profile()

@user_bp.route('update', methods=['PUT'])
def update_user_profile():
    data = request.get_json()
    return UserController.update_user_profile(data)
