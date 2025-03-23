from flask_socketio import SocketIO, emit, join_room, leave_room
from flask import request
import logging

# Initialize SocketIO instance
socketio = SocketIO(
    cors_allowed_origins="*",
    logger=True,
    engineio_logger=True,
    ping_timeout=60,
    ping_interval=25
)

# Store active users - exported at module level
active_users = {}

# Store active conversations for each user - exported at module level
active_conversations = {}

@socketio.on('connect')
def handle_connect():
    try:
        user_id = request.args.get('user_id')
        if user_id:
            active_users[user_id] = request.sid
            # Join user to their personal room for direct notifications
            room_name = f"user_{user_id}"
            join_room(room_name)
            emit('user_connected', {'user_id': user_id}, broadcast=True)
        else:
            logging.warning('Connection attempt without user_id')
            return False
    except Exception as e:
        logging.error(f'Error in handle_connect: {str(e)}')
        return False

@socketio.on('disconnect')
def handle_disconnect():
    try:
        user_id = None
        for uid, sid in active_users.items():
            if sid == request.sid:
                user_id = uid
                break
        if user_id:
            del active_users[user_id]
            # Also remove from active conversations if present
            if user_id in active_conversations:
                del active_conversations[user_id]
            emit('user_disconnected', {'user_id': user_id}, broadcast=True)
    except Exception as e:
        logging.error(f'Error in handle_disconnect: {str(e)}')

@socketio.on_error()
def error_handler(e):
    logging.error(f'SocketIO error: {str(e)}')

@socketio.on('join_chat')
def handle_join_chat(data):
    try:
        user_id = request.args.get('user_id')
        conversation_id = str(data['conversation_id'])
        
        # Store that this user is active in this conversation
        if user_id:
            active_conversations[user_id] = conversation_id
        join_room(conversation_id)
    except Exception as e:
        logging.error(f'Error in handle_join_chat: {str(e)}')

@socketio.on('leave_chat')
def handle_leave_chat(data):
    try:
        user_id = request.args.get('user_id')
        conversation_id = str(data['conversation_id'])
        
        # Remove user from active conversations
        if user_id and user_id in active_conversations:
            del active_conversations[user_id]
        leave_room(conversation_id)
    except Exception as e:
        logging.error(f'Error in handle_leave_chat: {str(e)}')

@socketio.on('send_message')
def handle_message(data):
    conversation_id = str(data['conversation_id'])
    message = {
        'sender_id': data['sender_id'],
        'content': data['content'],
        'conversation_id': conversation_id,
        'sent_at': data.get('sent_at')
    }
    emit('new_message', message, room=conversation_id)

@socketio.on('typing')
def handle_typing(data):
    conversation_id = str(data['conversation_id'])
    user_id = data['user_id']
    emit('user_typing', {'user_id': user_id}, room=conversation_id, include_self=False)

@socketio.on('notification')
def handle_notification(data):
    target_user_id = str(data['target_user_id'])
    
    # Try both methods of sending notifications
    # 1. Using the socket ID from active_users
    if target_user_id in active_users:
        sid = active_users[target_user_id]
        emit('new_notification', data, room=sid)
    
    # 2. Using the user's room name
    room_name = f"user_{target_user_id}"
    emit('new_notification', data, room=room_name)

@socketio.on('join_room')
def handle_join_room(data):
    try:
        room = data.get('room')
        if room:
            join_room(room)
        else:
            logging.warning('Join room attempt without room name')
    except Exception as e:
        logging.error(f'Error in handle_join_room: {str(e)}') 