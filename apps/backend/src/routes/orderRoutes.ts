import express from "express"
import { createOrder, editOrderNote, addOrderCustomerId, editOrderCarpanterId, editOrderArchitectId, editOrderDriverId, editOrderStatus, editOrderPriority, editOrderDeliveryDate, editOrderDeliveryAddressId, editOrderLabourAndFrateCost, editOrderDiscount, settleBalance, editOrderItems, getAllOrders, getOrder } from "../controllers/orderController"

const orderRouter = express.Router()

orderRouter.route('/createOrder').post(createOrder)
orderRouter.route('/editOrderNote').put(editOrderNote)
orderRouter.route('/addOrderCustomerId').put(addOrderCustomerId)
orderRouter.route('/editOrderCarpanterId').put(editOrderCarpanterId)
orderRouter.route('/editOrderArchitectId').put(editOrderArchitectId)
orderRouter.route('/editOrderDriverId').put(editOrderDriverId)
orderRouter.route('/editOrderStatus').put(editOrderStatus)
orderRouter.route('/editOrderPriority').put(editOrderPriority)
orderRouter.route('/editOrderDeliveryDate').put(editOrderDeliveryDate)
orderRouter.route('/editOrderDeliveryAddressId').put(editOrderDeliveryAddressId)
orderRouter.route('/editOrderLabourAndFrateCost').put(editOrderLabourAndFrateCost)
orderRouter.route('/editOrderDiscount').put(editOrderDiscount)
orderRouter.route('/editOrderItems').put(editOrderItems)
orderRouter.route('/settleBalance').put(settleBalance)
orderRouter.route('/getAllOrders').post(getAllOrders)
orderRouter.route('/getOrder').get(getOrder)

export default orderRouter;