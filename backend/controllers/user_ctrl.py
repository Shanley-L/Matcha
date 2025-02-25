from flask import jsonify, session, request, g
from models.user_model import UserModel
import json
import os
from werkzeug.utils import secure_filename
import uuid
import logging

class UserController:
    UPLOAD_FOLDER = './shared/uploads/usersPictures'
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

    @staticmethod
    def allowed_file(filename):
        return '.' in filename and \
            filename.rsplit('.', 1)[1].lower() in UserController.ALLOWED_EXTENSIONS

    @staticmethod
    def save_uploaded_file(file, user_id):
        filename = secure_filename(file.filename)
        extension = filename.rsplit('.', 1)[1].lower()
        new_filename = f"{user_id}_{uuid.uuid4().hex[:8]}.{extension}"
        
        logging.info(f"Uploading file to: {UserController.UPLOAD_FOLDER}")
        filepath = os.path.join(UserController.UPLOAD_FOLDER, new_filename)
        
        file.save(filepath)
        
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
    def get_user_profile_secure():
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
            logging.info(f"Form data received: {request.form}")
            logging.info(f"Files received: {request.files}")
            data = {}
            if request.form:
                for key in request.form:
                    value = request.form[key]
                    logging.info(f"Processing form field: {key} = {value}")
                    try:
                        data[key] = json.loads(value)
                    except (json.JSONDecodeError, TypeError):
                        data[key] = value

            # Traiter les photos
            photos_paths = []
            
            # Ajouter d'abord les photos existantes dans l'ordre spécifié
            if 'photos_order' in data:
                photos_paths.extend(data['photos_order'])

            # Ajouter ensuite les nouvelles photos
            if request.files:
                files = request.files.getlist('photos')
                logging.info(f"Processing {len(files)} new photos")
                for file in files:
                    if file and UserController.allowed_file(file.filename):
                        file_path = UserController.save_uploaded_file(file, user_id)
                        photos_paths.append(file_path)
                        logging.info(f"Saved new photo: {file_path}")

            # Mettre à jour la base de données avec toutes les photos dans l'ordre
            if photos_paths:
                data['photos'] = json.dumps(photos_paths)

            logging.info(f"Final photo paths: {photos_paths}")

            updated_user_id, error = UserModel.update_user(
                user_id,
                username=data.get('username'),
                firstname=data.get('firstname'),
                birthdate=data.get('birthdate'),
                country=data.get('country'),
                gender=data.get('gender'),
                looking_for=data.get('looking_for'),
                interests=json.dumps(data.get('interests')) if data.get('interests') else None,
                photos=data.get('photos'),
                matchType=data.get('matchType'),
                is_first_login=data.get('is_first_login'),
                job=data.get('job'),
                bio=data.get('bio'),
                viewers=data.get('viewers')
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

    @staticmethod
    def get_potential_matches():
        if 'user_id' not in session:
            return jsonify({"message": "Unauthorized"}), 401
        try:
            current_user = UserModel.get_by_id(session['user_id'])
            if not current_user:
                return jsonify({"message": "User not found"}), 404

            min_age = request.args.get('min_age', type=int)
            max_age = request.args.get('max_age', type=int)
            matches = UserModel.get_potential_matches(
                current_user_id=session['user_id'],
                min_age=min_age,
                max_age=max_age
            )
            return jsonify(matches), 200
        except Exception as e:
            logging.error(f"Error fetching potential matches: {str(e)}")
            return jsonify({
                "error": "Failed to fetch potential matches",
                "details": str(e)
            }), 400

    @staticmethod
    def like_user(liked_user_id):
        if 'user_id' not in session:
            return jsonify({"message": "Unauthorized"}), 401
        try:
            # Record the like interaction
            success = UserModel.create_interaction(
                user_id=session['user_id'],
                target_user_id=liked_user_id,
                interaction_type='like'
            )
            if success:
                # Check if it's a match (both users liked each other)
                is_match = UserModel.check_match(session['user_id'], liked_user_id)
                return jsonify({
                    "message": "Like recorded successfully",
                    "is_match": is_match
                }), 200
            else:
                return jsonify({"message": "Failed to record like"}), 400
        except Exception as e:
            logging.error(f"Error recording like: {str(e)}")
            return jsonify({
                "error": "Failed to process like",
                "details": str(e)
            }), 400

    @staticmethod
    def dislike_user(disliked_user_id):
        if 'user_id' not in session:
            return jsonify({"message": "Unauthorized"}), 401
        try:
            # Record the dislike interaction
            success = UserModel.create_interaction(
                user_id=session['user_id'],
                target_user_id=disliked_user_id,
                interaction_type='dislike'
            )
            if success:
                return jsonify({"message": "Dislike recorded successfully"}), 200
            else:
                return jsonify({"message": "Failed to record dislike"}), 400
        except Exception as e:
            logging.error(f"Error recording dislike: {str(e)}")
            return jsonify({
                "error": "Failed to process dislike",
                "details": str(e)
            }), 400

    @staticmethod
    def add_test_likes():
        try:
            if 'user_id' not in session:
                return jsonify({"message": "Unauthorized"}), 401
                
            user_id = session['user_id']
            potential_likers = UserModel.get_potential_matches(user_id)
            
            likes_added = 0
            for user in potential_likers[:5]:
                try:
                    success = UserModel.create_interaction(
                        user_id=user['id'],
                        target_user_id=user_id,
                        interaction_type='like'
                    )
                    if success:
                        likes_added += 1
                except Exception as e:
                    logging.error(f"Error adding like from user {user['id']}: {str(e)}")
                    continue
            
            if likes_added > 0:
                return jsonify({
                    'status': 'success',
                    'message': f'Successfully added {likes_added} test likes to your profile',
                    'likes_added': likes_added
                }), 200
            else:
                return jsonify({
                    'status': 'error',
                    'message': 'No likes could be added. You might have already received likes from all potential matches.'
                }), 400
                
        except Exception as e:
            logging.error(f"Error in add_test_likes: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': str(e)
            }), 500

    @staticmethod
    def get_likes():
        if 'user_id' not in session:
            return jsonify({"message": "Unauthorized"}), 401
        
        try:
            # Get users who have liked the current user
            likes = UserModel.get_likes_for_user(session['user_id'])
            return jsonify(likes), 200
        except Exception as e:
            logging.error(f"Error getting likes: {str(e)}")
            return jsonify({
                "error": "Failed to get likes",
                "details": str(e)
            }), 400

    @staticmethod
    def get_user_profile_by_id(target_user_id):
        if 'user_id' not in session:
            return jsonify({"message": "Unauthorized by session"}), 401

        # Vérifier que l'utilisateur existe
        user = UserModel.get_by_id(target_user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Ajouter l'utilisateur actuel aux viewers du profil cible
        current_user = UserModel.get_by_id(session['user_id'])
        if current_user:
            viewers = user.get('viewers', [])
            if isinstance(viewers, bytes):
                viewers = json.loads(viewers.decode())
            elif isinstance(viewers, str):
                viewers = json.loads(viewers)
            elif not isinstance(viewers, list):
                viewers = []

            # Créer un objet viewer avec les informations minimales nécessaires
            viewer_info = {
                "id": current_user['id'],
                "username": current_user['username'],
                "photo": current_user['photos'][0] if current_user.get('photos') else None
            }

            # Vérifier si l'utilisateur n'est pas déjà dans la liste des viewers
            if not any(v.get('id') == current_user['id'] for v in viewers):
                viewers.append(viewer_info)
                UserModel.update_user(target_user_id, viewers=json.dumps(viewers))

        return jsonify(user), 200

    @staticmethod
    def get_matches_list():
        if 'user_id' not in session:
            return jsonify({"message": "Unauthorized"}), 401
        try:
            matches = UserModel.get_matches_list(session['user_id'])
            return jsonify(matches), 200
        except Exception as e:
            logging.error(f"Error getting matches list: {str(e)}")
            return jsonify({
                "error": "Failed to get matches list",
                "details": str(e)
            }), 400
