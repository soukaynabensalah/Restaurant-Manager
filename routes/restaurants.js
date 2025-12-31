const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { isAuthenticated } = require('../middleware/auth');

// Obtenir tous les restaurants avec pagination, recherche et filtres
router.get('/', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const cuisine = req.query.cuisine || '';
        const status = req.query.status || '';

        // Construire la requête avec filtres
        let query = 'SELECT r.*, u.username as creator_name FROM restaurants r JOIN users u ON r.user_id = u.id WHERE 1=1';
        const params = [];
        let paramCount = 1;

        if (search) {
            query += ` AND (r.name ILIKE $${paramCount++} OR r.address ILIKE $${paramCount++})`;
            params.push(`%${search}%`, `%${search}%`);
        }

        if (cuisine) {
            query += ` AND r.cuisine = $${paramCount++}`;
            params.push(cuisine);
        }

        if (status) {
            query += ` AND r.status = $${paramCount++}`;
            params.push(status);
        }

        // Compter le total
        const countQuery = query.replace('SELECT r.*, u.username as creator_name', 'SELECT COUNT(*) as total');
        const { rows: countResult } = await db.query(countQuery, params);
        const total = parseInt(countResult[0].total); // Postgres returns count as string (bigint) usually

        // Ajouter pagination
        query += ` ORDER BY r.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
        params.push(limit, offset);

        const { rows: restaurants } = await db.query(query, params);

        res.json({
            success: true,
            data: restaurants,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
});

// Obtenir un restaurant par ID
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        const { rows: restaurants } = await db.query(
            'SELECT r.*, u.username as creator_name FROM restaurants r JOIN users u ON r.user_id = u.id WHERE r.id = $1',
            [id]
        );

        if (restaurants.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant non trouvé'
            });
        }

        res.json({
            success: true,
            data: restaurants[0]
        });
    } catch (error) {
        next(error);
    }
});

// Créer un restaurant (protégé par authentification)
router.post('/', isAuthenticated, async (req, res, next) => {
    try {
        const { name, cuisine, address, average_price, rating, status, image } = req.body;
        const userId = req.user.id;

        // Validation
        if (!name || !cuisine || !address) {
            return res.status(400).json({
                success: false,
                message: 'Nom, cuisine et adresse sont requis'
            });
        }

        // Valider la cuisine
        const validCuisines = ['marocaine', 'italienne', 'asiatique'];
        if (!validCuisines.includes(cuisine)) {
            return res.status(400).json({
                success: false,
                message: 'Cuisine invalide. Choisissez parmi: marocaine, italienne, asiatique'
            });
        }

        // Valider le statut si fourni
        if (status) {
            const validStatuses = ['partenaire', 'prospect', 'inactif'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Statut invalide. Choisissez parmi: partenaire, prospect, inactif'
                });
            }
        }

        const { rows } = await db.query(
            'INSERT INTO restaurants (user_id, name, cuisine, address, average_price, rating, status, image) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
            [userId, name, cuisine, address, average_price || null, rating || 0, status || 'prospect', image || null]
        );
        const result = { insertId: rows[0].id };

        res.status(201).json({
            success: true,
            message: 'Restaurant créé avec succès',
            data: {
                id: result.insertId,
                user_id: userId,
                name,
                cuisine,
                address,
                average_price,
                rating: rating || 0,
                status: status || 'prospect',
                image
            }
        });
    } catch (error) {
        next(error);
    }
});

// Modifier un restaurant (seulement le créateur)
router.put('/:id', isAuthenticated, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, cuisine, address, average_price, rating, status, image } = req.body;
        const userId = req.user.id;

        // Vérifier si le restaurant existe et appartient à l'utilisateur
        const { rows: existing } = await db.query(
            'SELECT user_id FROM restaurants WHERE id = $1',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant non trouvé'
            });
        }

        if (existing[0].user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Vous ne pouvez modifier que vos propres restaurants'
            });
        }

        // Valider la cuisine si fournie
        if (cuisine) {
            const validCuisines = ['marocaine', 'italienne', 'asiatique'];
            if (!validCuisines.includes(cuisine)) {
                return res.status(400).json({
                    success: false,
                    message: 'Cuisine invalide'
                });
            }
        }

        // Valider le statut si fourni
        if (status) {
            const validStatuses = ['partenaire', 'prospect', 'inactif'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Statut invalide'
                });
            }
        }

        await db.query(
            'UPDATE restaurants SET name = $1, cuisine = $2, address = $3, average_price = $4, rating = $5, status = $6, image = $7 WHERE id = $8',
            [name, cuisine, address, average_price, rating, status, image, id]
        );

        res.json({
            success: true,
            message: 'Restaurant modifié avec succès'
        });
    } catch (error) {
        next(error);
    }
});

// Supprimer un restaurant (seulement le créateur)
router.delete('/:id', isAuthenticated, async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Vérifier si le restaurant existe et appartient à l'utilisateur
        const [existing] = await db.query(
            'SELECT user_id FROM restaurants WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant non trouvé'
            });
        }

        if (existing[0].user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Vous ne pouvez supprimer que vos propres restaurants'
            });
        }

        await db.query('DELETE FROM restaurants WHERE id = $1', [id]);

        res.json({
            success: true,
            message: 'Restaurant supprimé avec succès'
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
