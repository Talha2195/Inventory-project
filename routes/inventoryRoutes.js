const { Router } = require('express');
const invenController = require('../controller/inventoryController');
const inventoryRouter = Router();

inventoryRouter.get('/', invenController.inventoryItemsGet);

module.exports = inventoryRouter;
