# common_imports.py
from app import app, mail, socketio
from werkzeug.security import generate_password_hash, check_password_hash
from itsdangerous import URLSafeTimedSerializer as Serializer
from flask import jsonify, session, url_for, request, Blueprint
from flask_socketio import join_room, send
from flask_mail import Message, Mail