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
        LEFT JOIN genres ON games.genre_id = genres.id  
        ORDER BY games.name;
    `;
    const { rows } = await pool.query(query);
    return rows;
}

async function searchForItem(name) {
    const query = `
        SELECT 
            games.id, 
            games.name AS name, 
            games.description, 
            developers.name AS developer_name,
            genres.name AS genre_name
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

async function deleteGame(gameId) {
    const client = await pool.connect();
    try {
        const query = 'DELETE FROM games WHERE id = $1';
        const result = await client.query(query, [gameId]);
        if (result.rowCount > 0) {
            return { success: true };
        } else {
            return { success: false, message: 'Game not found or already deleted' };
        }
    } catch (err) {
        console.error("Error deleting game:", err.stack);
        throw err;
    } finally {
        client.release();
    }
}

async function getGameById(id) {
    const query = `
        SELECT games.id, games.name, games.description, 
               developers.name AS developer_name, genres.name AS genre_name, 
               games.developer_id, games.genre_id
        FROM games
        LEFT JOIN developers ON games.developer_id = developers.id
        LEFT JOIN genres ON games.genre_id = genres.id
        WHERE games.id = $1;
    `;
    
    try {
        const { rows } = await pool.query(query, [id]);
        return rows[0];  
    } catch (err) {
        console.error("Error fetching game by ID:", err.stack);
        throw err;
    }
}

async function updateGame(id, name, description, developerId, genreId) {
    const query = `
        UPDATE games
        SET name = $1, description = $2, developer_id = $3, genre_id = $4
        WHERE id = $5;
    `;
    
    try {
        const { rowCount } = await pool.query(query, [name, description, developerId, genreId, id]);
        return rowCount > 0; 
    } catch (err) {
        console.error("Error updating game:", err.stack);
        throw err;
    }
}

async function getGenresAndDevelopers() {
    const query = `
        SELECT 'genre' AS type, name AS name FROM genres 
        UNION
        SELECT 'developer' AS type, name AS name FROM developers;  
    `;
    
    try {
        const result = await pool.query(query);
        const filters = result.rows.map(row => {
            if (row.type === 'genre') {
                return { genre: row.name };
            } else if (row.type === 'developer') {
                return { developer: row.name };
            }
        });

        return filters; 
    } catch (err) {
        console.error("Error fetching genres and developers:", err.stack);
        throw err;
    }
}

async function getGamesByGenres(selectedGenres) {
    const genrePlaceholders = selectedGenres.map((_, index) => `$${index + 1}`).join(', '); 
    const query = `
        SELECT 
            games.id, 
            games.name, 
            games.description, 
            developers.name AS developer_name,
            genres.name AS genre_name
        FROM games
        LEFT JOIN developers ON games.developer_id = developers.id
        LEFT JOIN genres ON games.genre_id = genres.id
        WHERE genres.name IN (${genrePlaceholders})
        ORDER BY games.name;
    `;
    
    try {
        const { rows } = await pool.query(query, selectedGenres);
        return rows;
    } catch (err) {
        console.error("Error fetching games by selected genres:", err.stack);
        throw err;
    }
}






module.exports = {
    getAllItems,
    searchForItem,
    addGame,
    deleteGame,
    updateGame,
    getGameById,
    getGenresAndDevelopers,
    getGamesByGenres,
};
