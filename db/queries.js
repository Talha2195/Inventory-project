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


async function searchForItem(name) {
    const query = `
        SELECT 
            games.id, 
            games.name AS name,  -- Ensure consistent naming
            games.description, 
            developers.name AS developer_name,
            genres.name AS genre_name  -- Include genre_name if needed
        FROM games
        LEFT JOIN developers ON games.developer_id = developers.id
        LEFT JOIN genres ON games.genre_id = genres.id
        WHERE 
            games.name ILIKE $1 OR
            developers.name ILIKE $1
        ORDER BY games.name;
    `;
    
    try {
        const { rows } = await pool.query(query, [`%${name}%`]);  
        return rows;
    } catch (err) {
        console.error("Error executing search query", err.stack);
        throw err;
    }
}

async function addGame(name, description, developerName, genreName) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const developerQuery = `
            SELECT id FROM developers WHERE name = $1;
        `;
        const developerRes = await client.query(developerQuery, [developerName]);
        let developerId;
        if (developerRes.rows.length > 0) {
            developerId = developerRes.rows[0].id;
        } else {
            const insertDeveloperQuery = `
                INSERT INTO developers (name) 
                VALUES ($1) 
                RETURNING id;
            `;
            const insertDeveloperRes = await client.query(insertDeveloperQuery, [developerName]);
            developerId = insertDeveloperRes.rows[0].id;
        }
        const genreQuery = `
            SELECT id FROM genres WHERE name = $1;
        `;
        const genreRes = await client.query(genreQuery, [genreName]);
        let genreId;
        if (genreRes.rows.length > 0) {
            genreId = genreRes.rows[0].id;
        } else {
            const insertGenreQuery = `
                INSERT INTO genres (name) 
                VALUES ($1) 
                RETURNING id;
            `;
            const insertGenreRes = await client.query(insertGenreQuery, [genreName]);
            genreId = insertGenreRes.rows[0].id;
        }
        const insertGameQuery = `
            INSERT INTO games (name, description, developer_id, genre_id) 
            VALUES ($1, $2, $3, $4) 
            RETURNING id;
        `;
        const insertGameRes = await client.query(insertGameQuery, [name, description, developerId, genreId]);
        const newGameId = insertGameRes.rows[0].id;
        await client.query('COMMIT');

        return { success: true, gameId: newGameId };
    } catch (err) {

        console.error("Error in addGame:", err.stack);  
        await client.query('ROLLBACK');  
        throw new Error(`Database error: ${err.message}`);  
    } finally {
        client.release();
    }
}


module.exports = {
    getAllItems,
    searchForItem,
    addGame,
};
