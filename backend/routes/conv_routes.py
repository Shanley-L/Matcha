from flask import Blueprint
from controllers.conv_ctrl import ConversationController

conv_bp = Blueprint('conv_bp', __name__)

@conv_bp.route('messages', methods=['POST'])
def send_message():
    return ConversationController.send_message()

@conv_bp.route('conversations', methods=['POST'])
def create_conversation():
    return ConversationController.create_conversation()
