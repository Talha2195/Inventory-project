const pool = require('./pool');  

async function getAllItems() {
    const { rows } = await pool.query("SELECT * FROM inventory");
    return rows;
}

module.exports = {
    getAllItems,
}