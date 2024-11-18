const { Router } = require('express');
const invenController = require('../controller/inventoryController');
const { validateSearchTerm } = require ('../validators/searchNameVal')
const { validateAddGame } = require ('../validators/addGameVal')
const inventoryRouter = Router();

inventoryRouter.get('/', invenController.inventoryItemsGet);
inventoryRouter.get('/addGame', invenController.displayAddPage);
inventoryRouter.get('/search', validateSearchTerm, invenController.namesSearchGet);
inventoryRouter.post('/add', validateAddGame, invenController.addNewGame);

module.exports = inventoryRouter;
