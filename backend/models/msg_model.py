import mysql.connector
from config.database import db_config

class MessageModel:
    @staticmethod
    def create(conversation_id, sender_id, content):
        try:
            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor()

            cursor.execute("""
                INSERT INTO messages (conversation_id, sender_id, content)
                VALUES (%s, %s, %s)
            """, (conversation_id, sender_id, content))
            connection.commit()

            return {
                "conversation_id": conversation_id,
                "sender_id": sender_id,
                "content": content
            }

        except mysql.connector.Error as err:
            print("Database error:", err)
            return None
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
