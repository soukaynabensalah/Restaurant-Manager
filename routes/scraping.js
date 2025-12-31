const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { isAuthenticated } = require('../middleware/auth');

// Toutes les routes nécessitent une authentification
router.use(isAuthenticated);

// Déclencher le workflow n8n pour scraping
router.post('/trigger', async (req, res, next) => {
    try {
        const { city, keyword } = req.body;
        const userId = req.user.id;

        // Validation
        if (!city || !keyword) {
            return res.status(400).json({
                success: false,
                message: 'Ville et mot-clé sont requis'
            });
        }

        // Récupérer l'email de l'utilisateur
        const [users] = await db.query(
            'SELECT email FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        const userEmail = users[0].email;

        // Appeler le webhook n8n
        const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

        if (!n8nWebhookUrl) {
            return res.status(500).json({
                success: false,
                message: 'URL du webhook n8n non configurée'
            });
        }

        try {
            console.log('Calling n8n Webhook:', n8nWebhookUrl);
            const response = await fetch(n8nWebhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    city,
                    keyword,
                    userEmail
                })
            });

            console.log('n8n Response Status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('n8n Error Response:', errorText);
                throw new Error(`n8n Webhook failed with status ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            console.log('n8n Parsed Response:', result);

            // Logger le scraping
            await db.query(
                'INSERT INTO scraping_logs (user_id, city, keyword, status, items_scraped, sheet_url) VALUES (?, ?, ?, ?, ?, ?)',
                [userId, city, keyword, 'success', result.itemsScraped || 0, result.sheetUrl || null]
            );

            res.json({
                success: true,
                message: 'Scraping lancé avec succès',
                sheetUrl: result.sheetUrl
            });
        } catch (error) {
            // Logger l'erreur
            await db.query(
                'INSERT INTO scraping_logs (user_id, city, keyword, status, error_message) VALUES (?, ?, ?, ?, ?)',
                [userId, city, keyword, 'failed', error.message]
            );

            throw error;
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;
