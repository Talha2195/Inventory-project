const db = require('../db/queries');

renderIndex = (req, res) => {
    res.render('index');
};

async function inventoryItemsGet(req, res) {
    try {
        const listOfItems = await db.getAllItems();
        res.render('items', { items: listOfItems });
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).send("Error fetching items from the database");
    }
}

module.exports = {
    renderIndex,
    inventoryItemsGet,
};