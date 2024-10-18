import { z } from "zod";

export const orderItem = z.object({
  item_id: z.string(),
  quantity: z.number(),
  rate: z.number(),
  total_value: z.string()
  .refine((val) => !isNaN(parseFloat(val)) && parseFloat(parseFloat(val).toFixed(2)) >= 0.00, {
    message: "The number must be greater than or equal to 0.00",
  })
  .transform((val) => parseFloat(val).toFixed(2)),
  carpanter_commision:  z.string()
  .refine((val) => !isNaN(parseFloat(val)) && parseFloat(parseFloat(val).toFixed(2)) >= 0.00, {
    message: "The number must be greater than or equal to 0.00",
  })
  .transform((val) => parseFloat(val).toFixed(2))
  .optional(),
  carpanter_commision_type: z.enum(["percentage", "perPiece"]).optional(),
  architect_commision:  z.string()
  .refine((val) => !isNaN(parseFloat(val)) && parseFloat(parseFloat(val).toFixed(2)) >= 0.00, {
    message: "The number must be greater than or equal to 0.00",
  })
  .transform((val) => parseFloat(val).toFixed(2))
  .optional(),
  architect_commision_type: z.enum(["percentage", "perPiece"]).optional()
})

export const createOrderType = z.object({

  note: z.string().optional(),

  customer_id: z.string().uuid().optional(),
  carpanter_id: z.string().uuid().optional(),
  architect_id: z.string().uuid().optional(),
  driver_id: z.string().uuid().optional(),
  
  status: z.enum(["Pending", "Delivered"]),
  priority: z.enum(["High", "Medium", "Low"]),
  
  delivery_date: z.date().optional(),
  delivery_address_id: z.string().uuid().optional(),

  labour_frate_cost: z.number().default(0),

  discount: z.string()
  .refine((val) => !isNaN(parseFloat(val)) && parseFloat(parseFloat(val).toFixed(2)) >= 0.00, {
    message: "The number must be greater than or equal to 0.00",
  })
  .transform((val) => parseFloat(val).toFixed(2))
  .optional(),

  amount_paid: z.string()
  .refine((val) => !isNaN(parseFloat(val)) && parseFloat(parseFloat(val).toFixed(2)) >= 0.00, {
    message: "The number must be greater than or equal to 0.00",
  })
  .transform((val) => parseFloat(val).toFixed(2))
  .optional(),

  order_items: z.array(orderItem).min(1, "At least one item is required"),
})
.strict("Too many fields in the body")

export const editOrderNoteType = z.object({
  order_id: z.string(),
  note: z.string()
})

export const addOrderCustomerIdType = z.object({
  order_id: z.string(),
  customer_id: z.string().uuid()
})

export const editOrderCarpanterIdType = z.object({
  order_id: z.string(),
  carpanter_id: z.string().uuid()
})

export const editOrderArchitectIdType = z.object({
  order_id: z.string(),
  architect_id: z.string().uuid()
})

export const editOrderDriverIdType = z.object({
  order_id: z.string(),
  driver_id: z.string().uuid()
})

export const editOrderStatusType = z.object({
  order_id: z.string(),
  status: z.enum(["Pending", "Delivered"])
})

export const editOrderPriorityType = z.object({
  order_id: z.string(),
  priority: z.enum(["High", "Medium", "Low"])
})

export const editOrderDeliveryDateType = z.object({
  order_id: z.string(),
  delivery_date: z.date()
})

export const editOrderDeliveryAddressIdType = z.object({
  order_id: z.string(),
  delivery_address_id: z.string().uuid()
})

export const editOrderLabourAndFrateCostType = z.object({
  order_id: z.string(),
  labour_frate_cost: z.number()
})

export const editOrderDiscountType = z.object({
  order_id: z.string(),
  discount: z.string()
  .refine((val) => !isNaN(parseFloat(val)) && parseFloat(parseFloat(val).toFixed(2)) >= 0.00, {
    message: "The number must be greater than or equal to 0.00",
  })
  .transform((val) => parseFloat(val).toFixed(2))
})

export const settleBalanceType = z.object({
  order_id: z.string(),
  amount: z.string()
  .refine((val) => !isNaN(parseFloat(val)) && parseFloat(parseFloat(val).toFixed(2)) >= 0.00, {
    message: "The number must be greater than or equal to 0.00",
  })
  .transform((val) => parseFloat(val).toFixed(2)),
  operator: z.enum(["Addition", "Subtraction"])
})

export const editOrderItemsType = z.object({
  order_id: z.string(),
  order_items: z.array(orderItem).min(1, "At least one item is required")
})


export const getAllOrdersType = z.object({
  cursor: z.date().optional(),
  filter: z
    .enum([
      "Status-Pending",
      "Status-Delivered",
      "Priority-High",
      "Priority-Medium",
      "Priority-Low",
      "Payment-UnPaid",
      "Payment-Partial",
      "Payment-Paid",
      "All"
    ])
});

export const getOrderType = z.object({
  order_id: z.string().uuid()
});