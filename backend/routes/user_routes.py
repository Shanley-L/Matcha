from flask import Blueprint, request
from controllers.user_ctrl import UserController
from middleware.auth_middleware import login_required, email_verified_required

user_bp = Blueprint('user', __name__)

@user_bp.route('/profile', methods=['GET'])
@email_verified_required
def get_user_profile():
    return UserController.get_user_profile()

@user_bp.route('/update', methods=['PUT'])
@email_verified_required
def update_user_profile():
    return UserController.update_user_profile()
