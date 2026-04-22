const { Pool } = require('pg');
require('dotenv').config();

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      options: '-c client_encoding=UTF8',
    });

pool.connect()
  .then(() => console.log('Connecté à PostgreSQL ✅'))
  .catch(err => console.error('Erreur connexion PostgreSQL ❌', err));

module.exports = pool;