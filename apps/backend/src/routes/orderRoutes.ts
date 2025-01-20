import express from "express"
import { createOrder, editOrderNote, addOrderCustomerId, editOrderCarpenterId, editOrderArchitectId, editOrderPriority, editOrderDeliveryDate, editOrderDeliveryAddressId, editOrderDiscount, settleBalance, editOrderItems, getAllOrders, getOrder, getMovement, createMovement, editMovement, deleteMovement, editMovementStatus, createPutSignedURLOrderMovementRecipt, deleteOrderMovementRecipt, createGetSignedURLOrderMovementRecipt } from "../controllers/orderController"

const orderRouter = express.Router()

orderRouter.route('/createOrder').post(createOrder)
orderRouter.route('/editOrderNote').put(editOrderNote)
orderRouter.route('/addOrderCustomerId').put(addOrderCustomerId)
orderRouter.route('/editOrderCarpenterId').put(editOrderCarpenterId)
orderRouter.route('/editOrderArchitectId').put(editOrderArchitectId)
orderRouter.route('/editOrderPriority').put(editOrderPriority)
orderRouter.route('/editOrderDeliveryDate').put(editOrderDeliveryDate)
orderRouter.route('/editOrderDeliveryAddressId').put(editOrderDeliveryAddressId)
orderRouter.route('/editOrderDiscount').put(editOrderDiscount)
orderRouter.route('/editOrderItems').put(editOrderItems)
orderRouter.route('/settleBalance').put(settleBalance)
orderRouter.route('/getAllOrders').get(getAllOrders)
orderRouter.route('/getOrder').get(getOrder)
orderRouter.route('/createMovement').post(createMovement)
orderRouter.route('/editMovement').put(editMovement)
orderRouter.route('/editMovementStatus').put(editMovementStatus)
orderRouter.route('/getMovement').get(getMovement)
orderRouter.route('/deleteMovement').delete(deleteMovement)
orderRouter.route('/createPutSignedURLOrderMovementRecipt').post(createPutSignedURLOrderMovementRecipt)
orderRouter.route('/createGetSignedURLOrderMovementRecipt').get(createGetSignedURLOrderMovementRecipt)
orderRouter.route('/deleteOrderMovementRecipt').delete(deleteOrderMovementRecipt)

export default orderRouter;