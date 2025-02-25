from flask import session
from flask_socketio import emit, join_room, leave_room
from models.conv_model import ConversationModel

def register_socket_events(socketio):
    @socketio.on('connect', namespace='/chat')
    def handle_connect():
        if 'user_id' not in session:
            return False
        # Join user's personal room for notifications
        join_room(f'user_{session["user_id"]}')

    @socketio.on('disconnect', namespace='/chat')
    def handle_disconnect():
        if 'user_id' in session:
            leave_room(f'user_{session["user_id"]}')

    @socketio.on('join_conversation', namespace='/chat')
    def handle_join_conversation(data):
        if 'user_id' not in session:
            return

        conversation_id = data.get('conversation_id')
        if not conversation_id:
            return

        # Verify user is part of the conversation
        conversations = ConversationModel.get_conversations(session['user_id'])
        if any(str(conv['id']) == str(conversation_id) for conv in conversations):
            join_room(f'conversation_{conversation_id}')
            emit('user_joined', {
                'user_id': session['user_id'],
                'conversation_id': conversation_id
            }, room=f'conversation_{conversation_id}')

    @socketio.on('leave_conversation', namespace='/chat')
    def handle_leave_conversation(data):
        if 'user_id' not in session:
            return

        conversation_id = data.get('conversation_id')
        if conversation_id:
            leave_room(f'conversation_{conversation_id}')
            emit('user_left', {
                'user_id': session['user_id'],
                'conversation_id': conversation_id
            }, room=f'conversation_{conversation_id}')

    @socketio.on('typing', namespace='/chat')
    def handle_typing(data):
        if 'user_id' not in session:
            return

        conversation_id = data.get('conversation_id')
        if conversation_id:
            emit('user_typing', {
                'user_id': session['user_id'],
                'conversation_id': conversation_id
            }, room=f'conversation_{conversation_id}') 