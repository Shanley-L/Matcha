CREATE DATABASE IF NOT EXISTS matcha;
USE matcha;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    gender ENUM('male', 'female', 'non-binary', 'other') DEFAULT 'other',
    sexual_orientation ENUM('heterosexual', 'homosexual', 'bisexual', 'other') DEFAULT 'other',
    looking_for ENUM('friends', 'lovers', 'ons', 'i-dont-know', 'gaming friends') DEFAULT 'i-dont-know',
    activ BOOLEAN,
    height INT,
    bio TEXT,
    birthdate DATE,
    age INT,
    profile_picture VARCHAR(255),
    interests TEXT,
    is_email_verified BOOLEAN DEFAULT FALSE,
    city TEXT,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


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
