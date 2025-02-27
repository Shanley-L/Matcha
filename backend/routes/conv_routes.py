from flask import Blueprint
from controllers.conv_ctrl import ConversationController
from middleware.auth_middleware import email_verified_required

conv_bp = Blueprint('conv_bp', __name__)

# Get all conversations for the current user
@conv_bp.route('/list', methods=['GET'])
@email_verified_required
def list_conversations():
    return ConversationController.list_conversations()

# Get or create a conversation with another user
@conv_bp.route('/with/<int:user_id>', methods=['GET'])
@email_verified_required
def get_or_create_conversation(user_id):
    return ConversationController.get_or_create_conversation(user_id)

# Get messages for a specific conversation
@conv_bp.route('/<int:conversation_id>/messages', methods=['GET'])
@email_verified_required
def get_messages(conversation_id):
    return ConversationController.get_messages(conversation_id)

# Send a message in a conversation
@conv_bp.route('/<int:conversation_id>/messages', methods=['POST'])
@email_verified_required
def send_message(conversation_id):
    return ConversationController.send_message(conversation_id)
