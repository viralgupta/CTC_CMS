import express from "express"
import { createItem, getAllItems, getItem, getItemRates, editItem, createItemOrder, deleteItem, editItemOrder, receiveItemOrder, deleteItemOrder } from "../controllers/inventoryController"

const inventoryRouter = express.Router()

inventoryRouter.route('/createItem').post(createItem)
inventoryRouter.route('/getAllItems').get(getAllItems)
inventoryRouter.route('/getItem').get(getItem)
inventoryRouter.route('/getItemRates').get(getItemRates)
inventoryRouter.route('/editItem').put(editItem)
inventoryRouter.route('/createItemOrder').post(createItemOrder)
inventoryRouter.route('/editItemOrder').put(editItemOrder)
inventoryRouter.route('/receiveItemOrder').put(receiveItemOrder)
inventoryRouter.route('/deleteItemOrder').delete(deleteItemOrder)
inventoryRouter.route("/deleteItem").delete(deleteItem)

export default inventoryRouter;