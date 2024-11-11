const { Router } = require("express")
const invenController = require("../controller/inventoryController")
const inventoryRouter = Router()


inventoryRouter.get('/', invenController.renderIndex); 

inventoryRouter.get('/items', invenController.inventoryItemsGet);

module.exports = inventoryRouter;
