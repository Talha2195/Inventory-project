const db = require('../db/queries');

const { query, validationResult } = require("express-validator");

async function inventoryItemsGet(req, res) {
    try {
        const listOfItems = await db.getAllItems();
        res.render('index', { 
            items: listOfItems,
            errors: [],
            searchTerm: '',
        });
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).send("Error fetching items from the database");
    }
}

const validateSearchTerm = [
    query('searchTerm')
        .trim()
        .isLength({ min: 1 }).withMessage('Search term cannot be empty.')
        .isLength({ max: 100 }).withMessage('Search term must be less than 100 characters.')
        .matches(/^[A-Za-z0-9\s]+$/).withMessage('Search term must only contain letters, numbers, and spaces.')
        .bail()
];

async function namesSearchGet(req, res) {
    const errors = validationResult(req);
    const errorMessages = errors.isEmpty() ? [] : errors.array();
    const { searchTerm } = req.query;
    let listOfItems;
    if (errorMessages.length > 0) {
        console.log("Validation Errors:", errorMessages);
        listOfItems = await db.getAllItems(); 
    } else {
        if (!searchTerm || searchTerm.trim() === "") {
            listOfItems = await db.getAllItems(); 
        } else {
            listOfItems = await db.searchForItem(searchTerm); 
        }
    }

    res.render('index', { 
        errors: errorMessages, 
        items: listOfItems, 
        searchTerm: searchTerm || '' 
    });
}

module.exports = {
    inventoryItemsGet,
    namesSearchGet,
    validateSearchTerm
};
