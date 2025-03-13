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
        logging.info(f'Socket connect attempt with user_id: {user_id}')
        
        if user_id:
            active_users[user_id] = request.sid
            # Join user to their personal room for direct notifications
            room_name = f"user_{user_id}"
            join_room(room_name)
            logging.info(f'User {user_id} connected with sid {request.sid} and joined room {room_name}')
            logging.info(f'Active users: {active_users}')
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
            logging.info(f'User {user_id} disconnected')
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
            logging.info(f'User {user_id} is now active in conversation {conversation_id}')
            
        join_room(conversation_id)
        logging.info(f'User joined chat {conversation_id}')
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
            logging.info(f'User {user_id} is no longer active in conversation {conversation_id}')
            
        leave_room(conversation_id)
        logging.info(f'User left chat {conversation_id}')
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
    logging.info(f'Message sent in conversation {conversation_id}')

@socketio.on('typing')
def handle_typing(data):
    conversation_id = str(data['conversation_id'])
    user_id = data['user_id']
    emit('user_typing', {'user_id': user_id}, room=conversation_id, include_self=False)

@socketio.on('notification')
def handle_notification(data):
    target_user_id = str(data['target_user_id'])
    logging.info(f'Notification request for user {target_user_id}. Data: {data}')
    
    # Try both methods of sending notifications
    # 1. Using the socket ID from active_users
    if target_user_id in active_users:
        sid = active_users[target_user_id]
        logging.info(f'Sending notification to user {target_user_id} with SID {sid}')
        emit('new_notification', data, room=sid)
        logging.info(f'Notification sent to user {target_user_id} via SID')
    
    # 2. Using the user's room name
    room_name = f"user_{target_user_id}"
    logging.info(f'Also sending notification to room {room_name}')
    emit('new_notification', data, room=room_name)
    logging.info(f'Notification sent to room {room_name}')

@socketio.on('join_room')
def handle_join_room(data):
    try:
        room = data.get('room')
        if room:
            join_room(room)
            logging.info(f'User with SID {request.sid} explicitly joined room: {room}')
        else:
            logging.warning('Join room attempt without room name')
    except Exception as e:
        logging.error(f'Error in handle_join_room: {str(e)}') 