from flask import Flask, request, jsonify, session
from flask_cors import CORS
import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key_here'
CORS(app, supports_credentials=True)

db_config = {
    'host': os.getenv('DB_HOST'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME'),
    'port': int(os.getenv('DB_PORT', 3306))
}

@app.route('/api/user/profile', methods=['GET'])
def get_user_profile():
    if 'user_id' not in session:
        return jsonify({"message": "Unauthorized"}), 401
    user_id = session['user_id']
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT id, username, email, created_at FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        return jsonify(user), 200
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

@app.route('/api/health', methods=['GET'])
def health():
    return {"status": "ok"}, 200

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Logout successful!"}), 200

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data['email']
    password = data['password']
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        print("test")
        if user and check_password_hash(user['password'], password):
            session['user_id'] = user['id']
            return jsonify({"message": session}), 200
        return jsonify({"message": "Invalid credentials"}), 401
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


@app.route('/api/auth/register', methods=['POST', 'GET'])
def register():
    data = request.json
    hashed_password = generate_password_hash(data['password'])
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()
        cursor.execute("INSERT INTO users (username, email, password) VALUES (%s, %s, %s)",
                       (data['name'], data['email'], hashed_password))
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({"message": "User registered successfully!"})
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
