from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import mysql.connector
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key_here'
CORS(app, resources={r"/*": {"origins": "*"}})

# Connexion à la base de données
db_config = {
    'host': os.getenv('DB_HOST'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME'),
    'port': int(os.getenv('DB_PORT', 3306))
}

@app.route('/api/health', methods=['GET'])
def health():
    return {"status": "ok"}, 200

@app.route('/api/', methods=['GET'])
def home():
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()
        cursor.execute("SELECT DATABASE();")
        db_name = cursor.fetchone()[0]
        cursor.close()
        connection.close()
        return jsonify({"message": f"WELCOME to Matcha! Connected to DB: {db_name}"})
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

@app.route('/auth/register', methods=['POST'])
def register():
    # Récupération des données
    data = request.json
    hashed_password = generate_password_hash(data['password'])

    # Connexion à la base de données
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()
        cursor.execute("INSERT INTO users (username, email, password) VALUES (%s, %s, %s)",
                       (data['username'], data['email'], hashed_password))
        connection.commit()
        cursor.close()
        connection.close()

        return jsonify({"message": "User registered successfully!"})
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE email = %s", (data['email'],))
        user = cursor.fetchone()
        cursor.close()
        connection.close()
        
        if user and check_password_hash(user['password'], data['password']):
            return jsonify({"message": "Login successful!"})
        return jsonify({"message": "Invalid credentials"}), 401
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
