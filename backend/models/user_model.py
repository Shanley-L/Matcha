import mysql.connector
from config.database import db_config
from flask import jsonify
import logging
import json
import datetime
import math

class UserModel:
    @staticmethod
    def get_by_id(user_id):
        try:
            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT id, username, email, is_email_verified, firstname,\
            birthdate, country, gender, looking_for, interests, photos, match_type,\
            job, bio, city, suburb, latitude, longitude, created_at, is_connected, latest_connection, viewers FROM users WHERE id = %s", (user_id,))
            user = cursor.fetchone()
            if user:
                if user.get('interests') and isinstance(user['interests'], bytes):
                    user['interests'] = json.loads(user['interests'].decode())
                if user.get('photos') and isinstance(user['photos'], bytes):
                    user['photos'] = json.loads(user['photos'].decode())
                if user.get('viewers') and isinstance(user['viewers'], bytes):
                    user['viewers'] = json.loads(user['viewers'].decode())
                if user.get('birthdate'):
                    user['birthdate'] = user['birthdate'].isoformat() if user['birthdate'] else None
                if user.get('created_at'):
                    user['created_at'] = user['created_at'].isoformat() if user['created_at'] else None
                if user.get('city'):
                    user['city'] = user['city']
                if user.get('suburb'):
                    user['suburb'] = user['suburb']
                if user.get('latitude'):
                    user['latitude'] = float(user['latitude'])
                if user.get('longitude'):
                    user['longitude'] = float(user['longitude'])
                if user.get('is_connected'):
                    user['is_connected'] = user['is_connected']
                if user.get('latest_connection'):
                    user['latest_connection'] = user['latest_connection'].isoformat() if user['latest_connection'] else None
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
            if 'cursor' in locals() and cursor:
                cursor.close()
            if 'connection' in locals() and connection:
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
            if 'cursor' in locals() and cursor:
                cursor.close()
            if 'connection' in locals() and connection:
                connection.close()

    @staticmethod
    def update_user(user_id, username=None, firstname=None, birthdate=None, country=None, gender=None, looking_for=None, interests=None, photos=None, matchType=None, is_first_login=None, job=None, bio=None, viewers=None, city=None, suburb=None, latitude=None, longitude=None):
        try:
            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor()
            if interests is not None:
                clear_interests_sql = "UPDATE users SET interests = NULL WHERE id = %s"
                cursor.execute(clear_interests_sql, (user_id,))
                connection.commit()
            if photos is not None:
                clear_photos_sql = "UPDATE users SET photos = NULL WHERE id = %s"
                cursor.execute(clear_photos_sql, (user_id,))
                connection.commit()
            update_fields = []
            params = []

            if username:
                update_fields.append("username = %s")
                params.append(username)
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
            if interests is not None:
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
            if viewers:
                update_fields.append("viewers = %s")
                params.append(viewers)
            if city:
                update_fields.append("city = %s")
                params.append(city)
            if suburb:
                update_fields.append("suburb = %s")
                params.append(suburb)
            if latitude:
                update_fields.append("latitude = %s")
                params.append(latitude)
            if longitude:
                update_fields.append("longitude = %s")
                params.append(longitude)
            if not update_fields:
                return None, "No fields to update"
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
            if 'cursor' in locals() and cursor:
                cursor.close()
            if 'connection' in locals() and connection:
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
            if 'cursor' in locals() and cursor:
                cursor.close()
            if 'connection' in locals() and connection:
                connection.close()

    @staticmethod
    def create_interaction(user_id, target_user_id, interaction_type):
        try:
            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor()
            query = """
                INSERT INTO user_interactions (user_id, target_user_id, interaction_type)
                VALUES (%s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    interaction_type = VALUES(interaction_type),
                    updated_at = CURRENT_TIMESTAMP
            """
            cursor.execute(query, (user_id, target_user_id, interaction_type))
            connection.commit()
            logging.info(f"Created interaction: {user_id} -> {target_user_id} ({interaction_type})")

            # Check if this creates a match
            if interaction_type == 'like':
                # Check if there's a mutual like
                match_query = """
                    SELECT COUNT(*) as match_count
                    FROM user_interactions
                    WHERE user_id = %s 
                    AND target_user_id = %s
                    AND interaction_type = 'like'
                """
                cursor.execute(match_query, (target_user_id, user_id))
                result = cursor.fetchone()
                
                if result[0] > 0:  # If there's a mutual like
                    logging.info(f"Match found between users {user_id} and {target_user_id}")
                    # Create a conversation
                    conv_query = """
                        INSERT INTO conversations (user1_id, user2_id)
                        VALUES (LEAST(%s, %s), GREATEST(%s, %s))
                        ON DUPLICATE KEY UPDATE id = id
                    """
                    cursor.execute(conv_query, (user_id, target_user_id, user_id, target_user_id))
                    conversation_id = cursor.lastrowid
                    connection.commit()
                    logging.info(f"Created conversation {conversation_id} for match between users {user_id} and {target_user_id}")
                    
            return True
            
        except mysql.connector.Error as err:
            logging.error(f"Database error in create_interaction: {err}")
            return False
        finally:
            if 'cursor' in locals() and cursor:
                cursor.close()
            if 'connection' in locals() and connection:
                connection.close()

    @staticmethod
    def check_match(user1_id, user2_id):
        try:
            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor()
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
            if 'cursor' in locals() and cursor:
                cursor.close()
            if 'connection' in locals() and connection:
                connection.close()

    @staticmethod
    def get_likes_for_user(user_id):
        try:
            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor(dictionary=True)
            query = """
                SELECT DISTINCT u.id, u.firstname, u.country, u.photos
                FROM users u
                JOIN user_interactions ui ON u.id = ui.user_id
                WHERE ui.target_user_id = %s
                AND ui.interaction_type = 'like'
                AND NOT EXISTS (
                    SELECT 1
                    FROM user_interactions ui2
                    WHERE ui2.user_id = %s
                    AND ui2.target_user_id = u.id
                    AND ui2.interaction_type = 'like'
                )
                ORDER BY ui.created_at DESC
            """
            cursor.execute(query, (user_id, user_id))
            likes = cursor.fetchall()
            
            for like in likes:
                if like.get('photos') and isinstance(like['photos'], bytes):
                    like['photos'] = json.loads(like['photos'].decode())
                
            return likes
            
        except mysql.connector.Error as err:
            logging.error(f"Database error in get_likes_for_user: {err}")
            return []
        finally:
            if 'cursor' in locals() and cursor:
                cursor.close()
            if 'connection' in locals() and connection:
                connection.close()

    @staticmethod
    def has_user_liked_me(current_user_id, target_user_id):
        """
        Check if target_user_id has liked current_user_id
        """
        try:
            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor()
            query = """
                SELECT COUNT(*) as like_count
                FROM user_interactions
                WHERE user_id = %s 
                AND target_user_id = %s
                AND interaction_type = 'like'
            """
            cursor.execute(query, (target_user_id, current_user_id))
            result = cursor.fetchone()            
            return result[0] > 0
            
        except mysql.connector.Error as err:
            logging.error(f"Database error in has_user_liked_me: {err}")
            return False
        finally:
            if 'cursor' in locals() and cursor:
                cursor.close()
            if 'connection' in locals() and connection:
                connection.close()

    @staticmethod
    def get_fame_rate(user_id):
        """
        Calculate the fame rate based on likes and dislikes
        Returns a dictionary with likes, dislikes, and fame_rate
        """
        try:
            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor()
            
            # Get likes count
            likes_query = """
                SELECT COUNT(*) as count
                FROM user_interactions
                WHERE target_user_id = %s
                AND interaction_type = 'like'
            """
            cursor.execute(likes_query, (user_id,))
            likes_count = cursor.fetchone()[0]
            
            # Get dislikes count
            dislikes_query = """
                SELECT COUNT(*) as count
                FROM user_interactions
                WHERE target_user_id = %s
                AND interaction_type = 'dislike'
            """
            cursor.execute(dislikes_query, (user_id,))
            dislikes_count = cursor.fetchone()[0]
            
            # Calculate fame rate
            total_interactions = likes_count + dislikes_count
            fame_rate = 0
            if total_interactions > 0:
                fame_rate = round((likes_count / total_interactions) * 100)
            
            return {
                "likes": likes_count,
                "dislikes": dislikes_count,
                "fame_rate": fame_rate
            }
            
        except mysql.connector.Error as err:
            logging.error(f"Database error in get_fame_rate: {err}")
            return {"likes": 0, "dislikes": 0, "fame_rate": 0}
        finally:
            if 'cursor' in locals() and cursor:
                cursor.close()
            if 'connection' in locals() and connection:
                connection.close()

    @staticmethod
    def get_potential_matches(current_user_id, min_age=None, max_age=None, distance=None, fame_rating=None):
        try:
            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor(dictionary=True)
            cursor.execute("""
                SELECT gender, looking_for, interests, is_blocked_by, city, country, suburb, latitude, longitude
                FROM users 
                WHERE id = %s
            """, (current_user_id,))
            current_user = cursor.fetchone()
            if not current_user:
                logging.error("Current user not found")
                return []
            current_user_blocked_by = []
            if current_user.get('is_blocked_by'):
                if isinstance(current_user['is_blocked_by'], bytes):
                    current_user_blocked_by = json.loads(current_user['is_blocked_by'].decode())
                elif isinstance(current_user['is_blocked_by'], str):
                    current_user_blocked_by = json.loads(current_user['is_blocked_by'])
                else:
                    current_user_blocked_by = current_user['is_blocked_by']
            blocked_condition = ""
            if current_user_blocked_by:
                placeholders = ', '.join(['%s'] * len(current_user_blocked_by))
                blocked_condition = f"AND id NOT IN ({placeholders})"
            current_user_interests = []
            if current_user.get('interests'):
                if isinstance(current_user['interests'], bytes):
                    current_user_interests = json.loads(current_user['interests'].decode())
                elif isinstance(current_user['interests'], str):
                    current_user_interests = json.loads(current_user['interests'])
                else:
                    current_user_interests = current_user['interests']
            gender_condition = ""
            if current_user['looking_for'] == 'male':
                gender_condition = "AND gender = 'male'"
            elif current_user['looking_for'] == 'female':
                gender_condition = "AND gender = 'female'"
            age_condition = ""
            if min_age is not None and max_age is not None:
                age_condition = """
                    AND TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) >= %s 
                    AND TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) <= %s
                """

            query = f"""
                SELECT id, username, firstname, birthdate, job, bio, photos, country, gender, interests,
                       latitude, longitude, city, suburb
                FROM users
                WHERE id != %s
                {gender_condition}
                {age_condition}
                AND id NOT IN (
                    SELECT target_user_id 
                    FROM user_interactions 
                    WHERE user_id = %s
                )
                AND (is_blocked_by IS NULL OR NOT JSON_CONTAINS(is_blocked_by, %s, '$'))
                {blocked_condition}
            """
            params = [current_user_id]  # For the id != %s condition
            if min_age is not None and max_age is not None:
                params.extend([min_age, max_age])
            params.append(current_user_id)  # For the WHERE user_id = %s in subquery
            params.append(json.dumps(current_user_id))  # For the JSON_CONTAINS function
            if current_user_blocked_by:
                params.extend(current_user_blocked_by)
            
            cursor.execute(query, tuple(params))
            matches = cursor.fetchall()
            processed_matches = []
            for match in matches:
                processed_match = {}
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
                match_score = 0
                if processed_match.get('interests'):
                    match_interests = processed_match['interests']
                    common_interests = set(current_user_interests) & set(match_interests)
                    match_score = len(common_interests)
                processed_match['match_score'] = match_score
                processed_matches.append(processed_match)

            # Batch fetch fame ratings for all candidate users
            candidate_ids = [m['id'] for m in processed_matches]
            fame_data = {}
            if candidate_ids:
                format_strings = ','.join(['%s'] * len(candidate_ids))
                fame_query = f'''
                    SELECT target_user_id,
                           SUM(interaction_type = 'like') AS likes,
                           SUM(interaction_type = 'dislike') AS dislikes
                    FROM user_interactions
                    WHERE target_user_id IN ({format_strings})
                    GROUP BY target_user_id
                '''
                cursor.execute(fame_query, tuple(candidate_ids))
                for row in cursor.fetchall():
                    total = (row['likes'] or 0) + (row['dislikes'] or 0)
                    fame_rate = round((row['likes'] / total) * 100) if total > 0 else 0
                    fame_data[row['target_user_id']] = fame_rate

            # Filter by distance if requested and user has lat/lon
            if distance is not None and current_user.get('latitude') and current_user.get('longitude'):
                def haversine(lat1, lon1, lat2, lon2):
                    from math import radians, sin, cos, sqrt, atan2
                    R = 6371  # Earth radius in km
                    dlat = radians(lat2 - lat1)
                    dlon = radians(lon2 - lon1)
                    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
                    c = 2 * atan2(sqrt(a), sqrt(1 - a))
                    return R * c
                user_lat = float(current_user['latitude'])
                user_lon = float(current_user['longitude'])
                filtered_matches = []
                for m in processed_matches:
                    if m.get('latitude') and m.get('longitude'):
                        dist = haversine(user_lat, user_lon, float(m['latitude']), float(m['longitude']))
                        m['distance_km'] = round(dist)
                        if dist <= distance:
                            filtered_matches.append(m)
                processed_matches = filtered_matches
            else:
                # Even if not filtering, still add distance if possible
                if current_user.get('latitude') and current_user.get('longitude'):
                    def haversine(lat1, lon1, lat2, lon2):
                        from math import radians, sin, cos, sqrt, atan2
                        R = 6371  # Earth radius in km
                        dlat = radians(lat2 - lat1)
                        dlon = radians(lon2 - lon1)
                        a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
                        c = 2 * atan2(sqrt(a), sqrt(1 - a))
                        return R * c
                    user_lat = float(current_user['latitude'])
                    user_lon = float(current_user['longitude'])
                    for m in processed_matches:
                        if m.get('latitude') and m.get('longitude'):
                            dist = haversine(user_lat, user_lon, float(m['latitude']), float(m['longitude']))
                            m['distance_km'] = round(dist)

            # Attach fame_rate to each match
            for m in processed_matches:
                m['fame_rate'] = fame_data.get(m['id'], 0)

            # Filter by fame_rating if requested
            if fame_rating is not None:
                fame_rating = int(fame_rating)
                processed_matches = [m for m in processed_matches if m.get('fame_rate', 0) <= fame_rating]

            processed_matches.sort(key=lambda x: x.get('match_score', 0), reverse=True)
            return processed_matches
            
        except mysql.connector.Error as err:
            logging.error(f"Database error in get_potential_matches: {err}")
            return []
        finally:
            if 'cursor' in locals() and cursor:
                cursor.close()
            if 'connection' in locals() and connection:
                connection.close()

    @staticmethod
    def get_matches_list(user_id):
        try:
            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor(dictionary=True)
            query = """
                SELECT DISTINCT u.id, u.firstname, u.country, u.photos
                FROM users u
                JOIN user_interactions ui1 ON u.id = ui1.user_id
                JOIN user_interactions ui2 ON u.id = ui2.target_user_id
                WHERE ui1.target_user_id = %s
                AND ui2.user_id = %s
                AND ui1.interaction_type = 'like'
                AND ui2.interaction_type = 'like'
                ORDER BY ui1.created_at DESC
            """
            cursor.execute(query, (user_id, user_id))
            matches = cursor.fetchall()
            for match in matches:
                if match.get('photos') and isinstance(match['photos'], bytes):
                    match['photos'] = json.loads(match['photos'].decode())
                
            return matches
            
        except mysql.connector.Error as err:
            logging.error(f"Database error in get_matches_list: {err}")
            return []
        finally:
            if 'cursor' in locals() and cursor:
                cursor.close()
            if 'connection' in locals() and connection:
                connection.close()

    @staticmethod
    def delete_match(user_id, target_user_id):
        """
        Delete a match between two users by removing their interactions and conversation
        """
        try:
            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor()
            
            conv_query = """
                DELETE FROM conversations 
                WHERE (user1_id = %s AND user2_id = %s) 
                OR (user1_id = %s AND user2_id = %s)
            """
            cursor.execute(conv_query, (user_id, target_user_id, target_user_id, user_id))
            
            interaction_query = """
                DELETE FROM user_interactions 
                WHERE (user_id = %s AND target_user_id = %s) 
                OR (user_id = %s AND target_user_id = %s)
            """
            cursor.execute(interaction_query, (user_id, target_user_id, target_user_id, user_id))
            
            connection.commit()
            return True
            
        except mysql.connector.Error as err:
            logging.error(f"Database error in delete_match: {err}")
            return False

    @staticmethod
    def block_user(user_id, target_id):
        try:
            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor()

            query = """
                UPDATE users
                SET is_blocked_by = JSON_ARRAY_APPEND(COALESCE(is_blocked_by, '[]'),'$',%s)
                WHERE id = %s
            """     
            cursor.execute(query, (user_id, target_id))
            connection.commit()
            return True 
        except mysql.connector.Error as err:
            logging.error(f"Database error in block_user: {err}")
            return False
        finally:
            if 'cursor' in locals() and cursor:
                cursor.close()
            if 'connection' in locals() and connection:
                connection.close()

    @staticmethod
    def get_current_timestamp():
        """Return the current timestamp in ISO format"""
        return datetime.datetime.now().isoformat()

    @staticmethod
    def is_user_blocked(user_id, target_id):
        try:
            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor()

            query = """
                SELECT JSON_CONTAINS(is_blocked_by, %s, '$')
                FROM users
                WHERE id = %s;
            """
            cursor.execute(query, (user_id, target_id))
            result = cursor.fetchone()
            print("result:", result)

            return result and result[0] == 1
        except mysql.connector.Error as err:
            logging.error(f"Database error in is_user_blocked: {err}")
            return False
        finally:
            if 'cursor' in locals() and cursor:
                cursor.close()
            if 'connection' in locals() and connection:
                connection.close()


    @staticmethod
    def undo_block(user_id, target_id):
        try:
            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor()
            query = """
                UPDATE users
                SET is_blocked_by = JSON_REMOVE(
                    is_blocked_by, 
                    JSON_UNQUOTE(JSON_SEARCH(is_blocked_by, 'one', %s))
                )
                WHERE id = %s
            """
            cursor.execute(query, (user_id, target_id))
            connection.commit()
            return True
        except mysql.connector.Error as err:
            logging.error(f"Database error in undo_block: {err}")
            return False
        finally:
            if 'cursor' in locals() and cursor:
                cursor.close()
            if 'connection' in locals() and connection:
                connection.close()

    @staticmethod
    def report_user(user_id, target_id):
        try:
            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor()
            query = """
                UPDATE users
                SET is_fake_account = JSON_ARRAY_APPEND(COALESCE(is_fake_account, '[]'),'$',%s)
                WHERE id = %s 
            """
            cursor.execute(query, (user_id, target_id))
            connection.commit()
            return True 
        except mysql.connector.Error as err:
            logging.error(f"Database error in report_user: {err}")
            return False
        finally:
            if 'cursor' in locals() and cursor:
                cursor.close()
            if 'connection' in locals() and connection:
                connection.close()

    @staticmethod
    def is_user_reported(user_id, target_id):
        try:
            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor()

            query = """
                SELECT JSON_CONTAINS(is_fake_account, %s, '$')
                FROM users
                WHERE id = %s;
            """
            cursor.execute(query, (user_id, target_id))
            result = cursor.fetchone()
            print("result:", result)

            return result and result[0] == 1
        except mysql.connector.Error as err:
            logging.error(f"Database error in is_user_reported: {err}")
            return False
        finally:
            if 'cursor' in locals() and cursor:
                cursor.close()
            if 'connection' in locals() and connection:
                connection.close()

    @staticmethod
    def undo_report(user_id, target_id):
        try:        
            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor()
            query = """
                UPDATE users
                SET is_fake_account = JSON_REMOVE(
                    is_fake_account, 
                    JSON_UNQUOTE(JSON_SEARCH(is_fake_account, 'one', %s))
                )
                WHERE id = %s
            """
            cursor.execute(query, (user_id, target_id))
            connection.commit()
            return True
        except mysql.connector.Error as err:
            logging.error(f"Database error in undo_report: {err}")
            return False
        finally:
            if 'cursor' in locals() and cursor:
                cursor.close()
            if 'connection' in locals() and connection:
                connection.close()

    @staticmethod
    def update_user_connection(user_id):
        try:
            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor()
            query = """
                UPDATE users
                SET is_connected = 1
                WHERE id = %s
            """
            cursor.execute(query, (user_id,))
            connection.commit()
            return True
        except mysql.connector.Error as err:
            logging.error(f"Database error in update_user_connection: {err}")
            return False
        finally:
            if 'cursor' in locals() and cursor:
                cursor.close()
            if 'connection' in locals() and connection:
                connection.close()

    @staticmethod
    def update_user_latest_connection(user_id):
        try:
            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor()
            query = """
                UPDATE users
                SET latest_connection = CURRENT_TIMESTAMP,
                is_connected = 0
                WHERE id = %s
            """
            cursor.execute(query, (user_id,))
            connection.commit()
            return True
        except mysql.connector.Error as err:
            logging.error(f"Database error in update_user_latest_connection: {err}")
            return False
        finally:
            if 'cursor' in locals() and cursor:
                cursor.close()
            if 'connection' in locals() and connection:
                connection.close()

    @staticmethod
    def get_blocked_users(user_id):
        try:
            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor(dictionary=True)

            # Query to find users that have the current user's ID in their is_blocked_by JSON array
            query = """
                SELECT id, username, firstname, birthdate, job, bio, photos, country, gender
                FROM users
                WHERE JSON_CONTAINS(is_blocked_by, %s, '$')
                ORDER BY firstname
            """
            
            cursor.execute(query, (json.dumps(user_id),))
            blocked_users = cursor.fetchall()
            
            for user in blocked_users:
                if user.get('photos') and isinstance(user['photos'], bytes):
                    user['photos'] = json.loads(user['photos'].decode())

            return blocked_users
            
        except mysql.connector.Error as err:
            logging.error(f"Database error in get_blocked_users: {err}")
            return []
        finally:
            if 'cursor' in locals() and cursor:
                cursor.close()
            if 'connection' in locals() and connection:
                connection.close()
