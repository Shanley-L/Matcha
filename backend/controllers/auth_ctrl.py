import os
import re
from flask import jsonify, session, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from models.user_model import UserModel
from itsdangerous import URLSafeTimedSerializer as Serializer
from flask_mail import Message
from app import app, mail 

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
        if not user['is_email_validated']:
            return jsonify({"message": "Email not verified"}), 401
        if user and check_password_hash(user['password'], password):
            session['user_id'] = user['id']
            return jsonify({"message": "Login successful", "session": session}), 200
        return jsonify({"message": "Invalid credentials"}), 401
        if user:
            if check_password_hash(user['password'], password):
                session['user_id'] = user['id']
                return jsonify({"message": "Login successful", "session": session}), 200
            return jsonify({"message": "Invalid credentials"}), 401
        return jsonify({"message": "User not found"}), 404

    @staticmethod
    def register(data):
        if not data.get('name') or not data.get('email') or not data.get('password'):
            return jsonify({"message": "All fields are required"}), 400
        hashed_password = generate_password_hash(data['password'])
        username = data['name']
        email = data['email']
        password = data['password']

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
            AuthController.send_confirmation_email(data['email'])
            return jsonify({"message": "User registered successfully!", "user_id": user_id}), 201
        return jsonify({"error": "User registration failed"}), 500

    @staticmethod
    def send_confirmation_email(user_email):
        token = generate_confirmation_token(user_email)
        confirm_url = url_for('auth_bp.confirm_email', token=token, _external=True)
        html = f'<p>Click the link to confirm your email: <a href="{confirm_url}">Confirm Email</a></p>'
        msg = Message(subject='Confirm Your Email',
                    recipients=[user_email],
                    html=html)
        try:
            logging.error("Sending confirmation email")
            return mail.send(msg)
        except Exception as e:
            print(f"Error sending email: {e}")

    @staticmethod
    def is_password_strong(password):
        pattern = re.compile(r'^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$')
        return bool(pattern.match(password))

    @staticmethod
    def logout():
        session.clear()
        return jsonify({"message": "Logout successful!"}), 200
