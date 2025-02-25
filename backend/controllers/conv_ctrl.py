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
        conversation_id = data.get('conversation_id')
        join_room(str(conversation_id))
        send(f"User joined conversation {conversation_id}", to=str(conversation_id))

    @staticmethod
    def list_conversations():
        if 'user_id' not in session:
            return jsonify({'error': 'Not authenticated'}), 401
        
        conversations = ConversationModel.get_conversations(session['user_id'])
        logging.error("conversations: " + str(conversations))
        return jsonify(conversations)

    @staticmethod
    def get_messages(conversation_id):
        if 'user_id' not in session:
            return jsonify({'error': 'Not authenticated'}), 401

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
        if 'user_id' not in session:
            return jsonify({'error': 'Not authenticated'}), 401

        # Verify user is part of the conversation
        conversations = ConversationModel.get_conversations(session['user_id'])
        if not any(str(conv['id']) == str(conversation_id) for conv in conversations):
            return jsonify({'error': 'Unauthorized access to conversation'}), 403

        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({'error': 'Message content is required'}), 400

        message = ConversationModel.add_message(conversation_id, session['user_id'], data['message'])
        if message:
            # Emit the message to all users in the conversation
            emit('new_message', {
                'conversation_id': conversation_id,
                'message': message
            }, room=f'conversation_{conversation_id}', namespace='/chat')
            return jsonify(message)
        return jsonify({'error': 'Failed to send message'}), 500

    @staticmethod
    def get_or_create_conversation(user_id):
        if 'user_id' not in session:
            return jsonify({'error': 'Not authenticated'}), 401

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
