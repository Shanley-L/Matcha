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
            birthdate, country, gender, looking_for, interests, photos, match_type,\
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
            cursor.execute("SELECT id, email, password FROM users WHERE username = %s", (username,))
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
            cursor.execute("SELECT id, email, password, is_first_login, is_email_verified FROM users WHERE email = %s", (email,))
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
    def update_user(user_id, firstname=None, birthdate=None, country=None, gender=None, looking_for=None, interests=None, photos=None, matchType=None, is_first_login=None, job=None, bio=None):
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
            if looking_for:
                update_fields.append("looking_for = %s")
                params.append(looking_for)
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

    @staticmethod
    def create_interaction(user_id, target_user_id, interaction_type):
        try:
            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor()
            
            # Insert or update the interaction
            query = """
                INSERT INTO user_interactions (user_id, target_user_id, interaction_type)
                VALUES (%s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    interaction_type = VALUES(interaction_type),
                    updated_at = CURRENT_TIMESTAMP
            """
            cursor.execute(query, (user_id, target_user_id, interaction_type))
            connection.commit()
            
            return True
            
        except mysql.connector.Error as err:
            logging.error(f"Database error in create_interaction: {err}")
            return False
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

    @staticmethod
    def check_match(user1_id, user2_id):
        try:
            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor()
            
            # Check if both users have liked each other
            query = """
                SELECT COUNT(*) as match_count
                FROM user_interactions u1
                JOIN user_interactions u2 ON u1.user_id = u2.target_user_id 
                    AND u1.target_user_id = u2.user_id
                WHERE u1.user_id = %s 
                    AND u1.target_user_id = %s
                    AND u1.interaction_type = 'like'
                    AND u2.interaction_type = 'like'
            """
            cursor.execute(query, (user1_id, user2_id))
            result = cursor.fetchone()
            
            return result[0] > 0
            
        except mysql.connector.Error as err:
            logging.error(f"Database error in check_match: {err}")
            return False
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

    @staticmethod
    def get_potential_matches(current_user_id, limit=10):
        try:
            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor(dictionary=True)
            cursor.execute("""
                SELECT gender, looking_for, interests 
                FROM users 
                WHERE id = %s
            """, (current_user_id,))
            current_user = cursor.fetchone()
            if not current_user:
                logging.error("Current user not found")
                return []
            # Parse current user's interests
            current_user_interests = []
            if current_user.get('interests'):
                if isinstance(current_user['interests'], bytes):
                    current_user_interests = json.loads(current_user['interests'].decode())
                elif isinstance(current_user['interests'], str):
                    current_user_interests = json.loads(current_user['interests'])
                else:
                    current_user_interests = current_user['interests']
            # Build the gender filter based on sexual orientation
            gender_condition = ""
            if current_user['looking_for'] == 'male':
                gender_condition = "AND gender = 'male'"
            elif current_user['looking_for'] == 'female':
                gender_condition = "AND gender = 'female'"
            # Get users that haven't been interacted with by the current user
            query = f"""
                SELECT id, username, firstname, birthdate, job, bio, photos, country, gender, interests
                FROM users
                WHERE id != %s
                {gender_condition}
                AND id NOT IN (
                    SELECT target_user_id 
                    FROM user_interactions 
                    WHERE user_id = %s
                )
            """
            cursor.execute(query, (current_user_id, current_user_id))
            matches = cursor.fetchall()
            # Process the results and calculate match scores
            processed_matches = []
            for match in matches:
                processed_match = {}
                # Process dates and photos
                for key, value in match.items():
                    if key == 'birthdate' and value:
                        processed_match[key] = value.isoformat()
                    elif key == 'photos' and value and isinstance(value, bytes):
                        processed_match[key] = json.loads(value.decode())
                    elif key == 'interests' and value:
                        if isinstance(value, bytes):
                            processed_match[key] = json.loads(value.decode())
                        elif isinstance(value, str):
                            processed_match[key] = json.loads(value)
                        else:
                            processed_match[key] = value
                    else:
                        processed_match[key] = value
                # Calculate interest match score
                match_score = 0
                if processed_match.get('interests'):
                    match_interests = processed_match['interests']
                    # Calculate score based on common interests
                    common_interests = set(current_user_interests) & set(match_interests)
                    match_score = len(common_interests)
                processed_match['match_score'] = match_score
                processed_matches.append(processed_match)
            processed_matches.sort(key=lambda x: x['match_score'], reverse=True)
            return processed_matches[:limit]
            
        except mysql.connector.Error as err:
            logging.error(f"Database error in get_potential_matches: {err}")
            return []
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
