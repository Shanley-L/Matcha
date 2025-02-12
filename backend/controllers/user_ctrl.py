from flask import jsonify, session, request
from models.user_model import UserModel
import json
import os
from werkzeug.utils import secure_filename
import uuid
import logging

class UserController:
    UPLOAD_FOLDER = 'assets/usersPictures'
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

    @staticmethod
    def allowed_file(filename):
        return '.' in filename and \
            filename.rsplit('.', 1)[1].lower() in UserController.ALLOWED_EXTENSIONS

    @staticmethod
    def save_uploaded_file(file, user_id):
        # Créer le dossier s'il n'existe pas
        os.makedirs(UserController.UPLOAD_FOLDER, exist_ok=True)
        
        # Générer un nom de fichier unique
        filename = secure_filename(file.filename)
        extension = filename.rsplit('.', 1)[1].lower()
        new_filename = f"{user_id}_{uuid.uuid4().hex[:8]}.{extension}"
        
        # Chemin complet du fichier
        filepath = os.path.join(UserController.UPLOAD_FOLDER, new_filename)
        
        # Sauvegarder le fichier
        file.save(filepath)
        
        # Retourner le chemin relatif pour stockage en BDD
        return f"/usersPictures/{new_filename}"

    @staticmethod
    def get_user_profile():
        if 'user_id' not in session:
            return jsonify({"message": "Unauthorized by session"}), 401

        user = UserModel.get_by_id(session['user_id'])
        if user:
            return jsonify(user), 200
        return jsonify({"error": "User not found"}), 404

    @staticmethod
    def update_user_profile():
        if 'user_id' not in session:
            return jsonify({"message": "Unauthorized by session"}), 401

        user_id = session['user_id']

        try:
            # Log des données reçues
            logging.info(f"Form data received: {request.form}")
            logging.info(f"Files received: {request.files}")

            # Récupérer les données du formulaire
            data = {}
            
            # Traiter les données du formulaire
            if request.form:
                for key in request.form:
                    value = request.form[key]
                    logging.info(f"Processing form field: {key} = {value}")
                    try:
                        # Essayer de parser les valeurs JSON
                        data[key] = json.loads(value)
                    except (json.JSONDecodeError, TypeError):
                        # Si ce n'est pas du JSON valide, prendre la valeur telle quelle
                        data[key] = value

            # Gestion des photos
            photos_paths = []
            if request.files:
                files = request.files.getlist('photos')
                logging.info(f"Processing {len(files)} photos")
                for file in files:
                    if file and UserController.allowed_file(file.filename):
                        file_path = UserController.save_uploaded_file(file, user_id)
                        photos_paths.append(file_path)
                        logging.info(f"Saved photo: {file_path}")

            # Log des données traitées
            logging.info(f"Processed data: {data}")
            logging.info(f"Photo paths: {photos_paths}")

            # Appel à la méthode de mise à jour avec les nouveaux champs
            updated_user_id, error = UserModel.update_user(
                user_id,
                firstname=data.get('firstname'),
                birthdate=data.get('birthdate'),
                country=data.get('country'),
                gender=data.get('gender'),
                sexual_orientation=data.get('sexual_orientation'),
                interests=json.dumps(data.get('interests')) if data.get('interests') else None,
                photos=json.dumps(photos_paths) if photos_paths else None,
                matchType=data.get('matchType'),
                is_first_login=data.get('is_first_login'),
                job=data.get('job'),
                bio=data.get('bio')
            )

            if updated_user_id:
                return jsonify({
                    "message": "User profile updated successfully",
                    "photos": photos_paths
                }), 200
            else:
                logging.error(f"Update failed: {error}")
                return jsonify({
                    "error": "Failed to update user profile",
                    "details": error
                }), 400

        except Exception as e:
            logging.error(f"Error processing request: {str(e)}")
            return jsonify({
                "error": "Failed to process request",
                "details": str(e)
            }), 400
