from flask_socketio import SocketIO, emit, join_room, leave_room
from flask import request
import logging

socketio = SocketIO(
    cors_allowed_origins="*",
    logger=True,
    engineio_logger=True,
    ping_timeout=60,
    ping_interval=25
)

# Store active users
active_users = {}

@socketio.on('connect')
def handle_connect():
    try:
        user_id = request.args.get('user_id')
        if user_id:
            active_users[user_id] = request.sid
            emit('user_connected', {'user_id': user_id}, broadcast=True)
            logging.info(f'User {user_id} connected with sid {request.sid}')
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
            emit('user_disconnected', {'user_id': user_id}, broadcast=True)
            logging.info(f'User {user_id} disconnected')
    except Exception as e:
        logging.error(f'Error in handle_disconnect: {str(e)}')

@socketio.on_error()
def error_handler(e):
    logging.error(f'SocketIO error: {str(e)}')

@socketio.on('join_chat')
def handle_join_chat(data):
    conversation_id = str(data['conversation_id'])
    join_room(conversation_id)
    logging.info(f'User joined chat {conversation_id}')

@socketio.on('leave_chat')
def handle_leave_chat(data):
    conversation_id = str(data['conversation_id'])
    leave_room(conversation_id)
    logging.info(f'User left chat {conversation_id}')

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

@socketio.on('test_notification')
def handle_test_notification(data):
    try:
        user_id = None
        for uid, sid in active_users.items():
            if sid == request.sid:
                user_id = uid
                break
                
        if user_id:
            logging.info(f'Sending test notification to user {user_id}: {data}')
            emit('new_notification', data, room=request.sid)
        else:
            logging.warning('Test notification requested but user not found')
    except Exception as e:
        logging.error(f'Error in handle_test_notification: {str(e)}')

@socketio.on('typing')
def handle_typing(data):
    conversation_id = str(data['conversation_id'])
    user_id = data['user_id']
    emit('user_typing', {'user_id': user_id}, room=conversation_id, include_self=False)

@socketio.on('notification')
def handle_notification(data):
    target_user_id = str(data['target_user_id'])
    if target_user_id in active_users:
        emit('new_notification', data, room=active_users[target_user_id])
        logging.info(f'Notification sent to user {target_user_id}') 