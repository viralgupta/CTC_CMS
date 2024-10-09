import express from "express"
import { createPhone, deletePhone, createPutSignedURL, createGetSignedURL, editResource, deleteResource, getAllResources } from "../controllers/miscellaneousController"

const miscellaneousRouter = express.Router()

miscellaneousRouter.route('/createPhone').post(createPhone)
miscellaneousRouter.route('/deletePhone').delete(deletePhone)
miscellaneousRouter.route('/createPutSignedURL').get(createPutSignedURL)
miscellaneousRouter.route('/editResource').put(editResource)
miscellaneousRouter.route('/deleteResource').delete(deleteResource)
miscellaneousRouter.route('/getAllResources').get(getAllResources)
miscellaneousRouter.route('/createGetSignedURL').get(createGetSignedURL)

export default miscellaneousRouter;