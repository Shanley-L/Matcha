from flask_socketio import join_room, send
from flask import request, jsonify
from models.conv_model import ConversationModel
from models.msg_model import MessageModel
from app import socketio

class ConversationController:
    @staticmethod
    @socketio.on('join')
    def join_conversation(data):
        conversation_id = data.get('conversation_id')
        join_room(str(conversation_id))
        send(f"User joined conversation {conversation_id}", to=str(conversation_id))

    @staticmethod
    def send_message():
        data = request.json
        conversation_id = data.get('conversation_id')
        sender_id = data.get('sender_id')
        content = data.get('content')

        if not conversation_id or not sender_id or not content:
            return jsonify({"error": "All fields are required"}), 400

        message = MessageModel.create(conversation_id, sender_id, content)
        if message:
            socketio.emit('message', message, to=str(conversation_id))
            return jsonify({"message": "Message sent"}), 201
        return jsonify({"error": "Failed to send message"}), 500

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
