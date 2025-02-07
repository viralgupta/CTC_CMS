import { z } from "zod";

const estimateItem = z.object({
  item_id: z.number(),
  quantity: z.number(),
  rate: z.number(),
  total_value: z.string()
  .refine((val) => !isNaN(parseFloat(val)) && parseFloat(parseFloat(val).toFixed(2)) >= 0.00, {
    message: "The number must be greater than or equal to 0.00",
  })
  .transform((val) => parseFloat(val).toFixed(2)),
})

export const createEstimateType = z.object({
  customer_id: z.number(),
  estimate_items: z.array(estimateItem).min(1, "At least one item is required"),
})
.strict("Too many fields in the body")



export const getEstimateType = z.object({
  estimate_id: z.string().transform((val) => Number(val)),
})
.strict("Too many fields in the query")

export const deleteEstimateType = getEstimateType;

export const editEstimateCustomerIdType = createEstimateType.omit({
  estimate_items: true
}).extend({
  estimate_id: z.number(),
})
.strict("Too many fields in the body");

export const editEstimateOrderItemsType = z.object({
  estimate_id: z.number(),
  estimate_items: z.array(estimateItem).min(1, "At least one item is required"),
})
.strict("Too many fields in the body")

export const getAllEstimatesType = z.object({
  cursor: z.string().transform((val) => Number(val)).optional()
})