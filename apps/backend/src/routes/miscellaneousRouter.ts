import express from "express"
import { createPhone, deletePhone, createPutSignedURL, createGetSignedURL, editResource, deleteResource, getAllResources, getLog, getAllLogs } from "../controllers/miscellaneousController"
import { adminUser } from "../middlewear/adminUser"

const miscellaneousRouter = express.Router()

miscellaneousRouter.route('/createPhone').post(createPhone)
miscellaneousRouter.route('/deletePhone').delete(deletePhone)
miscellaneousRouter.route('/createPutSignedURL').post(createPutSignedURL)
miscellaneousRouter.route('/editResource').put(editResource)
miscellaneousRouter.route('/deleteResource').delete(deleteResource)
miscellaneousRouter.route('/getAllResources').get(getAllResources)
miscellaneousRouter.route('/createGetSignedURL').get(createGetSignedURL)
miscellaneousRouter.route('/getLog').get(adminUser, getLog)
miscellaneousRouter.route('/getAllLogs').get(adminUser, getAllLogs)

export default miscellaneousRouter;