-- Créer la base de données
CREATE DATABASE IF NOT EXISTS restaurants;
USE restaurants;

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des restaurants (items selon le cahier des charges)
CREATE TABLE IF NOT EXISTS restaurants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(200) NOT NULL,
  cuisine ENUM('marocaine', 'italienne', 'asiatique') NOT NULL,
  address VARCHAR(255) NOT NULL,
  average_price DECIMAL(10, 2),
  rating DECIMAL(3, 2) DEFAULT 0.00,
  status ENUM('partenaire', 'prospect', 'inactif') DEFAULT 'prospect',
  image VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_cuisine (cuisine),
  INDEX idx_status (status),
  INDEX idx_user (user_id)
);

-- Table des favoris
CREATE TABLE IF NOT EXISTS favorites (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  restaurant_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  UNIQUE KEY unique_favorite (user_id, restaurant_id)
);

-- Table des logs de scraping
CREATE TABLE IF NOT EXISTS scraping_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  city VARCHAR(100),
  keyword VARCHAR(100),
  status ENUM('success', 'failed') NOT NULL,
  items_scraped INT DEFAULT 0,
  sheet_url VARCHAR(500),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
