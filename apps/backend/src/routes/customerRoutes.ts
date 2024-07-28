import express from "express"
import { createCustomer, addAddress, addAddressArea, editCustomer, settleBalance, getCustomer, getCustomersByArea, deleteCustomer, getAllCustomers, getAllAddressAreas, editAddress, deleteAddress, getCustomerAddresses } from "../controllers/customerController"

const customerRouter = express.Router()

customerRouter.route('/createCustomer').post(createCustomer)
customerRouter.route('/addAddressArea').post(addAddressArea)
customerRouter.route('/getAllAddressAreas').get(getAllAddressAreas)
customerRouter.route('/addAddress').post(addAddress)
customerRouter.route('/editAddress').put(editAddress)
customerRouter.route('/deleteAddress').delete(deleteAddress)
customerRouter.route('/getCustomerAddresses').get(getCustomerAddresses)
customerRouter.route('/editCustomer').put(editCustomer)
customerRouter.route('/settleBalance').put(settleBalance)
customerRouter.route('/getCustomer').get(getCustomer)
customerRouter.route('/getCustomersByArea').get(getCustomersByArea)
customerRouter.route('/deleteCustomer').delete(deleteCustomer)
customerRouter.route('/getAllCustomers').get(getAllCustomers)

export default customerRouter;