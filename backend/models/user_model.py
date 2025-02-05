import mysql.connector
from config.database import db_config

class UserModel:
    @staticmethod
    def get_by_id(user_id):
        try:
            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT id, username, email, created_at FROM users WHERE id = %s", (user_id,))
            user = cursor.fetchone()
            return user
        except mysql.connector.Error as err:
            print("Database error:", err)
            return None
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

    @staticmethod
    def get_by_email(email):
        try:
            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
            user = cursor.fetchone()
            return user
        except mysql.connector.Error as err:
            print("Database error:", err)
            return None
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

    @staticmethod
    def create(name, email, password):
        try:
            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor()
            sql = "INSERT INTO users (username, email, password) VALUES (%s, %s, %s)"
            cursor.execute(sql, (name, email, password))
            connection.commit()
            user_id = cursor.lastrowid
            return user_id
        except mysql.connector.Error as err:
            print("Database error:", err)
            return None
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
