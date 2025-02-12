import mysql.connector
from config.database import db_config
from flask import jsonify
import logging
import json

class UserModel:
    @staticmethod
    def get_by_id(user_id):
        try:
            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT id, username, email, is_email_verified, firstname,\
            birthdate, country, gender, sexual_orientation, interests, photos, match_type,\
            job, bio, created_at FROM users WHERE id = %s", (user_id,))
            user = cursor.fetchone()
            if user:
                # Convert bytes to string for JSON fields
                if user.get('interests') and isinstance(user['interests'], bytes):
                    user['interests'] = json.loads(user['interests'].decode())
                if user.get('photos') and isinstance(user['photos'], bytes):
                    user['photos'] = json.loads(user['photos'].decode())
                # Convert datetime objects to string
                if user.get('birthdate'):
                    user['birthdate'] = user['birthdate'].isoformat() if user['birthdate'] else None
                if user.get('created_at'):
                    user['created_at'] = user['created_at'].isoformat() if user['created_at'] else None
            return user
        except mysql.connector.Error as err:
            logging.error(f"Database error in get_by_id: {err}")
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
    def update_user(user_id, firstname=None, birthdate=None, country=None, gender=None, sexual_orientation=None, interests=None, photos=None, matchType=None, is_first_login=None, job=None, bio=None):
        try:
            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor()

            # Construct the update query
            update_fields = []
            params = []

            if firstname:
                update_fields.append("firstname = %s")
                params.append(firstname)
            if birthdate:
                update_fields.append("birthdate = %s")
                params.append(birthdate)
            if country:
                update_fields.append("country = %s")
                params.append(country)
            if gender:
                update_fields.append("gender = %s")
                params.append(gender)
            if sexual_orientation:
                update_fields.append("sexual_orientation = %s")
                params.append(sexual_orientation)
            if interests:
                update_fields.append("interests = %s")
                params.append(interests)
            if photos:
                update_fields.append("photos = %s")
                params.append(photos)
            if matchType:
                update_fields.append("match_type = %s")
                params.append(matchType)
            if is_first_login is not None:
                update_fields.append("is_first_login = %s")
                params.append(is_first_login)
            if job:
                update_fields.append("job = %s")
                params.append(job)
            if bio:
                update_fields.append("bio = %s")
                params.append(bio)

            # If no field is provided for update, return error
            if not update_fields:
                return None, "No fields to update"

            # Construct the SQL query to update the user
            sql = f"UPDATE users SET {', '.join(update_fields)}, updated_at = CURRENT_TIMESTAMP WHERE id = %s"
            params.append(user_id)

            cursor.execute(sql, tuple(params))
            connection.commit()

            if cursor.rowcount > 0:
                return user_id, None
            return None, "No rows affected"

        except mysql.connector.Error as err:
            error_msg = str(err)
            if err.errno == 1265:  # Code d'erreur pour une valeur enum invalide
                return None, f"Invalid value for enum field: {error_msg}"
            elif err.errno == 1292:  # Code d'erreur pour un format de date invalide
                return None, f"Invalid date format: {error_msg}"
            elif err.errno == 1366:  # Code d'erreur pour une valeur incorrecte
                return None, f"Incorrect value format: {error_msg}"
            else:
                return None, f"Database error: {error_msg}"
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
