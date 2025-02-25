from flask import Blueprint, request
from controllers.user_ctrl import UserController
from middleware.auth_middleware import login_required, email_verified_required

user_bp = Blueprint('user', __name__)

@user_bp.route('/profile', methods=['GET'])
@email_verified_required
def get_user_profile():
    return UserController.get_user_profile()

@user_bp.route('/profile/secure', methods=['GET'])
@login_required
def get_user_profile_secure():
    return UserController.get_user_profile_secure()

@user_bp.route('/update', methods=['PUT'])
@email_verified_required
def update_user_profile():
    return UserController.update_user_profile()

@user_bp.route('/matches', methods=['GET'])
def get_potential_matches():
    return UserController.get_potential_matches()

@user_bp.route('/getmatches', methods=['GET'])
def get_matches_list():
    return UserController.get_matches_list()

@user_bp.route('/likes', methods=['GET'])
def get_likes():
    return UserController.get_likes()

@user_bp.route('/like/<int:liked_user_id>', methods=['POST'])
def like_user(liked_user_id):
    return UserController.like_user(liked_user_id)

@user_bp.route('/dislike/<int:disliked_user_id>', methods=['POST'])
def dislike_user(disliked_user_id):
    return UserController.dislike_user(disliked_user_id)

@user_bp.route('/add-test-likes', methods=['POST'])
@email_verified_required
def add_test_likes():
    return UserController.add_test_likes()

@user_bp.route('/<int:user_id>/profile', methods=['GET'])
@email_verified_required
def get_other_user_profile(user_id):
    return UserController.get_user_profile_by_id(user_id)
