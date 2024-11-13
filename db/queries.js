const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function getAllItems() {
    const { rows } = await pool.query('SELECT * FROM games');
    return rows;
}

module.exports = {
    getAllItems,
};