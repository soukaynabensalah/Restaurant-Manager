const express = require('express');
const router = express.Router();

/**
 * @route POST /api/chat
 * @desc Envoyer un message au chatbot n8n
 * @access Public
 */
router.post('/', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Le message est requis'
            });
        }

        // URL du webhook n8n
        const WORKFLOW_URL = 'https://n8n.zackdev.io/webhook/446b7488-3de7-42f9-b084-e98ddf13223a';

        const response = await fetch(WORKFLOW_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message })
        });

        if (!response.ok) {
            throw new Error(`Erreur n8n: ${response.statusText}`);
        }

        const data = await response.json();

        res.json(data);

    } catch (error) {
        console.error('Erreur Chatbot:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la communication avec le chatbot',
            error: error.message
        });
    }
});

module.exports = router;
