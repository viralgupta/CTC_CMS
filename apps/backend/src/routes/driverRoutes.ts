import express from "express"
import { createDriver, editDriver, getDriver, deleteDriver, getAllDrivers, getDriverOrderMovements } from "../controllers/driverController"

const driverRouter = express.Router()

driverRouter.route('/createDriver').post(createDriver)
driverRouter.route('/editDriver').put(editDriver)
driverRouter.route('/getDriver').get(getDriver)
driverRouter.route('/getDriverOrderMovements').get(getDriverOrderMovements)
driverRouter.route('/deleteDriver').delete(deleteDriver)
driverRouter.route('/getAllDrivers').get(getAllDrivers)

export default driverRouter;