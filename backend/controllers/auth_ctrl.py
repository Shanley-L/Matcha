import os
import re
from flask import jsonify, session, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from models.user_model import UserModel
from itsdangerous import URLSafeTimedSerializer as Serializer
from flask_mail import Message
from app import app, mail 
import logging
from utils.password_utils import contains_english_word

s = Serializer(app.config['SECRET_KEY'])

class AuthController:
    @staticmethod
    def generate_confirmation_token(email):
        return s.dumps(email, salt=os.getenv('EMAIL_CONFIRM'))

    @staticmethod
    def confirm_token(token, expiration=3600):
        try:
            email = s.loads(token, salt=os.getenv('EMAIL_CONFIRM'), max_age=expiration)
        except:
            return False
        return email

    @staticmethod
    def login(data):
        email = data['email']
        password = data['password']
        if not email or not password:
            return jsonify({"message": "Email and password are required"}), 400
        user = UserModel.get_by_email(email)
        if user and check_password_hash(user['password'], password):
            session['user_id'] = user['id']
            UserModel.update_user_connection(user['id'])
            return jsonify({"message": "Login successful", "user": user}), 200
        return jsonify({"message": "Invalid credentials"}), 401

    @staticmethod
    def register(data):
        if not data.get('name') or not data.get('email') or not data.get('password'):
            return jsonify({"message": "All fields are required"}), 400
        hashed_password = generate_password_hash(data['password'])
        username = data['name']
        email = data['email']
        password = data['password']

        if contains_english_word(password):
            return jsonify({"message": "Password cannot contain English words"}), 400

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
            AuthController.send_confirmation_email(email)
            return jsonify({"message": "User registered successfully!", "user_id": user_id}), 201
        return jsonify({"error": "User registration failed"}), 500

    @staticmethod
    def send_confirmation_email(user_email):
        token = AuthController.generate_confirmation_token(user_email)
        confirm_url = f'http://localhost:3000/confirm/{token}'
        html = f'<p>Click the link to confirm your email: <a href="{confirm_url}">Confirm Email</a></p>'
        msg = Message(subject='Confirm Your Email',
                    recipients=[user_email],
                    html=html)
        try:
            return mail.send(msg)
        except Exception as e:
            print(f"Error sending email: {e}")

    @staticmethod
    def is_password_strong(password):
        pattern = re.compile(r'^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$')
        return bool(pattern.match(password))

    @staticmethod
    def logout():
        UserModel.update_user_latest_connection(session['user_id'])
        session.clear()
        logging.error("Logout successful")
        return jsonify({"message": "Logout successful!"}), 200

    @staticmethod
    def get_current_user():
        try:
            user = UserModel.get_by_id(session['user_id'])
            if not user:
                return jsonify({'error': 'User not found'}), 404
                
            # Remove sensitive information
            if 'password' in user:
                del user['password']
                
            return jsonify(user)
        except Exception as e:
            logging.error(f"Error in get_current_user: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500
