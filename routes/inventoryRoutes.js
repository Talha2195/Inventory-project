const { Router } = require('express');
const invenController = require('../controller/inventoryController');
const { validateSearchTerm } = require ('../validators/searchNameVal')
const { validateAddGame } = require ('../validators/addGameVal')
const inventoryRouter = Router();

inventoryRouter.get('/', invenController.inventoryItemsGet);
inventoryRouter.get('/addGame', invenController.displayAddPage);
inventoryRouter.get('/search', validateSearchTerm, invenController.namesSearchGet);
inventoryRouter.get('/deleteGame/:id', invenController.deleteGame)
inventoryRouter.get('/updateGame/:id', invenController.displayEdits)
inventoryRouter.post('/add', validateAddGame, invenController.addNewGame);
inventoryRouter.post('/editGame/:id', invenController.updateGame);

module.exports = inventoryRouter;
