const mysql = require('mysql2');
require('dotenv').config();

// Créer un pool de connexions pour de meilleures performances
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'restaurants',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Utiliser les promesses pour une syntaxe async/await
const promisePool = pool.promise();

// Tester la connexion
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Erreur de connexion à la base de données:', err.message);
        return;
    }
    console.log('✅ Connecté à la base de données MySQL');
    connection.release();
});

module.exports = promisePool;
