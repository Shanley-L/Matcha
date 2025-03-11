import mysql.connector
from config.database import db_config
import logging
import json
from datetime import datetime

class ConversationModel:
    @staticmethod
    def get_or_create(user1_id, user2_id):
        try:
            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor()

            # Check if conversation exists
            cursor.execute("""
                SELECT id FROM conversations
                WHERE (user1_id = %s AND user2_id = %s) OR (user1_id = %s AND user2_id = %s)
            """, (user1_id, user2_id, user2_id, user1_id))
            conversation = cursor.fetchone()

            if conversation:
                return conversation[0]

            # Create new conversation
            cursor.execute("""
                INSERT INTO conversations (user1_id, user2_id)
                VALUES (LEAST(%s, %s), GREATEST(%s, %s))
            """, (user1_id, user2_id, user1_id, user2_id))
            connection.commit()
            return cursor.lastrowid

        except mysql.connector.Error as err:
            print("Database error:", err)
            return None
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

    @staticmethod
    def get_conversations(user_id):
        try:
            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor(dictionary=True)

            # Get all conversations with user details
            query = """
                SELECT c.id, c.user1_id, c.user2_id,
                    u1.firstname as user1_firstname, u1.country as user1_country, u1.photos as user1_photos,
                    u2.firstname as user2_firstname, u2.country as user2_country, u2.photos as user2_photos,
                    (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY sent_at DESC LIMIT 1) as last_message,
                    (SELECT sent_at FROM messages WHERE conversation_id = c.id ORDER BY sent_at DESC LIMIT 1) as last_message_time
                FROM conversations c
                JOIN users u1 ON c.user1_id = u1.id
                JOIN users u2 ON c.user2_id = u2.id
                WHERE c.user1_id = %s OR c.user2_id = %s
                ORDER BY COALESCE(last_message_time, c.created_at) DESC
            """
            cursor.execute(query, (user_id, user_id))
            conversations = cursor.fetchall()
            # Format the conversations data
            formatted_conversations = []
            for conv in conversations:
                # Parse JSON photos arrays and add /shared/uploads prefix
                user1_photos = [f"/shared/uploads{photo}" for photo in (json.loads(conv['user1_photos']) if conv['user1_photos'] else [])]
                user2_photos = [f"/shared/uploads{photo}" for photo in (json.loads(conv['user2_photos']) if conv['user2_photos'] else [])]
                
                # Convert datetime to ISO format string
                last_message_time = conv['last_message_time']
                if isinstance(last_message_time, datetime):
                    last_message_time = last_message_time.isoformat()
                
                formatted_conv = {
                    'id': conv['id'],
                    'user1': {
                        'id': conv['user1_id'],
                        'firstname': conv['user1_firstname'],
                        'country': conv['user1_country'],
                        'photos': user1_photos
                    },
                    'user2': {
                        'id': conv['user2_id'],
                        'firstname': conv['user2_firstname'],
                        'country': conv['user2_country'],
                        'photos': user2_photos
                    },
                    'last_message': conv['last_message'],
                    'last_message_time': last_message_time
                }
                formatted_conversations.append(formatted_conv)
            return formatted_conversations
        except mysql.connector.Error as err:
            logging.error(f"Database error in get_conversations: {err}")
            return []
        except Exception as e:
            logging.error(f"Unexpected error in get_conversations: {e}")
            return []
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

    @staticmethod
    def get_messages(conversation_id, limit=50, offset=0):
        try:
            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor(dictionary=True)
            cursor.execute("""
                SELECT m.id, m.sender_id, m.content as message, m.sent_at as created_at,
                    u.firstname, u.photos
                FROM messages m
                JOIN users u ON m.sender_id = u.id
                WHERE m.conversation_id = %s
                ORDER BY m.sent_at DESC
                LIMIT %s OFFSET %s
            """, (conversation_id, limit, offset))
            messages = cursor.fetchall()
            # Format the messages data
            formatted_messages = []
            for msg in messages:
                # Parse photos and add /shared/uploads prefix
                photos = [f"/shared/uploads{photo}" for photo in (json.loads(msg['photos']) if msg['photos'] else [])]
                
                # Convert datetime to ISO format string
                created_at = msg['created_at']
                if isinstance(created_at, datetime):
                    created_at = created_at.isoformat()
                
                formatted_msg = {
                    'id': msg['id'],
                    'sender': {
                        'id': msg['sender_id'],
                        'firstname': msg['firstname'],
                        'photos': photos
                    },
                    'message': msg['message'],
                    'created_at': created_at
                }
                formatted_messages.append(formatted_msg)
            return formatted_messages[::-1]  # Reverse to get chronological order
        except mysql.connector.Error as err:
            logging.error(f"Database error in get_messages: {err}")
            return []
        except Exception as e:
            logging.error(f"Unexpected error in get_messages: {e}")
            return []
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

    @staticmethod
    def add_message(conversation_id, sender_id, message):
        try:
            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor()
            cursor.execute("""
                INSERT INTO messages (conversation_id, sender_id, content)
                VALUES (%s, %s, %s)
            """, (conversation_id, sender_id, message))
            connection.commit()
            message_id = cursor.lastrowid
            # Get the complete message data
            cursor.execute("""
                SELECT m.id, m.sender_id, m.content as message, m.sent_at as created_at,
                    u.firstname, u.photos
                FROM messages m
                JOIN users u ON m.sender_id = u.id
                WHERE m.id = %s
            """, (message_id,))
            msg = cursor.fetchone()
            if msg:
                photos = json.loads(msg[5]) if msg[5] else []
                # Convert datetime to ISO format string
                created_at = msg[3]
                if isinstance(created_at, datetime):
                    created_at = created_at.isoformat()
                
                return {
                    'id': msg[0],
                    'sender': {
                        'id': msg[1],
                        'firstname': msg[4],
                        'photos': photos
                    },
                    'message': msg[2],
                    'created_at': created_at
                }
            return None
        except mysql.connector.Error as err:
            logging.error(f"Database error in add_message: {err}")
            return None
        except Exception as e:
            logging.error(f"Unexpected error in add_message: {e}")
            return None
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

    @staticmethod
    def get_conversation_by_id(conversation_id):
        try:
            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor(dictionary=True)
            
            query = """
                SELECT id, user1_id, user2_id, created_at
                FROM conversations
                WHERE id = %s
            """
            cursor.execute(query, (conversation_id,))
            conversation = cursor.fetchone()
            
            return conversation
            
        except mysql.connector.Error as err:
            logging.error(f"Database error in get_conversation_by_id: {err}")
            return None
        except Exception as e:
            logging.error(f"Unexpected error in get_conversation_by_id: {e}")
            return None
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
                
    @staticmethod
    def delete_conversation(user1_id, user2_id):
        try:
            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor()
            
            # First, find the conversation ID
            query = """
                SELECT id FROM conversations
                WHERE (user1_id = %s AND user2_id = %s) OR (user1_id = %s AND user2_id = %s)
            """
            cursor.execute(query, (user1_id, user2_id, user2_id, user1_id))
            conversation = cursor.fetchone()
            
            if not conversation:
                logging.info(f"No conversation found between users {user1_id} and {user2_id}")
                return True  # No conversation to delete
                
            conversation_id = conversation[0]
            
            # Delete all messages in the conversation
            delete_messages_query = """
                DELETE FROM messages
                WHERE conversation_id = %s
            """
            cursor.execute(delete_messages_query, (conversation_id,))
            
            # Delete the conversation
            delete_conversation_query = """
                DELETE FROM conversations
                WHERE id = %s
            """
            cursor.execute(delete_conversation_query, (conversation_id,))
            
            connection.commit()
            logging.info(f"Successfully deleted conversation {conversation_id} between users {user1_id} and {user2_id}")
            return True
            
        except mysql.connector.Error as err:
            logging.error(f"Database error in delete_conversation: {err}")
            return False
        except Exception as e:
            logging.error(f"Unexpected error in delete_conversation: {e}")
            return False
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
