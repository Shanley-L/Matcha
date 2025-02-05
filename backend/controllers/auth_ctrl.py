from flask import jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from models.user_model import UserModel

class AuthController:
    @staticmethod
    def login(data):
        email = data['email']
        password = data['password']
        
        user = UserModel.get_by_email(email)
        if user and check_password_hash(user['password'], password):
            session['user_id'] = user['id']
            return jsonify({"message": "Login successful", "session": session}), 200
        return jsonify({"message": "Invalid credentials"}), 401

    @staticmethod
    def register(data):
        hashed_password = generate_password_hash(data['password'])
        user_id = UserModel.create(data['name'], data['email'], hashed_password)
        
        if user_id:
            return jsonify({"message": "User registered successfully!", "user_id": user_id}), 201
        return jsonify({"error": "User registration failed"}), 500

    @staticmethod
    def logout():
        session.clear()
        return jsonify({"message": "Logout successful!"}), 200
