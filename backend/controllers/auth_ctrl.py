import re
from flask import jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from models.user_model import UserModel

class AuthController:
    @staticmethod
    def login(data):
        email = data['email']
        password = data['password']
        
        user = UserModel.get_by_email(email)
        if user:
            if check_password_hash(user['password'], password):
                session['user_id'] = user['id']
                return jsonify({"message": "Login successful", "session": session}), 200
            return jsonify({"message": "Invalid credentials"}), 401
        return jsonify({"message": "User not found"}), 404

    @staticmethod
    def register(data):
        username = data['name']
        email = data['email']
        password = data['password']
        print("HOLLA")

        existing_user_email = UserModel.get_by_email(email)
        if existing_user_email:
            return jsonify({"message": "Email is already registered"}), 400
        
        existing_user_username = UserModel.get_by_nickname(username)
        if existing_user_username:
            return jsonify({"message": "Username is already taken"}), 400

        if not AuthController.is_password_strong(password):
            return jsonify({"message": "Password must be at least 8 characters long, contain an uppercase letter, a number, and a special character"}), 400

        hashed_password = generate_password_hash(password)
        user_id = UserModel.create(username, email, hashed_password)
        
        if user_id:
            return jsonify({"message": "User registered successfully!", "user_id": user_id}), 201
        return jsonify({"error": "User registration failed"}), 500

    @staticmethod
    def is_password_strong(password):
        pattern = re.compile(r'^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$')
        return bool(pattern.match(password))

    @staticmethod
    def logout():
        session.clear()
        return jsonify({"message": "Logout successful!"}), 200
