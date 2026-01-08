const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const app = express();
const errorHandler = require('./middleware/errorHandler');

// Import des routes
const authRoutes = require('./routes/auth');
const restaurantRoutes = require('./routes/restaurants');
const favoriteRoutes = require('./routes/favorites');
const scrapingRoutes = require('./routes/scraping');
const chatRoutes = require('./routes/chat');


const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Route de test
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API Restaurant Management - Serveur actif',
        version: '1.0.0'
    });
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/scraping', scrapingRoutes);
app.use('/api/chat', chatRoutes);

// Route 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route non trouvée'
    });
});

// Middleware de gestion d'erreurs (doit être en dernier)
app.use(errorHandler);

// Démarrer le serveur localement
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Serveur démarré sur le port ${PORT}`);
        console.log(`📍 URL: http://localhost:${PORT}`);
        console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
    });
}

// Export pour Vercel
module.exports = app;
