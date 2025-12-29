const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { isAuthenticated } = require('../middleware/auth');

// Toutes les routes nécessitent une authentification
router.use(isAuthenticated);

// Ajouter un restaurant aux favoris
router.post('/:itemId', async (req, res, next) => {
    try {
        const { itemId } = req.params;
        const userId = req.user.id;

        // Vérifier si le restaurant existe
        const [restaurants] = await db.query(
            'SELECT id FROM restaurants WHERE id = ?',
            [itemId]
        );

        if (restaurants.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant non trouvé'
            });
        }

        // Ajouter aux favoris (la contrainte UNIQUE empêche les doublons)
        try {
            await db.query(
                'INSERT INTO favorites (user_id, restaurant_id) VALUES (?, ?)',
                [userId, itemId]
            );

            res.status(201).json({
                success: true,
                message: 'Restaurant ajouté aux favoris'
            });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    success: false,
                    message: 'Ce restaurant est déjà dans vos favoris'
                });
            }
            throw error;
        }
    } catch (error) {
        next(error);
    }
});

// Retirer un restaurant des favoris
router.delete('/:itemId', async (req, res, next) => {
    try {
        const { itemId } = req.params;
        const userId = req.user.id;

        const [result] = await db.query(
            'DELETE FROM favorites WHERE user_id = ? AND restaurant_id = ?',
            [userId, itemId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Ce restaurant n\'est pas dans vos favoris'
            });
        }

        res.json({
            success: true,
            message: 'Restaurant retiré des favoris'
        });
    } catch (error) {
        next(error);
    }
});

// Obtenir tous mes favoris
router.get('/my-favorites', async (req, res, next) => {
    try {
        const userId = req.user.id;

        const [favorites] = await db.query(
            `SELECT r.*, u.username as creator_name, f.created_at as favorited_at
       FROM favorites f
       JOIN restaurants r ON f.restaurant_id = r.id
       JOIN users u ON r.user_id = u.id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
            [userId]
        );

        res.json({
            success: true,
            data: favorites
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
