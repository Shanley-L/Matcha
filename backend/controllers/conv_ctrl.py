from flask_socketio import join_room, send, emit
from flask import request, jsonify, session
from models.conv_model import ConversationModel
from models.msg_model import MessageModel
from models.user_model import UserModel
from app import socketio
from socket_manager import active_users, active_conversations
import logging
import json
from datetime import datetime

def json_serializable(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")

class ConversationController:
    @staticmethod
    @socketio.on('join')
    def join_conversation(data):
        try:
            conversation_id = data.get('conversation_id')
            if not conversation_id:
                return {'error': 'Conversation ID is required'}
            
            conversations = ConversationModel.get_conversations(session['user_id'])
            if not any(str(conv['id']) == str(conversation_id) for conv in conversations):
                return {'error': 'Unauthorized access to conversation'}
            
            join_room(str(conversation_id))
            send({
                'type': 'join',
                'user_id': session['user_id'],
                'conversation_id': conversation_id,
                'message': f"User joined conversation {conversation_id}"
            }, to=str(conversation_id))
            return {'status': 'success'}
        except Exception as e:
            logging.error(f"Error in join_conversation: {str(e)}")
            return {'error': 'Failed to join conversation'}

    @staticmethod
    def list_conversations():
        conversations = ConversationModel.get_conversations(session['user_id'])
        logging.error("conversations: " + str(conversations))
        return jsonify(conversations)

    @staticmethod
    def get_messages(conversation_id):
        # Verify user is part of the conversation
        conversations = ConversationModel.get_conversations(session['user_id'])
        if not any(str(conv['id']) == str(conversation_id) for conv in conversations):
            return jsonify({'error': 'Unauthorized access to conversation'}), 403
        logging.error("TEEEEEEEEST")

        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        messages = ConversationModel.get_messages(conversation_id, limit, offset)
        logging.error("messages: " + str(messages))
        return jsonify(messages)

    @staticmethod
    def send_message(conversation_id):
        try:
            # Verify user is part of the conversation
            conversations = ConversationModel.get_conversations(session['user_id'])
            if not any(str(conv['id']) == str(conversation_id) for conv in conversations):
                return jsonify({'error': 'Unauthorized access to conversation'}), 403
            data = request.get_json()
            if not data or 'message' not in data:
                return jsonify({'error': 'Message content is required'}), 400
            message = ConversationModel.add_message(conversation_id, session['user_id'], data['message'])
            logging.error("message: " + str(message))
            if message:
                # Get sender info for the message
                sender = UserModel.get_by_id(session['user_id'])
                
                # Prepare message data for socket emission
                socket_message = {
                    'type': 'message',
                    'conversation_id': str(conversation_id),
                    'message': {
                        'id': message.get('id'),
                        'sender': {
                            'id': sender['id'],
                            'username': sender.get('username', ''),
                            'firstname': sender.get('firstname', '')
                        },
                        'message': message.get('message', ''),
                        'created_at': message.get('created_at')  # No need to call isoformat() as it's already a string
                    }
                }
                
                # Use socketio instance to emit the message to the conversation room
                room = str(conversation_id)
                socketio.emit('new_message', socket_message, room=room)
                
                # Find the other user in the conversation to send them a direct notification
                # Get conversation participants
                conversation = ConversationModel.get_conversation_by_id(conversation_id)
                if conversation:
                    # Determine the recipient user ID
                    recipient_id = None
                    if conversation.get('user1_id') == session['user_id']:
                        recipient_id = conversation.get('user2_id')
                    else:
                        recipient_id = conversation.get('user1_id')
                    
                    if recipient_id:
                        # Check if recipient is already active in this conversation
                        is_recipient_active = (
                            recipient_id in active_conversations and 
                            active_conversations[recipient_id] == str(conversation_id)
                        )
                        
                        if is_recipient_active:
                            logging.info(f"Recipient {recipient_id} is already active in conversation {conversation_id}, skipping notification")
                        else:
                            # Send notification directly to recipient's room
                            recipient_room = f"user_{recipient_id}"
                            socketio.emit('new_notification', {
                                'type': 'message',
                                'sender': {
                                    'id': sender['id'],
                                    'firstname': sender.get('firstname', ''),
                                    'username': sender.get('username', '')
                                },
                                'conversation_id': str(conversation_id),
                                'content': message.get('message', ''),
                                'timestamp': message.get('created_at')
                            }, room=recipient_room)
                            
                            # Also try sending directly to the user's socket ID if they're active
                            if recipient_id in active_users:
                                sid = active_users[recipient_id]
                                socketio.emit('new_notification', {
                                    'type': 'message',
                                    'sender': {
                                        'id': sender['id'],
                                        'firstname': sender.get('firstname', ''),
                                        'username': sender.get('username', '')
                                    },
                                    'conversation_id': str(conversation_id),
                                    'content': message.get('message', ''),
                                    'timestamp': message.get('created_at')
                                }, room=sid)
                            
                            # Also broadcast the notification to all clients as a fallback
                            socketio.emit('broadcast_notification', {
                                'type': 'message',
                                'sender': {
                                    'id': sender['id'],
                                    'firstname': sender.get('firstname', ''),
                                    'username': sender.get('username', '')
                                },
                                'conversation_id': str(conversation_id),
                                'content': message.get('message', ''),
                                'timestamp': message.get('created_at'),
                                'target_user_id': recipient_id
                            })
                
                # Prepare message for JSON response
                response_message = dict(message)
                
                return jsonify(response_message)
            return jsonify({'error': 'Failed to send message'}), 500
        except Exception as e:
            logging.error(f"Error in send_message: {str(e)}")
            return jsonify({'error': 'Failed to process message', 'details': str(e)}), 500

    @staticmethod
    def get_or_create_conversation(user_id):
        # Verify users can chat (they matched)
        if not UserModel.can_users_chat(session['user_id'], user_id):
            return jsonify({'error': 'Users must match before chatting'}), 403

        conversation_id = ConversationModel.get_or_create(session['user_id'], user_id)
        if conversation_id:
            conversations = ConversationModel.get_conversations(session['user_id'])
            conversation = next((conv for conv in conversations if conv['id'] == conversation_id), None)
            return jsonify(conversation)
        return jsonify({'error': 'Failed to create conversation'}), 500

    @staticmethod
    def create_conversation():
        data = request.json
        user1_id = data.get('user1_id')
        user2_id = data.get('user2_id')

        if not user1_id or not user2_id:
            return jsonify({"error": "Both user1_id and user2_id are required"}), 400

        conversation_id = ConversationModel.get_or_create(user1_id, user2_id)
        if conversation_id:
            return jsonify({"conversation_id": conversation_id}), 201
        return jsonify({"error": "Failed to create conversation"}), 500

    @staticmethod
    @socketio.on('disconnect')
    def handle_disconnect():
        try:
            # Notify all rooms this user was in about the disconnect
            conversations = ConversationModel.get_conversations(session['user_id'])
            for conv in conversations:
                emit('user_status', {
                    'type': 'status',
                    'user_id': session['user_id'],
                    'status': 'offline',
                    'conversation_id': str(conv['id'])
                }, room=str(conv['id']))
        except Exception as e:
            logging.error(f"Error in handle_disconnect: {str(e)}")

    @staticmethod
    @socketio.on('typing')
    def handle_typing(data):
        try:
            conversation_id = data.get('conversation_id')
            is_typing = data.get('is_typing', False)
            
            if not conversation_id:
                return {'error': 'Conversation ID is required'}
            
            # Verify user is part of the conversation
            conversations = ConversationModel.get_conversations(session['user_id'])
            if not any(str(conv['id']) == str(conversation_id) for conv in conversations):
                return {'error': 'Unauthorized access to conversation'}
            
            # Use socketio instance to emit typing status
            socketio.emit('typing_status', {
                'type': 'typing',
                'user_id': session['user_id'],
                'is_typing': is_typing,
                'conversation_id': str(conversation_id),
                'timestamp': datetime.now().isoformat()
            }, room=str(conversation_id))
            
            return {'status': 'success'}
        except Exception as e:
            logging.error(f"Error in handle_typing: {str(e)}")
            return {'error': 'Failed to update typing status'}

    @staticmethod
    @socketio.on('connect')
    def handle_connect():
        try:
            # Notify all rooms this user was in about the connect
            conversations = ConversationModel.get_conversations(session['user_id'])
            for conv in conversations:
                emit('user_status', {
                    'type': 'status',
                    'user_id': session['user_id'],
                    'status': 'online',
                    'conversation_id': str(conv['id'])
                }, room=str(conv['id']))
            return {'status': 'connected'}
        except Exception as e:
            logging.error(f"Error in handle_connect: {str(e)}")
            return {'error': 'Failed to handle connection'}
