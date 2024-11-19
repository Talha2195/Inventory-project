const db = require('../db/queries');
const { validationResult } = require("express-validator");

async function inventoryItemsGet(req, res) {
    try {
        const listOfItems = await db.getAllItems();
        res.render('index', { 
            items: listOfItems,
            errors: [], 
            searchTerm: '' 
        });
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).send("Error fetching items from the database");
    }
}

async function displayAddPage(req, res) {
    try{
        res.render('addGame', {
            errors: []
        })
    } catch (error) {
        console.error('Could not load Add game page', error)
        res.status(500).send('Error fetching addGame page')
    }
}

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

async function addNewGame(req, res) {
    const { gameName, description, developer, genre } = req.body; 
    if (!gameName || !description || !developer || !genre) {
        console.log(gameName, description, developer,genre)
        return res.status(400).send("Missing required fields");
    }

    try {
        const result = await db.addGame(gameName, description, developer, genre);
        if (result.success) {
            res.redirect('/');
        } else {
            res.status(500).send("Error adding new game");
        }
    } catch (error) {
    console.error("Error in addGameController:", error);  
    res.status(500).send(`Error adding new game: ${error.message}`);
    
}
}

async function deleteGame(req, res) {
   const { id } = req.params;
   try{
    const result = await db.deleteGame(id);
    if (result.success) {
        res.redirect('/');  
    } else {
        res.status(404).send(result.message); 
    }
} catch (err) {
    res.status(500).send('Error deleting game');
}
}

module.exports = {
    inventoryItemsGet,
    namesSearchGet,
    addNewGame,
    displayAddPage,
    deleteGame,
};

