from flask import jsonify, session
from models.user_model import UserModel

class UserController:
    @staticmethod
    def get_user_profile():
        if 'user_id' not in session:
            return jsonify({"message": "Unauthorized by session"}), 401

        user = UserModel.get_by_id(session['user_id'])
        if user:
            return jsonify(user), 200
        return jsonify({"error": "User not found"}), 404
