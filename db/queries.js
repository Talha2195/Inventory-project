const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

async function getAllItems() {
    const { rows } = await pool.query('SELECT * FROM inventory');
    return rows;
}

module.exports = {
    getAllItems,
};