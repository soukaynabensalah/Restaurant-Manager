const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Inscription
router.post('/register', async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // Validation simple
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Tous les champs sont requis'
            });
        }

        // Vérifier si l'email existe déjà
        const [existingUsers] = await db.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Cet email est déjà utilisé'
            });
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer l'utilisateur
        const [result] = await db.query(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );

        res.status(201).json({
            success: true,
            message: 'Inscription réussie',
            user: {
                id: result.insertId,
                username,
                email
            }
        });
    } catch (error) {
        next(error);
    }
});

// Connexion
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email et mot de passe requis'
            });
        }

        // Trouver l'utilisateur
        const [users] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect'
            });
        }

        const user = users[0];

        // Vérifier le mot de passe
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect'
            });
        }

        // Générer le token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({
            success: true,
            message: 'Connexion réussie',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        next(error);
    }
});

// Obtenir le profil de l'utilisateur connecté
router.get('/me', async (req, res, next) => {
    try {
        // Vérifier le token
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Non authentifié'
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Récupérer les infos de l'utilisateur
        const [users] = await db.query(
            'SELECT id, username, email, created_at FROM users WHERE id = ?',
            [decoded.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        res.json({
            success: true,
            user: users[0]
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
