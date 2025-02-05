from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key_here'
CORS(app, supports_credentials=True)

socketio = SocketIO(app, cors_allowed_origins="*")

from routes.auth_routes import auth_bp
from routes.user_routes import user_bp
from routes.conv_routes import conv_bp

# Enregistrer les routes
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(user_bp, url_prefix='/api/user')
app.register_blueprint(conv_bp, url_prefix='/api/conv')

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
    socketio.run(app, debug=True, host='0.0.0.0')
