const { Pool } = require('pg');
require('dotenv').config();

// Créer un pool de connexions PostgreSQL
// Supabase fournit une URL de connexion complète (DATABASE_URL)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Tester la connexion (optionnel, lors du démarrage)
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Erreur de connexion à la base de données PostgreSQL:', err.message);
    } else {
        console.log('✅ Connecté à la base de données PostgreSQL (Supabase)');
    }
});

module.exports = pool;
