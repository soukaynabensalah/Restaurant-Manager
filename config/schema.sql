-- Créer la base de données (Note: sur Supabase, la DB est déjà créée, ces commandes sont pour la structure)

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des restaurants
CREATE TABLE IF NOT EXISTS restaurants (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(200) NOT NULL,
  cuisine VARCHAR(50) NOT NULL CHECK (cuisine IN ('marocaine', 'italienne', 'asiatique')),
  address VARCHAR(255) NOT NULL,
  average_price DECIMAL(10, 2),
  rating DECIMAL(3, 2) DEFAULT 0.00,
  status VARCHAR(20) DEFAULT 'prospect' CHECK (status IN ('partenaire', 'prospect', 'inactif')),
  image VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index pour restaurants
CREATE INDEX IF NOT EXISTS idx_cuisine ON restaurants(cuisine);
CREATE INDEX IF NOT EXISTS idx_status ON restaurants(status);
CREATE INDEX IF NOT EXISTS idx_user ON restaurants(user_id);

-- Table des favoris
CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  restaurant_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  UNIQUE (user_id, restaurant_id)
);

-- Table des logs de scraping
CREATE TABLE IF NOT EXISTS scraping_logs (
  id SERIAL PRIMARY KEY,
  user_id INT,
  city VARCHAR(100),
  keyword VARCHAR(100),
  status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed')),
  items_scraped INT DEFAULT 0,
  sheet_url VARCHAR(500),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
