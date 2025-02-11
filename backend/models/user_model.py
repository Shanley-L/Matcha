import mysql.connector
from config.database import db_config
from flask import jsonify
import logging

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
    def get_by_nickname(username):
        try:
            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
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
            logging.error(f"Database error in get_by_email: {err}")
            return None
        finally:
            if 'cursor' in locals() and cursor:
                cursor.close()
            if 'connection' in locals() and connection:
                connection.close()

    @staticmethod
    def create(name, email, password):
        try:
            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor(dictionary=True)
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

    @staticmethod
    def update_user(user_id, username=None, email=None, password=None, first_name=None, gender=None, sexual_orientation=None, looking_for=None, bio=None, birthdate=None, city=None, interests=None):
        try:
            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor()

            # Construct the update query
            update_fields = []
            params = []

            if username:
                update_fields.append("username = %s")
                params.append(username)
            if email:
                update_fields.append("email = %s")
                params.append(email)
            if password:
                update_fields.append("password = %s")
                params.append(password)
            if first_name:
                update_fields.append("first_name = %s")
                params.append(first_name)
            if gender:
                update_fields.append("gender = %s")
                params.append(gender)
            if sexual_orientation:
                update_fields.append("sexual_orientation = %s")
                params.append(sexual_orientation)
            if looking_for:
                update_fields.append("looking_for = %s")
                params.append(looking_for)
            if bio:
                update_fields.append("bio = %s")
                params.append(bio)
            if birthdate:
                update_fields.append("birthdate = %s")
                params.append(birthdate)
            if city:
                update_fields.append("city = %s")
                params.append(city)
            if interests:
                update_fields.append("interests = %s")
                params.append(interests)

            # If no field is provided for update, return None
            if not update_fields:
                return None

            # Construct the SQL query to update the user
            sql = f"UPDATE users SET {', '.join(update_fields)}, updated_at = CURRENT_TIMESTAMP WHERE id = %s"
            params.append(user_id)

            cursor.execute(sql, tuple(params))
            connection.commit()

            if cursor.rowcount > 0:
                return user_id
            return None
        except mysql.connector.Error as err:
            print("Database error:", err)
            return None
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

    @staticmethod
    def verified(user_id):
        try:
            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor(dictionary=True)
            cursor.execute("UPDATE users SET is_email_verified = 1 WHERE id = %s", (user_id,))
            connection.commit()
            if cursor.rowcount > 0:
                return jsonify({"message": "Email verified"}), 200
            return jsonify({"message": "Email not verified"}), 400
        except mysql.connector.Error as err:
            logging.error("Database error:", err)
            return jsonify({"message": "Email not verified"}), 400
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
