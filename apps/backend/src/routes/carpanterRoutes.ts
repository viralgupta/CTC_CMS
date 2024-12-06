import express from "express"
import {createCarpanter, editCarpanter, settleBalance, getCarpanter, deleteCarpanter, getAllCarpanters, getCarpanterOrders} from "../controllers/carpanterController"

const carpanterRouter = express.Router()

carpanterRouter.route('/createCarpanter').post(createCarpanter)
carpanterRouter.route('/editCarpanter').put(editCarpanter)
carpanterRouter.route('/settleBalance').put(settleBalance)
carpanterRouter.route('/getCarpanter').get(getCarpanter)
carpanterRouter.route('/getCarpanterOrders').get(getCarpanterOrders)
carpanterRouter.route('/deleteCarpanter').delete(deleteCarpanter)
carpanterRouter.route('/getAllCarpanters').get(getAllCarpanters)

export default carpanterRouter;