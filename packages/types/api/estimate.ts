import { z } from "zod";

const estimateItem = z.object({
  item_id: z.string(),
  quantity: z.number(),
  rate: z.number(),
  total_value: z.string()
  .refine((val) => !isNaN(parseFloat(val)) && parseFloat(parseFloat(val).toFixed(2)) >= 0.00, {
    message: "The number must be greater than or equal to 0.00",
  })
  .transform((val) => parseFloat(val).toFixed(2)),
})

export const createEstimateType = z.object({
  customer_id: z.string(),
  estimate_items: z.array(estimateItem).min(1, "At least one item is required"),
})
.strict("Too many fields in the body")



export const getEstimateType = z.object({
  estimate_id: z.string(),
})
.strict("Too many fields in the query")

export const deleteEstimateType = getEstimateType;

export const editEstimateCustomerIdType = createEstimateType.omit({
  estimate_items: true
}).extend({
  estimate_id: z.string(),
})
.strict("Too many fields in the body");

export const editEstimateOrderItemsType = z.object({
  estimate_id: z.string(),
  estimate_items: z.array(estimateItem).min(1, "At least one item is required"),
})
.strict("Too many fields in the body")