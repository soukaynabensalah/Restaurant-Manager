const express = require('express');
const router = express.Router();

// Route chatbot simple
router.post('/', async (req, res) => {
    try {
        const { message } = req.body;

        // Appeler le webhook n8n avec fetch
        const n8nResponse = await fetch('https://n8n.zackdev.io/webhook/446b7488-3de7-42f9-b084-e98ddf13223a', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message })
        });

        const data = await n8nResponse.json();

        res.json({
            success: true,
            response: data.response
        });

    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({
            success: false,
            error: 'Service indisponible'
        });
    }
});

module.exports = router;
