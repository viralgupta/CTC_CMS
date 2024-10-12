import express from "express"
import { createCustomer, getAddress, addAddress, addAddressArea, deleteAddressArea, editCustomer, settleBalance, getCustomer, getCustomersByArea, deleteCustomer, getAllCustomers, getAllAddressAreas, editAddress, deleteAddress, getAllAddresses } from "../controllers/customerController"

const customerRouter = express.Router()

customerRouter.route('/createCustomer').post(createCustomer)
customerRouter.route('/addAddressArea').post(addAddressArea)
customerRouter.route('/deleteAddressArea').delete(deleteAddressArea)
customerRouter.route('/getAllAddressAreas').get(getAllAddressAreas)
customerRouter.route('/getAllAddresses').get(getAllAddresses)
customerRouter.route('/getAddress').get(getAddress)
customerRouter.route('/addAddress').post(addAddress)
customerRouter.route('/editAddress').put(editAddress)
customerRouter.route('/deleteAddress').delete(deleteAddress)
customerRouter.route('/editCustomer').put(editCustomer)
customerRouter.route('/settleBalance').put(settleBalance)
customerRouter.route('/getCustomer').get(getCustomer)
customerRouter.route('/getCustomersByArea').get(getCustomersByArea)
customerRouter.route('/deleteCustomer').delete(deleteCustomer)
customerRouter.route('/getAllCustomers').get(getAllCustomers)

export default customerRouter;