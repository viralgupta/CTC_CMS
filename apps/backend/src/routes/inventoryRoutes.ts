import express from "express"
import { createItem, getAllItems, getItem, getItemRates, editItem, editQuantity, deleteItem } from "../controllers/inventoryController"

const inventoryRouter = express.Router()

inventoryRouter.route('/createItem').post(createItem)
inventoryRouter.route('/getAllItems').get(getAllItems)
inventoryRouter.route('/getItem').get(getItem)
inventoryRouter.route('/getItemRates').get(getItemRates)
inventoryRouter.route('/editItem').put(editItem)
inventoryRouter.route('/editQuantity').post(editQuantity)
inventoryRouter.route("/deleteItem").delete(deleteItem)

export default inventoryRouter;