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

    @staticmethod
    def update_user_profile(data):
        if 'user_id' not in session:
            return jsonify({"message": "Unauthorized by session"}), 401

        user_id = session['user_id']

        # Appel à la méthode de mise à jour
        updated_user_id = UserModel.update_user(
            user_id,
            username=data.get('username'),
            email=data.get('email'),
            password=data.get('password'),
            first_name=data.get('first_name'),
            gender=data.get('gender'),
            sexual_orientation=data.get('sexual_orientation'),
            looking_for=data.get('looking_for'),
            bio=data.get('bio'),
            birthdate=data.get('birthdate'),
            city=data.get('city'),
            interests=data.get('interests')
        )

        if updated_user_id:
            return jsonify({"message": "User profile updated successfully"}), 200
        return jsonify({"error": "Failed to update user profile"}), 400
