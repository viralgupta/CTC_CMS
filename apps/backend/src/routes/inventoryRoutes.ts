import express from "express"
import { createItem, getAllItems, getItem, getItemRates, editItem, createItemOrder, deleteItem, editItemOrder, receiveItemOrder, deleteItemOrder, getWarehouse, getAllWarehouse, deleteWarehouse, createWarehouse, getWarehouseItemQuantities, editWarehouse } from "../controllers/inventoryController"

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
inventoryRouter.route("/createWarehouse").post(createWarehouse)
inventoryRouter.route("/getWarehouse").get(getWarehouse)
inventoryRouter.route("/getAllWarehouse").get(getAllWarehouse)
inventoryRouter.route("/editWarehouse").put(editWarehouse)
inventoryRouter.route("/deleteWarehouse").delete(deleteWarehouse)
inventoryRouter.route("/getWarehouseItemQuantities").get(getWarehouseItemQuantities)

export default inventoryRouter;