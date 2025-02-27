from flask_socketio import join_room, send, emit
from flask import request, jsonify, session
from models.conv_model import ConversationModel
from models.msg_model import MessageModel
from models.user_model import UserModel
from app import socketio
import logging

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

        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        messages = ConversationModel.get_messages(conversation_id, limit, offset)
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
            if message:
                # Get sender info for the message
                sender = UserModel.get_by_id(session['user_id'])
                
                # Emit the message to all users in the conversation
                emit('new_message', {
                    'type': 'message',
                    'conversation_id': str(conversation_id),
                    'message': message,
                    'sender': {
                        'id': sender['id'],
                        'username': sender['username'],
                        'firstname': sender['firstname']
                    },
                    'timestamp': message.get('sent_at', '').isoformat() if message.get('sent_at') else None
                }, room=str(conversation_id))
                
                return jsonify(message)
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
            
            # Emit typing status to conversation room
            emit('typing_status', {
                'type': 'typing',
                'user_id': session['user_id'],
                'is_typing': is_typing,
                'conversation_id': str(conversation_id)
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
