const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function getAllItems() {
    const query = `
        SELECT 
            games.id, 
            games.name, 
            games.description, 
            developers.name AS developer_name,
            genres.name AS genre_name
        FROM games
        LEFT JOIN developers ON games.developer_id = developers.id
        LEFT JOIN genres ON games.genre_id = genres.id  -- Directly join genres via genre_id
        ORDER BY games.name;
    `;

    const { rows } = await pool.query(query);
    return rows;
}


module.exports = {
    getAllItems,
};
