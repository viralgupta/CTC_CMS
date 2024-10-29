import express from "express"
import { createOrder, editOrderNote, addOrderCustomerId, editOrderCarpanterId, editOrderArchitectId, editOrderPriority, editOrderDeliveryDate, editOrderDeliveryAddressId, editOrderDiscount, settleBalance, editOrderItems, getAllOrders, getOrder, getMovement, createMovement, editMovement, deleteMovement, editMovementStatus } from "../controllers/orderController"

const orderRouter = express.Router()

orderRouter.route('/createOrder').post(createOrder)
orderRouter.route('/editOrderNote').put(editOrderNote)
orderRouter.route('/addOrderCustomerId').put(addOrderCustomerId)
orderRouter.route('/editOrderCarpanterId').put(editOrderCarpanterId)
orderRouter.route('/editOrderArchitectId').put(editOrderArchitectId)
orderRouter.route('/editOrderPriority').put(editOrderPriority)
orderRouter.route('/editOrderDeliveryDate').put(editOrderDeliveryDate)
orderRouter.route('/editOrderDeliveryAddressId').put(editOrderDeliveryAddressId)
orderRouter.route('/editOrderDiscount').put(editOrderDiscount)
orderRouter.route('/editOrderItems').put(editOrderItems)
orderRouter.route('/settleBalance').put(settleBalance)
orderRouter.route('/getAllOrders').post(getAllOrders)
orderRouter.route('/getOrder').get(getOrder)
orderRouter.route('/createMovement').post(createMovement)
orderRouter.route('/editMovement').put(editMovement)
orderRouter.route('/editMovementStatus').put(editMovementStatus)
orderRouter.route('/getMovement').get(getMovement)
orderRouter.route('/deleteMovement').delete(deleteMovement)

export default orderRouter;