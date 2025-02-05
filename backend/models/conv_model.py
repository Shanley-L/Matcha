import mysql.connector
from config.database import db_config

class ConversationModel:
    @staticmethod
    def get_or_create(user1_id, user2_id):
        try:
            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor()

            # Vérifier si la conversation existe déjà
            cursor.execute("""
                SELECT id FROM conversations
                WHERE (user1_id = %s AND user2_id = %s) OR (user1_id = %s AND user2_id = %s)
            """, (user1_id, user2_id, user2_id, user1_id))
            conversation = cursor.fetchone()

            if conversation:
                return conversation[0]

            # Sinon, créer une nouvelle conversation
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
