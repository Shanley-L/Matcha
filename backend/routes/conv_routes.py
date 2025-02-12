from flask import Blueprint
from controllers.conv_ctrl import ConversationController
from middleware.auth_middleware import email_verified_required

conv_bp = Blueprint('conv_bp', __name__)

@conv_bp.route('messages', methods=['POST'])
@email_verified_required
def send_message():
    return ConversationController.send_message()

@conv_bp.route('conversations', methods=['POST'])
@email_verified_required
def create_conversation():
    return ConversationController.create_conversation()
