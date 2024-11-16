const db = require('../db/queries');


async function inventoryItemsGet(req, res) {
    try {
        const listOfItems = await db.getAllItems();
        res.render('index', { items: listOfItems });
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).send("Error fetching items from the database");
    }
}

module.exports = {
    inventoryItemsGet,
};