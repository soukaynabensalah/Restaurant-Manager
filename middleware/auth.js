const jwt = require('jsonwebtoken');

// Middleware pour vérifier l'authentification JWT
const isAuthenticated = (req, res, next) => {
    try {
        // Récupérer le token du header Authorization
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Accès non autorisé. Token manquant.'
            });
        }

        // Extraire le token
        const token = authHeader.split(' ')[1];

        // Vérifier et décoder le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Ajouter les informations de l'utilisateur à la requête
        req.user = {
            id: decoded.id,
            email: decoded.email
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token invalide.'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expiré.'
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Erreur serveur.'
        });
    }
};

module.exports = { isAuthenticated };
