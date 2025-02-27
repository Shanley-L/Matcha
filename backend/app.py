import os
from flask_mail import Mail
from flask import Flask, jsonify, send_from_directory, session
from flask_cors import CORS
from flask_socketio import SocketIO, disconnect
import logging

logging.basicConfig(level=logging.INFO)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key_here'
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587  # For TLS (use 465 for SSL)
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
app.config['MAIL_USERNAME'] = os.getenv('EMAIL_USER')
app.config['MAIL_PASSWORD'] = os.getenv('EMAIL_PWD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('EMAIL_USER')

# Configure upload folder
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'shared/uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

mail = Mail(app)
CORS(app, supports_credentials=True)

socketio = SocketIO(app, cors_allowed_origins="*")

# Socket authentication middleware
@socketio.on('connect')
def handle_connect():
    if 'user_id' not in session:
        logging.error("Unauthorized socket connection attempt")
        return False  # Reject the connection
    return True

from routes.auth_routes import auth_bp
from routes.user_routes import user_bp
from routes.conv_routes import conv_bp

# Enregistrer les routes
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(user_bp, url_prefix='/api/user')
app.register_blueprint(conv_bp, url_prefix='/api/conv')

# Route to serve uploaded files
@app.route('/shared/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Route de santé (Health Check)
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"}), 200

# Gestion des erreurs globales
@app.errorhandler(404)
def not_found_error(error):
    return jsonify({"error": "Not Found"}), 404

# Gestion des erreurs serveur
@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal Server Error"}), 500

# Routes checker
# with app.test_request_context():
#     print("Routes disponibles :")
#     for rule in app.url_map.iter_rules():
#         print(rule)


if __name__ == '__main__':
    # Créer le dossier assets/usersPictures s'il n'existe pas
    socketio.run(app, debug=True, host='0.0.0.0')
