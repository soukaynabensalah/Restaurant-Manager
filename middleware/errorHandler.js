// Middleware de gestion d'erreurs centralisé
const errorHandler = (err, req, res, next) => {
    console.error('❌ Erreur:', err);

    // Erreur de validation
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Erreur de validation',
            errors: err.errors
        });
    }

    // Erreur de base de données
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
            success: false,
            message: 'Cette entrée existe déjà'
        });
    }

    // Erreur par défaut
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Erreur serveur interne',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;
