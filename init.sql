CREATE DATABASE IF NOT EXISTS matcha;
USE matcha;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    firstname VARCHAR(50),
    gender ENUM('male', 'female', 'other'),
    looking_for ENUM('male', 'female', 'other'),
    bio TEXT,
    job VARCHAR(100),
    birthdate DATE,
    country VARCHAR(100),
    town VARCHAR(100),
    neighbourhood VARCHAR(100),
    interests JSON,
    is_first_login BOOLEAN DEFAULT TRUE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    photos JSON,
    viewers JSON,
    match_score INT DEFAULT 0,
    match_type ENUM('love', 'friends', 'fling', 'business'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO users (username, email, password, firstname, gender, looking_for, bio, job, birthdate, country, town, neighbourhood, interests, is_first_login, photos, match_type) VALUES
    ('Sebou', 'sebastien@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN9V3UF9T3HJGQZsuHhJi', 'Sebastien', 'male', 'female', 'Passionné de photographie et de voyages. Amateur de bons vins et de cuisine française.', 'Photographe', '1990-05-15', 'France', 'Paris', 'Montmartre', '["photography", "travel_places", "food_drink"]', false, '["/init/sebastien.jpeg", "/init/sebastien.jpeg", "/init/sebastien.jpeg", "/init/sebastien.jpeg"]', 'love'),
    ('Lisou', 'elise@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN9V3UF9T3HJGQZsuHhJi', 'Elise', 'female', 'male', 'Artiste dans l''âme, je peins et dessine. Je cherche à partager ma passion pour l''art.', 'Artiste Peintre', '1993-08-22', 'France', 'Paris', 'Le Marais', '["art", "painting", "nature_plant"]', false, '["/init/elise.jpeg", "/init/elise.jpeg", "/init/elise.jpeg", "/init/elise.jpeg"]', 'friends'),
    ('Sarouche', 'sarah@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN9V3UF9T3HJGQZsuHhJi', 'Sarah', 'female', 'male', 'Yoga instructor cherchant à partager bien-être et spiritualité.', 'Professeur de Yoga', '1991-03-12', 'United States', 'Paris', 'Saint-Germain-des-Prés', '["gym_fitness", "nature_plant", "people_society"]', false, '["/init/sarah.jpeg", "/init/sarah.jpeg", "/init/sarah.jpeg", "/init/sarah.jpeg"]', 'love'),
    ('Aux fraises', 'charlotte@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN9V3UF9T3HJGQZsuHhJi', 'Charlotte', 'female', 'male', 'Passionnée de littérature et de théâtre. J''aime les longues discussions autour d''un café.', 'Libraire', '1994-11-30', 'France', 'Paris', 'Quartier Latin', '["book_novel", "writing", "art"]', false, '["/init/charlotte.jpeg", "/init/charlotte.jpeg", "/init/charlotte.jpeg", "/init/charlotte.jpeg"]', 'friends'),
    ('Le F', 'francois@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN9V3UF9T3HJGQZsuHhJi', 'Francois', 'male', 'female', 'Chef cuisinier, amateur de gastronomie et de vins. Je voyage pour découvrir de nouvelles saveurs.', 'Chef Cuisinier', '1988-07-19', 'France', 'Paris', 'Belleville', '["food_drink", "travel_places", "photography"]', false, '["/init/francois.jpeg", "/init/francois.jpeg", "/init/francois.jpeg", "/init/francois.jpeg"]', 'love'),
    ('Sangochan', 'shanley@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN9V3UF9T3HJGQZsuHhJi', 'Shanley', 'male', 'female', 'Développeur web, geek et fière de l''être. Fan de jeux vidéo et de nouvelles technologies.', 'Développeur Full-Stack', '1995-01-25', 'United States', 'Paris', 'Bastille', '["gaming", "technology", "movie"]', false, '["/init/shanley.jpeg", "/init/shanley.jpeg", "/init/shanley.jpeg", "/init/shanley.jpeg"]', 'business'),
    ('Nissou', 'anissa@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN9V3UF9T3HJGQZsuHhJi', 'Anissa', 'female', 'male', 'Danseuse professionnelle. La musique est ma vie, la danse est ma passion.', 'Danseuse', '1992-09-08', 'Morocco', 'Paris', 'Champs-Élysées', '["dancing_singing", "music", "fashion"]', false, '["/init/anissa.jpeg", "/init/anissa.jpeg", "/init/anissa.jpeg", "/init/anissa.jpeg"]', 'fling'),
    ('Medhi les zouzou', 'mehdi@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN9V3UF9T3HJGQZsuHhJi', 'Mehdi', 'male', 'female', 'Architecte passionné par le design et l''art moderne. Amateur de photographie urbaine.', 'Architecte', '1989-04-17', 'France', 'Paris', 'Montparnasse', '["architecture", "photography", "art"]', false, '["/init/mehdi.jpeg", "/init/mehdi.jpeg", "/init/mehdi.jpeg", "/init/mehdi.jpeg"]', 'business'),
    ('Caroleplay', 'carol@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN9V3UF9T3HJGQZsuHhJi', 'Carol', 'female', 'male', 'Vétérinaire et amoureuse des animaux. Je voyage dès que possible pour découvrir la faune mondiale.', 'Vétérinaire', '1993-12-05', 'United Kingdom', 'Paris', 'Champs-Élysées', '["animals", "nature_plant", "travel_places"]', false, '["/init/carol.jpeg", "/init/carol.jpeg", "/init/carol.jpeg", "/init/carol.jpeg"]', 'love'),
    ('Nini', 'annie@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN9V3UF9T3HJGQZsuHhJi', 'Annie', 'female', 'male', 'Professeure de langues, polyglotte. J''adore découvrir de nouvelles cultures et voyager.', 'Professeure', '1990-10-14', 'Canada', 'Paris', 'Pigalle', '["language", "travel_places", "people_society"]', false, '["/init/annie.jpeg", "/init/annie.jpeg", "/init/annie.jpeg", "/init/annie.jpeg"]', 'friends');

INSERT INTO users (username, email, password, firstname, gender, looking_for, bio, job, birthdate, country, town, neighbourhood, interests, is_first_login, is_email_verified, photos, match_type) VALUES
    ('Admin', 'admin@admin.fr', 'scrypt:32768:8:1$S7D1jwJTSrom60Gb$5473cca544a5ab067c548a52c25fbf161e72815bf036389cb786933b8d0e0099f92d19abcfa230ac09b33e53e97d5543b49968fd0f762e3c6c534500a71a06a7', 'Admin', 'male', 'other', 'ADMIN, polyglotte. J''adore admin et admin.', 'Admin', '1990-10-14', 'France', 'Paris', 'CLichy', '["language", "travel_places", "people_society"]', false, true, '["/init/admin.png"]', 'friends');

CREATE TABLE IF NOT EXISTS user_interactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    target_user_id INT NOT NULL,
    interaction_type ENUM('like', 'dislike') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY (user_id, target_user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user1_id INT NOT NULL,
    user2_id INT NOT NULL,
    l_user_id INT GENERATED ALWAYS AS (LEAST(user1_id, user2_id)) STORED,
    g_user_id INT GENERATED ALWAYS AS (GREATEST(user1_id, user2_id)) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_conv (l_user_id, g_user_id),
    FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    sender_id INT NOT NULL,
    content TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

