const { Router } = require('express');
const invenController = require('../controller/inventoryController');
const inventoryRouter = Router();

inventoryRouter.get('/', invenController.inventoryItemsGet);

inventoryRouter.get('/search', invenController.validateSearchTerm, invenController.namesSearchGet);

module.exports = inventoryRouter;
