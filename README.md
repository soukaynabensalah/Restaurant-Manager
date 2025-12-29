# Restaurant Management Backend

Backend API pour un système de gestion de restaurants avec authentification JWT, système de favoris et intégration n8n pour le scraping.

## 🚀 Technologies

- **Node.js** & **Express** - Serveur web
- **MySQL** - Base de données
- **JWT** - Authentification
- **bcrypt** - Hashage des mots de passe
- **n8n** - Workflow automation pour scraping

## 📁 Structure du Projet

```
Restaurant_Management_Scraping/
├── config/
│   ├── database.js      # Configuration MySQL
│   └── schema.sql       # Schéma de la base de données
├── middleware/
│   ├── auth.js          # Middleware JWT
│   └── errorHandler.js  # Gestion d'erreurs
├── routes/
│   ├── auth.js          # Routes d'authentification
│   ├── restaurants.js   # Routes restaurants (CRUD)
│   ├── favorites.js     # Routes favoris
│   └── scraping.js      # Routes scraping n8n
├── app.js               # Point d'entrée
├── package.json
├── .env.example
└── README.md
```

## ⚙️ Installation

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer l'environnement

Créer un fichier `.env` à la racine du projet :

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=restaurant_management

JWT_SECRET=votre_secret_jwt_tres_securise
JWT_EXPIRES_IN=7d

N8N_WEBHOOK_URL=https://your-n8n.app/webhook/scraping
```

### 3. Créer la base de données

Exécuter le fichier SQL pour créer les tables :

```bash
mysql -u root -p < config/schema.sql
```

## 🏃 Démarrage

### Mode développement (avec nodemon)

```bash
npm run dev
```

### Mode production

```bash
npm start
```

Le serveur démarre sur `http://localhost:5000`

## 📡 API Endpoints

### Authentification

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/auth/register` | Inscription | Non |
| POST | `/api/auth/login` | Connexion | Non |
| GET | `/api/auth/me` | Profil utilisateur | Oui |

**Body pour register :**
```json
{
  "username": "John Doe",
  "email": "john@example.com",
  "password": "motdepasse123"
}
```

### Restaurants (Items)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/restaurants` | Liste avec pagination/filtres | Non |
| GET | `/api/restaurants/:id` | Détails d'un restaurant | Non |
| POST | `/api/restaurants` | Créer un restaurant | Oui |
| PUT | `/api/restaurants/:id` | Modifier (créateur seulement) | Oui |
| DELETE | `/api/restaurants/:id` | Supprimer (créateur seulement) | Oui |

**Query params pour GET /api/restaurants :**
- `page` : Numéro de page (défaut: 1)
- `limit` : Items par page (défaut: 6)
- `search` : Recherche par nom/adresse
- `cuisine` : Filtrer par cuisine (marocaine/italienne/asiatique)
- `status` : Filtrer par statut (partenaire/prospect/inactif)

**Body pour POST /api/restaurants :**
```json
{
  "name": "Restaurant Le Marrakech",
  "cuisine": "marocaine",
  "address": "123 Rue de la Kasbah",
  "average_price": 150.00,
  "rating": 4.5,
  "status": "partenaire",
  "image": "https://example.com/image.jpg"
}
```

### Favoris

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/favorites/:itemId` | Ajouter aux favoris | Oui |
| DELETE | `/api/favorites/:itemId` | Retirer des favoris | Oui |
| GET | `/api/favorites/my-favorites` | Mes favoris | Oui |

### Scraping (n8n Integration)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/scraping/trigger` | Déclencher scraping | Oui |

**Body pour POST /api/scraping/trigger :**
```json
{
  "city": "Marrakech",
  "keyword": "restaurant marocain"
}
```

## 🔐 Authentification

L'API utilise JWT (JSON Web Tokens). Pour les routes protégées, inclure le token dans le header :

```
Authorization: Bearer votre_token_jwt
```

### Exemple avec curl

```bash
# Inscription
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"John Doe","email":"john@example.com","password":"motdepasse123"}'

# Connexion
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"motdepasse123"}'

# Créer un restaurant (avec token)
curl -X POST http://localhost:5000/api/restaurants \
  -H "Authorization: Bearer votre_token" \
  -H "Content-Type: application/json" \
  -d '{"name":"Le Marrakech","cuisine":"marocaine","address":"123 Rue"}'

# Ajouter aux favoris
curl -X POST http://localhost:5000/api/favorites/1 \
  -H "Authorization: Bearer votre_token"
```

## 📊 Base de Données

### Tables

- **users** - Utilisateurs (id, username, email, password)
- **restaurants** - Restaurants (id, user_id, name, cuisine, address, average_price, rating, status, image)
- **favorites** - Favoris (id, user_id, restaurant_id) avec contrainte UNIQUE
- **scraping_logs** - Logs de scraping (id, user_id, city, keyword, status, items_scraped, sheet_url)

### Attributs Restaurants

- **cuisine** : ENUM('marocaine', 'italienne', 'asiatique')
- **status** : ENUM('partenaire', 'prospect', 'inactif')
- **rating** : DECIMAL(3, 2) - Note de 0 à 5
- **average_price** : DECIMAL(10, 2) - Prix moyen

## 🛠️ Fonctionnalités Clés

### Pagination
- 6 restaurants par page par défaut
- Paramètres `page` et `limit` configurables

### Recherche & Filtres
- Recherche par nom ou adresse
- Filtre par type de cuisine
- Filtre par statut

### Ownership
- Seul le créateur d'un restaurant peut le modifier ou le supprimer
- Validation automatique via JWT

### Favoris
- Contrainte UNIQUE empêche les doublons
- Liste complète des favoris avec détails

### Scraping n8n
- Intégration webhook n8n
- Logs automatiques des opérations
- Export vers Google Sheets

## 🔜 Prochaines étapes

- Créer le frontend (HTML/CSS/JS)
- Configurer le workflow n8n
- Déployer sur Vercel
- Connecter à Supabase (PostgreSQL)
- Ajouter upload d'images
- Créer les diagrammes UML

## 📝 Notes

- Mots de passe hashés avec bcrypt (10 rounds)
- Tokens JWT expirent après 7 jours
- CORS activé pour requêtes cross-origin
- Validation des enums (cuisine, status)
- Gestion d'erreurs centralisée
