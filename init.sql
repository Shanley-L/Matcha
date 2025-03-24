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
    city VARCHAR(100),
    suburb VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(10, 8),
    interests JSON,
    is_first_login BOOLEAN DEFAULT TRUE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_fake_account JSON,
    is_blocked_by JSON,
    is_connected BOOLEAN DEFAULT FALSE,
    latest_connection TIMESTAMP,
    photos JSON,
    viewers JSON,
    match_score INT DEFAULT 0,
    match_type ENUM('love', 'friends', 'fling', 'business'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO users (username, email, password, firstname, gender, looking_for, bio, job, birthdate, country, city, suburb, interests, is_first_login, photos, match_type, is_connected, latest_connection) VALUES
    ('Sebou', 'sebastien@example.com', 'hashed_password', 'Sebastien', 'male', 'female', 'Passionné de photographie et de voyages.', 'Photographe', '1990-05-15', 'France', 'Paris', 'Montmartre', '["photography", "travel_places", "food_drink"]', false, '["/init/sebastien.jpeg", "/init/sebastien.jpeg", "/init/sebastien.jpeg", "/init/sebastien.jpeg"]', 'love', true, NULL),
    ('Lisou', 'elise@example.com', 'hashed_password', 'Elise', 'female', 'male', 'Artiste peintre passionnée.', 'Artiste Peintre', '1993-08-22', 'France', 'Paris', 'Le Marais', '["art", "painting", "nature_plant"]', false, '["/init/elise.jpeg", "/init/elise.jpeg", "/init/elise.jpeg", "/init/elise.jpeg"]', 'friends', false, '2025-03-13 04:36:20'),
    ('Sarouche', 'sarah@example.com', 'hashed_password', 'Sarah', 'female', 'male', 'Yoga instructor.', 'Professeur de Yoga', '1991-03-12', 'United States', 'Paris', 'Saint-Germain-des-Prés', '["gym_fitness", "nature_plant", "people_society"]', false, '["/init/sarah.jpeg", "/init/sarah.jpeg", "/init/sarah.jpeg", "/init/sarah.jpeg"]', 'love', true, NULL),
    ('Aux fraises', 'charlotte@example.com', 'hashed_password', 'Charlotte', 'female', 'male', 'Passionnée de littérature.', 'Libraire', '1994-11-30', 'France', 'Paris', 'Quartier Latin', '["book_novel", "writing", "art"]', false, '["/init/charlotte.jpeg", "/init/charlotte.jpeg", "/init/charlotte.jpeg", "/init/charlotte.jpeg"]', 'friends', true, NULL),
    ('Le F', 'francois@example.com', 'hashed_password', 'Francois', 'male', 'female', 'Chef cuisinier voyageur.', 'Chef Cuisinier', '1988-07-19', 'France', 'Paris', 'Belleville', '["food_drink", "travel_places", "photography"]', false, '["/init/francois.jpeg", "/init/francois.jpeg", "/init/francois.jpeg", "/init/francois.jpeg"]', 'love', true, NULL),
    ('Sangochan', 'shanley@example.com', 'hashed_password', 'Shanley', 'male', 'female', 'Développeur geek.', 'Développeur Full-Stack', '1995-01-25', 'United States', 'Paris', 'Bastille', '["gaming", "technology", "movie"]', false, '["/init/shanley.jpeg", "/init/shanley.jpeg", "/init/shanley.jpeg", "/init/shanley.jpeg"]', 'business', true, NULL),
    ('Nissou', 'anissa@example.com', 'hashed_password', 'Anissa', 'female', 'male', 'Danseuse passionnée.', 'Danseuse', '1992-09-08', 'Morocco', 'Paris', 'Champs-Élysées', '["dancing_singing", "music", "fashion"]', false, '["/init/anissa.jpeg", "/init/anissa.jpeg", "/init/anissa.jpeg", "/init/anissa.jpeg"]', 'fling', false, '2025-03-09 08:38:20'),
    ('Medhi les zouzou', 'mehdi@example.com', 'hashed_password', 'Mehdi', 'male', 'female', 'Architecte et amateur de photographie urbaine.', 'Architecte', '1989-04-17', 'France', 'Marseille', 'Montparnasse', '["architecture", "photography", "art"]', false, '["/init/mehdi.jpeg", "/init/mehdi.jpeg", "/init/mehdi.jpeg", "/init/mehdi.jpeg"]', 'business', true, NULL),
    ('Caroleplay', 'carol@example.com', 'hashed_password', 'Carol', 'female', 'male', 'Vétérinaire voyageuse.', 'Vétérinaire', '1993-12-05', 'United Kingdom', 'Paris', 'Champs-Élysées', '["animals", "nature_plant", "travel_places"]', false, '["/init/carol.jpeg", "/init/carol.jpeg", "/init/carol.jpeg", "/init/carol.jpeg"]', 'love', false, '2025-03-01 19:58:20'),
    ('Nini', 'annie@example.com', 'hashed_password', 'Annie', 'female', 'male', 'Professeure polyglotte.', 'Professeure', '1990-10-14', 'Canada', 'Paris', 'Pigalle', '["language", "travel_places", "people_society"]', false, '["/init/annie.jpeg", "/init/annie.jpeg", "/init/annie.jpeg", "/init/annie.jpeg"]', 'friends', false, '2025-02-19 23:14:20');

INSERT INTO users (username, email, password, firstname, gender, looking_for, bio, job, birthdate, country, city, suburb, interests, is_first_login, is_email_verified, photos, match_type) VALUES
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

