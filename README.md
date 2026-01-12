# Restaurant Management System

Full-stack restaurant management platform with JWT authentication, favorites system, n8n-powered web scraping, and AI chatbot assistant. Features a modern, responsive frontend with PWA capabilities.

## 🚀 Technologies

### Backend
- **Node.js** & **Express** - Web server
- **MySQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **n8n** - Workflow automation for scraping & chatbot

### Frontend
- **HTML5** & **Vanilla JavaScript** - Modern web standards
- **CSS3** - Glassmorphism design with responsive layout
- **Font Awesome** - Icon library
- **Google Fonts** - Inter typography
- **PWA** - Progressive Web App support
- **PostHog** - Analytics integration

## 📁 Structure du Projet

```
Restaurant_Management_Scraping/
├── config/
│   ├── database.js      # MySQL configuration
│   └── schema.sql       # Database schema
├── middleware/
│   ├── auth.js          # JWT middleware
│   └── errorHandler.js  # Error handling
├── routes/
│   ├── auth.js          # Authentication routes
│   ├── restaurants.js   # Restaurant CRUD routes
│   ├── favorites.js     # Favorites routes
│   ├── scraping.js      # n8n scraping routes
│   └── chat.js          # AI chatbot routes
├── public/
│   ├── index.html       # Landing page (Home/About/Contact)
│   ├── dashboard.html   # Restaurant management dashboard
│   ├── scraping.html    # Web scraping interface
│   ├── login.html       # Authentication page
│   ├── about.html       # About page
│   ├── contact.html     # Contact page
│   ├── css/
│   │   └── style.css    # Main stylesheet (glassmorphism design)
│   ├── js/
│   │   ├── navbar.js    # Dynamic navbar with hamburger menu
│   │   ├── chatbot.js   # AI chatbot integration
│   │   ├── dashboard.js # Dashboard functionality
│   │   ├── scraping.js  # Scraping interface logic
│   │   ├── auth.js      # Authentication logic
│   │   └── utils.js     # Utility functions
│   ├── chatbot.css      # Chatbot styling
│   ├── manifest.json    # PWA manifest
│   └── service-worker.js # PWA service worker
├── workflows/
│   └── Chatbot Agent restaurant managment.json # n8n chatbot workflow
├── app.js               # Entry point
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

| Method | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/scraping/trigger` | Trigger web scraping | Yes |

**Body for POST /api/scraping/trigger:**
```json
{
  "city": "Marrakech",
  "keyword": "restaurant marocain"
}
```

### AI Chatbot

| Method | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/chatbot` | Send message to AI chatbot | No |

**Body for POST /api/chatbot:**
```json
{
  "message": "What are the best restaurants in my favorites?"
}
```

**Response:**
```json
{
  "success": true,
  "response": "Based on your favorites, here are the top-rated restaurants..."
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

## 🛠️ Key Features

### Backend Features

#### Pagination
- 6 restaurants per page by default
- Configurable `page` and `limit` parameters

#### Search & Filters
- Search by name or address
- Filter by cuisine type
- Filter by status

#### Ownership
- Only the creator can modify or delete their restaurants
- Automatic validation via JWT

#### Favorites System
- UNIQUE constraint prevents duplicates
- Complete favorites list with details
- One-click add/remove functionality

#### n8n Web Scraping
- Webhook integration with n8n
- Automatic operation logging
- Export to Google Sheets
- Real-time scraping status updates

#### AI Chatbot Assistant
- Powered by n8n workflow automation
- Natural language understanding
- Restaurant data queries
- Context-aware responses
- Integration with Groq LLM

### Frontend Features

#### Modern Responsive Design
- **Glassmorphism UI** - Premium glass-effect design
- **Fully Responsive** - Mobile-first approach
- **Hamburger Menu** - Collapsible navigation on mobile
- **Dark Theme** - Eye-friendly color scheme
- **Smooth Animations** - Micro-interactions for better UX

#### Progressive Web App (PWA)
- **Installable** - Add to home screen
- **Service Worker** - Offline capabilities
- **Manifest** - App-like experience
- **Fast Loading** - Optimized performance

#### Interactive Chatbot Widget
- **Floating Button** - Always accessible
- **Real-time Chat** - Instant responses
- **Modern UI** - Material Design icons
- **Collapsible** - Minimizes when not in use

#### Dynamic Pages
- **Landing Page** - Hero section with features showcase
- **Dashboard** - Restaurant management interface
- **Scraping Center** - Automated restaurant discovery
- **About & Contact** - Company information
- **Authentication** - Secure login/register

#### Analytics Integration
- **PostHog** - User behavior tracking
- **Event Tracking** - User interaction analytics
- **Session Replay** - Debug user issues


## 🎨 Frontend Pages

### Landing Page (`index.html`)
- Hero section with call-to-action
- Key features showcase
- About section
- Contact form
- AI chatbot widget
- Footer with social links

### Dashboard (`dashboard.html`)
- Restaurant grid with cards
- Add new restaurant form
- Edit/Delete functionality
- Favorites toggle
- Search and filter options
- Pagination controls

### Scraping Center (`scraping.html`)
- City and keyword input
- Trigger scraping workflow
- Real-time status updates
- Results display in cards
- Google Sheets export link

### Authentication (`login.html`)
- Login/Register toggle
- JWT token management
- Form validation
- Secure password handling

## 🤖 AI Chatbot

The chatbot is powered by n8n workflow automation and provides:
- **Natural Language Processing** - Understands user queries
- **Restaurant Queries** - Search and filter restaurants
- **Favorites Management** - Add/remove favorites via chat
- **Context Awareness** - Remembers conversation history
- **Groq LLM Integration** - Fast and accurate responses

### Chatbot Workflow
1. User sends message via chat widget
2. Frontend sends POST request to `/api/chatbot`
3. Backend proxies request to n8n webhook
4. n8n processes with AI Agent (Groq)
5. Response returned to user in real-time

## � Progressive Web App (PWA)

### Features
- **Installable** - Works like a native app
- **Offline Support** - Service worker caching
- **App Manifest** - Custom icon and theme
- **Fast Loading** - Optimized assets

### Installation
Users can install the app by:
1. Visiting the website on mobile
2. Clicking "Add to Home Screen"
3. Launching from home screen like a native app

## 📊 Analytics

**PostHog Integration** provides:
- User behavior tracking
- Feature usage analytics
- Session recordings
- Event tracking
- Funnel analysis

## 📝 Technical Notes

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens expire after 7 days
- CORS enabled for cross-origin requests
- Enum validation (cuisine, status)
- Centralized error handling
- Responsive design with mobile-first approach
- Glassmorphism CSS design system
- n8n webhooks for automation

## 🚀 Deployment

### Vercel Deployment
The application is configured for Vercel deployment with `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "app.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "app.js"
    }
  ]
}
```

### Environment Variables
Ensure all environment variables are set in your deployment platform:
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `N8N_WEBHOOK_URL` (for scraping)
- n8n chatbot webhook URL (hardcoded in `routes/chat.js`)

## 🔗 n8n Workflows

### Scraping Workflow
- Triggers via webhook from frontend
- Uses SerpAPI for Google Maps scraping
- Exports results to Google Sheets
- Logs operations to database

### Chatbot Workflow
- AI Agent with Groq LLM
- Supabase tool for database queries
- Memory for conversation context
- Natural language understanding

## 📄 License

This project is private and proprietary.
