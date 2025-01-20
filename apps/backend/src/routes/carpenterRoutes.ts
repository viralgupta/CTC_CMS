import express from "express"
import {createCarpenter, editCarpenter, settleBalance, getCarpenter, deleteCarpenter, getAllCarpenters, getCarpenterOrders} from "../controllers/carpenterController"

const carpenterRouter = express.Router()

carpenterRouter.route('/createCarpenter').post(createCarpenter)
carpenterRouter.route('/editCarpenter').put(editCarpenter)
carpenterRouter.route('/settleBalance').put(settleBalance)
carpenterRouter.route('/getCarpenter').get(getCarpenter)
carpenterRouter.route('/getCarpenterOrders').get(getCarpenterOrders)
carpenterRouter.route('/deleteCarpenter').delete(deleteCarpenter)
carpenterRouter.route('/getAllCarpenters').get(getAllCarpenters)

export default carpenterRouter;