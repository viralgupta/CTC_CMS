import express from "express"
import { createEstimate, getEstimate, getAllEstimates, deleteEstimate, editEstimateCustomerId, editEstimateItems } from "../controllers/estimateController"

const estimateRouter = express.Router();

estimateRouter.route('/createEstimate').post(createEstimate);
estimateRouter.route('/getEstimate').get(getEstimate);
estimateRouter.route('/editEstimateCustomerId').put(editEstimateCustomerId);
estimateRouter.route('/editEstimateItems').put(editEstimateItems);
estimateRouter.route('/getAllEstimate').get(getAllEstimates);
estimateRouter.route('/deleteEstimate').delete(deleteEstimate);

export default estimateRouter;