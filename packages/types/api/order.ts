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
  
  status: z.enum(["Pending", "Delivered"]),
  priority: z.enum(["High", "Medium", "Low"]),
  
  delivery_date: z.string()
    .transform((dateString) => new Date(dateString)) // Transform string to Date
    .refine((date) => !isNaN(date.getTime()), { message: "Invalid date format" }).optional(),
  delivery_address_id: z.string().uuid().optional(),

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

export const editOrderPriorityType = z.object({
  order_id: z.string(),
  priority: z.enum(["High", "Medium", "Low"])
})

export const editOrderDeliveryDateType = z.object({
  order_id: z.string(),
  delivery_date: z.string()
    .transform((dateString) => new Date(dateString)) // Transform string to Date
    .refine((date) => !isNaN(date.getTime()), { message: "Invalid date format" })
})

export const editOrderDeliveryAddressIdType = z.object({
  order_id: z.string(),
  delivery_address_id: z.string().uuid()
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
  operator: z.enum(["add", "subtract"])
})

export const editOrderItemsType = z.object({
  order_id: z.string(),
  order_items: z.array(orderItem).min(1, "At least one item is required")
})


export const getAllOrdersType = z.object({
  cursor: z.string()
    .transform((dateString) => new Date(dateString)) // Transform string to Date
    .refine((date) => !isNaN(date.getTime()), { message: "Invalid date format" }).optional(),
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

export const getOrderMovementType = z.object({
  id: z.string().uuid()
});

export const createOrderMovementType = z.object({
  order_id: z.string().uuid(),
  driver_id: z.string().uuid().optional(),
  type: z.enum(["DELIVERY", "RETURN"]),
  status: z.enum(["Pending", "Completed"]),
  labour_frate_cost: z.number().default(0).optional(),
  created_at: z
    .string()
    .transform((dateString) => new Date(dateString))
    .refine((date) => !isNaN(date.getTime()), {
      message: "Invalid date format",
    }),
  delivery_at: z
    .string()
    .transform((dateString) => new Date(dateString))
    .refine((date) => !isNaN(date.getTime()), {
      message: "Invalid date format",
    })
    .optional(),
  order_movement_items: z
    .array(
      z.object({
        order_item_id: z.string().uuid(),
        quantity: z.number(),
      })
    )
    .min(1),
});

export const editOrderMovementType = z.object({
  id: z.string().uuid(),
  driver_id: z.string().uuid().optional(),
  labour_frate_cost: z.number().default(0).optional(),
  created_at: z.string()
  .transform((dateString) => new Date(dateString))
  .refine((date) => !isNaN(date.getTime()), { message: "Invalid date format" }),
  delivery_at: z.string()
  .transform((dateString) => new Date(dateString))
  .refine((date) => !isNaN(date.getTime()), { message: "Invalid date format" }).optional()
});

export const editOrderMovementStatusType = z.object({
  id: z.string().uuid()
});

export const deleteOrderMovementType = z.object({
  id: z.string().uuid()
});