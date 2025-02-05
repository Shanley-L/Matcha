from flask import Blueprint
from controllers.user_ctrl import UserController

user_bp = Blueprint('user_bp', __name__)

@user_bp.route('profile', methods=['GET'])
def get_user_profile():
    return UserController.get_user_profile()
