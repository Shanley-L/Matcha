from flask_socketio import SocketIO, join_room, leave_room, send
from flask import Flask, request, jsonify, session
from flask_cors import CORS
import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key_here'
CORS(app, supports_credentials=True)
socketio = SocketIO(app, cors_allowed_origins="*")

db_config = {
    'host': os.getenv('DB_HOST'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME'),
    'port': int(os.getenv('DB_PORT', 3306))
}

@app.route('/api/messages', methods=['POST'])
def send_message():
    data = request.json
    conversation_id = data.get('conversation_id')
    sender_id = data.get('sender_id')
    content = data.get('content')
    if not conversation_id or not sender_id or not content:
        return jsonify({"error": "All fields are required"}), 400
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()
        cursor.execute("""
            INSERT INTO messages (conversation_id, sender_id, content)
            VALUES (%s, %s, %s)""", (conversation_id, sender_id, content))
        connection.commit()
        cursor.close()
        connection.close()
        socketio.emit('message', {
            "conversation_id": conversation_id,
            "sender_id": sender_id,
            "content": content
        }, to=str(conversation_id))
        return jsonify({"message": "Message sent"}), 201
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500


@app.route('/api/conversations', methods=['POST'])
def create_conversation():
    data = request.json
    user1_id = data.get('user1_id')
    user2_id = data.get('user2_id')
    if not user1_id or not user2_id:
        return jsonify({"error": "Both user1_id and user2_id are required"}), 400
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()
        cursor.execute("""
            SELECT id FROM conversations
            WHERE (user1_id = %s AND user2_id = %s) OR (user1_id = %s AND user2_id = %s)
        """, (user1_id, user2_id, user2_id, user1_id))
        conversation = cursor.fetchone()
        if conversation:
            conversation_id = conversation[0]
        else:
            cursor.execute("""INSERT INTO conversations (user1_id, user2_id)
                VALUES (LEAST(%s, %s), GREATEST(%s, %s))
            """, (user1_id, user2_id, user1_id, user2_id))
            connection.commit()
            conversation_id = cursor.lastrowid
        cursor.close()
        connection.close()
        return jsonify({"conversation_id": conversation_id}), 201
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

@socketio.on('join')
def join_conversation(data):
    conversation_id = data.get('conversation_id')
    join_room(str(conversation_id))
    send(f"User joined conversation {conversation_id}", to=str(conversation_id))

@app.route('/api/user/profile', methods=['GET'])
def get_user_profile():
    if 'user_id' not in session:
        return jsonify({"message": "Unauthorized by session"}), 401
    user_id = session['user_id']
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT id, username, email, created_at FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        return jsonify(user), 200
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)+"mysql error"}), 500
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
        sql = "INSERT INTO users (username, email, password) VALUES (%s, %s, %s)"
        values = (data['username'], data['email'], hashed_password)

        cursor.execute(sql, values)
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({"message": "User registered successfully!"}), 201
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
