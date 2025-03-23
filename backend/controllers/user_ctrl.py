from flask import jsonify, session, request, g
from models.user_model import UserModel
import json
import os
from werkzeug.utils import secure_filename
import uuid
import logging
from app import socketio
from socket_manager import active_users

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
                viewers=data.get('viewers'),
                city=data.get('city'),
                suburb=data.get('suburb')
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
            logging.info(f"User {session['user_id']} is liking user {liked_user_id}")
            
            # Get user info for notification
            current_user = UserModel.get_by_id(session['user_id'])
            target_user = UserModel.get_by_id(liked_user_id)
            
            if not current_user or not target_user:
                logging.error(f"User not found. Current user exists: {bool(current_user)}, Target user exists: {bool(target_user)}")
                return jsonify({"message": "User not found"}), 404
                
            # Record the like interaction
            success = UserModel.create_interaction(
                user_id=session['user_id'],
                target_user_id=liked_user_id,
                interaction_type='like'
            )
            if success:
                # Check if it's a match (both users liked each other)
                is_match = UserModel.check_match(session['user_id'], liked_user_id)
                logging.info(f"Like recorded successfully. Is match: {is_match}")
                
                # Prepare notification data
                like_notification = {
                    'type': 'like',
                    'user': {
                        'id': current_user['id'],
                        'firstname': current_user.get('firstname', ''),
                        'username': current_user.get('username', '')
                    },
                    'timestamp': UserModel.get_current_timestamp()
                }
                
                # Send like notification to the target user
                target_room = f"user_{liked_user_id}"
                logging.info(f"Sending like notification to room {target_room}: {like_notification}")
                
                # Debug: Check if the room exists in the Socket.IO server
                rooms = socketio.server.manager.rooms
                logging.info(f"Available rooms: {list(rooms.keys())}")
                
                # Check if the target user's room exists
                target_room_key = f"/{target_room}"  # Socket.IO prefixes rooms with '/'
                if target_room_key in rooms:
                    logging.info(f"Room {target_room} exists with {len(rooms[target_room_key])} clients")
                else:
                    logging.warning(f"Room {target_room} does not exist")
                
                socketio.emit('new_notification', like_notification, room=target_room)
                
                # Also try sending directly to the user's socket ID if they're active
                if liked_user_id in socketio.server.manager.rooms:
                    logging.info(f"User {liked_user_id} is in active rooms")
                
                if liked_user_id in active_users:
                    sid = active_users[liked_user_id]
                    logging.info(f"Also sending like notification directly to user's SID {sid}")
                    socketio.emit('new_notification', like_notification, room=sid)
                
                logging.info(f"Like notification sent to user {liked_user_id}")
                
                # If it's a match, send match notification to both users
                if is_match:
                    logging.info(f"It's a match! Sending match notifications to both users")
                    
                    # Create match notification for target user
                    target_match_notification = {
                        'type': 'match',
                        'user': {
                            'id': current_user['id'],
                            'firstname': current_user.get('firstname', ''),
                            'username': current_user.get('username', '')
                        },
                        'timestamp': UserModel.get_current_timestamp()
                    }
                    
                    # Create match notification for current user
                    current_match_notification = {
                        'type': 'match',
                        'user': {
                            'id': target_user['id'],
                            'firstname': target_user.get('firstname', ''),
                            'username': target_user.get('username', '')
                        },
                        'timestamp': UserModel.get_current_timestamp()
                    }
                    
                    # Send match notifications to target user
                    logging.info(f"Sending match notification to {target_room}: {target_match_notification}")
                    socketio.emit('new_notification', target_match_notification, room=target_room)
                    
                    # Also try sending directly to the target user's socket ID if they're active
                    if liked_user_id in active_users:
                        sid = active_users[liked_user_id]
                        logging.info(f"Also sending match notification directly to target user's SID {sid}")
                        socketio.emit('new_notification', target_match_notification, room=sid)
                    
                    # Also broadcast the match notification to all clients as a fallback for target user
                    logging.info(f"Broadcasting match notification as fallback for target user")
                    socketio.emit('broadcast_notification', {
                        **target_match_notification,
                        'target_user_id': liked_user_id
                    })
                    
                    # Send match notification to current user
                    current_room = f"user_{session['user_id']}"
                    logging.info(f"Sending match notification to {current_room}: {current_match_notification}")
                    socketio.emit('new_notification', current_match_notification, room=current_room)
                    
                    # Also try sending directly to the current user's socket ID if they're active
                    if str(session['user_id']) in active_users:
                        current_sid = active_users[str(session['user_id'])]
                        logging.info(f"Also sending match notification directly to current user's SID {current_sid}")
                        socketio.emit('new_notification', current_match_notification, room=current_sid)
                    
                    # Also broadcast the match notification to all clients as a fallback for current user
                    logging.info(f"Broadcasting match notification as fallback for current user")
                    socketio.emit('broadcast_notification', {
                        **current_match_notification,
                        'target_user_id': session['user_id']
                    })
                    
                    logging.info(f"Match notifications sent to both users")
                
                # Also broadcast the notification to all clients as a fallback
                logging.info(f"Broadcasting notification as fallback")
                socketio.emit('broadcast_notification', {
                    **like_notification,
                    'target_user_id': liked_user_id
                })
                
                return jsonify({
                    "message": "Like recorded successfully",
                    "is_match": is_match
                }), 200
            else:
                logging.error("Failed to record like in database")
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
    def check_user_liked_me(target_user_id):
        if 'user_id' not in session:
            return jsonify({"message": "Unauthorized"}), 401
        
        try:
            # Check if target user has liked the current user
            has_liked = UserModel.has_user_liked_me(session['user_id'], target_user_id)
            return jsonify({"has_liked": has_liked}), 200
        except Exception as e:
            logging.error(f"Error checking if user has liked: {str(e)}")
            return jsonify({
                "error": "Failed to check if user has liked",
                "details": str(e)
            }), 400

    @staticmethod
    def get_user_profile_by_id(target_user_id):
        if 'user_id' not in session:
            return jsonify({"message": "Unauthorized by session"}), 401

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

    @staticmethod
    def delete_match(target_user_id):
        if 'user_id' not in session:
            return jsonify({"message": "Unauthorized"}), 401
        try:
            # Get user info for notification
            current_user = UserModel.get_by_id(session['user_id'])
            target_user = UserModel.get_by_id(target_user_id)
            
            if not current_user or not target_user:
                return jsonify({"message": "User not found"}), 404
                
            # Check if there's actually a match between the users
            is_match = UserModel.check_match(session['user_id'], target_user_id)
            if not is_match:
                return jsonify({"error": "No match exists between these users"}), 400
                
            # Delete the match
            success = UserModel.delete_match(session['user_id'], target_user_id)
            if success:
                # Create unmatch notification
                unmatch_notification = {
                    'type': 'unmatch',
                    'user': {
                        'id': current_user['id'],
                        'firstname': current_user.get('firstname', ''),
                        'username': current_user.get('username', '')
                    },
                    'timestamp': UserModel.get_current_timestamp()
                }
                
                # Send unmatch notification to the target user
                target_room = f"user_{target_user_id}"
                logging.info(f"Sending unmatch notification to room {target_room}")
                socketio.emit('new_notification', unmatch_notification, room=target_room)
                
                # Also try sending directly to the user's socket ID if they're active
                if target_user_id in active_users:
                    sid = active_users[target_user_id]
                    logging.info(f"Also sending unmatch notification directly to user's SID {sid}")
                    socketio.emit('new_notification', unmatch_notification, room=sid)
                
                # Also broadcast the notification to all clients as a fallback
                logging.info(f"Broadcasting unmatch notification as fallback")
                socketio.emit('broadcast_notification', {
                    **unmatch_notification,
                    'target_user_id': target_user_id
                })
                
                return jsonify({"message": "Match deleted successfully"}), 200
            else:
                return jsonify({"error": "Failed to delete match"}), 400
        except Exception as e:
            logging.error(f"Error deleting match: {str(e)}")
            return jsonify({
                "error": "Failed to delete match",
                "details": str(e)
            }), 400

    @staticmethod
    def mark_notification_read(notification_id=None, notification_type=None):
        """Mark a notification as read"""
        if 'user_id' not in session:
            return jsonify({"message": "Unauthorized"}), 401
            
        try:
            user_id = session['user_id']
            
            # Emit a notification_read event to the user's room
            user_room = f"user_{user_id}"
            
            if notification_id:
                # Mark a specific notification as read
                logging.info(f"Marking notification {notification_id} as read for user {user_id}")
                socketio.emit('notification_read', {
                    'notification_id': notification_id
                }, room=user_room)
                
                return jsonify({
                    "message": f"Notification {notification_id} marked as read"
                }), 200
                
            elif notification_type:
                # Mark all notifications of a specific type as read
                logging.info(f"Marking all notifications of type {notification_type} as read for user {user_id}")
                socketio.emit('notification_type_read', {
                    'notification_type': notification_type
                }, room=user_room)
                
                return jsonify({
                    "message": f"All notifications of type {notification_type} marked as read"
                }), 200
                
            else:
                # Mark all notifications as read
                logging.info(f"Marking all notifications as read for user {user_id}")
                socketio.emit('all_notifications_read', {}, room=user_room)
                
                return jsonify({
                    "message": "All notifications marked as read"
                }), 200
                
        except Exception as e:
            logging.error(f"Error marking notification as read: {str(e)}")
            return jsonify({
                "error": "Failed to mark notification as read",
                "details": str(e)
            }), 400

    def block_user(target_id):
        if 'user_id' not in session:
            return jsonify({"message": "Unauthorized"}), 401
        
        user_id = session['user_id']

        try:
            is_already_blocked = UserModel.is_user_blocked(user_id, target_id)

            if is_already_blocked:
                success = UserModel.undo_block(user_id, target_id)
                message = "unblocked"
            else:
                success = UserModel.block_user(user_id, target_id)
                logging.info(f"Success: {success}")
                if success:
                    logging.info("Deleting match")
                    success = UserModel.delete_match(user_id, target_id)
                    logging.info(f"Success: {success}")
                message = "blocked"

            if success:
                return jsonify({"message": message}), 200
            else:
                return jsonify({"message": "Failed to update block status"}), 400

        except Exception as e:
            logging.error(f"Error updating block status: {str(e)}")
            return jsonify({
                "error": "Failed to update block status",
                "details": str(e)
            }), 400


    @staticmethod   
    def report_user(target_id):
        if 'user_id' not in session:
            return jsonify({"message": "Unauthorized"}), 401
        
        user_id = session['user_id']

        try:
            is_already_reported = UserModel.is_user_reported(user_id, target_id)

            if is_already_reported:
                print("is_already_reported :", is_already_reported)
                success = UserModel.undo_report(user_id, target_id)
                message = "unreported"
            else:
                print("else")
                success = UserModel.report_user(user_id, target_id)
                message = "reported"

            if success:
                return jsonify({"message": message}), 200
            else:
                return jsonify({"message": "Failed to update report status"}), 400

        except Exception as e:
            logging.error(f"Error updating report status: {str(e)}")
            return jsonify({
                "error": "Failed to update report status",
                "details": str(e)
            }), 400

    @staticmethod
    def get_user_fame_rate(user_id=None):
        """Get the fame rate for a user based on likes and dislikes"""
        if 'user_id' not in session:
            return jsonify({"message": "Unauthorized"}), 401
            
        try:
            # If no user_id is provided, use the current user
            target_id = user_id if user_id else session['user_id']
            
            # Get fame rate statistics
            fame_data = UserModel.get_fame_rate(target_id)
            return jsonify(fame_data), 200
        except Exception as e:
            logging.error(f"Error getting fame rate: {str(e)}")
            return jsonify({
                "error": "Failed to get fame rate",
                "details": str(e)
            }), 400

    @staticmethod
    def get_blocked_users():
        if 'user_id' not in session:
            return jsonify({"message": "Unauthorized"}), 401
        
        try:
            blocked_users = UserModel.get_blocked_users(session['user_id'])
            return jsonify(blocked_users), 200
        except Exception as e:
            logging.error(f"Error getting blocked users: {str(e)}")
            return jsonify({
                "error": "Failed to get blocked users",
                "details": str(e)
            }), 400

    @staticmethod
    def get_user_status(user_id):
        if 'user_id' not in session:
            return jsonify({"message": "Unauthorized"}), 401
        
        current_user_id = session['user_id']
        
        try:
            # Check if the target user is blocked by the current user
            is_blocked = UserModel.is_user_blocked(current_user_id, user_id)
            
            # Check if the target user is reported by the current user
            is_reported = UserModel.is_user_reported(current_user_id, user_id)
            
            return jsonify({
                "isBlocked": is_blocked,
                "isReported": is_reported
            }), 200
        except Exception as e:
            logging.error(f"Error getting user status: {str(e)}")
            return jsonify({
                "error": "Failed to get user status",
                "details": str(e)
            }), 400