import { z } from "zod";

export const createWarehouseQuantityType = z.object({
  warehouse_id: z.number(),
  quantity: z.number().nonnegative("Quantity needs to be greater than equal to 0"),
});

export const recieveWarehouseQuantityType = z.object({
  warehouse_quantity_id: z.number(),
  quantity: z.number().nonnegative("Quantity needs to be greater than equal to 0"),
});

export const createItemType = z
  .object({
    name: z.string().max(255, "Item name is too long"),
    multiplier: z
      .number()
      .positive("Multiplier Needs to be greater than 0"),
    category: z.enum([
      "Adhesives",
      "Plywood",
      "Laminate",
      "Veneer",
      "Decorative",
      "Moulding",
      "Miscellaneous",
      "Door",
    ]),
    min_rate: z
      .number()
      .nonnegative("Min Rate needs to be greater than equal to 0")
      .default(0),
    sale_rate: z
      .number()
      .nonnegative("Sale Rate needs to be greater than equal to 0"),
    rate_dimension: z.enum(["Rft", "sq/ft", "piece"]),
    quantity: z
      .number()
      .nonnegative("Quantity needs to be greater than equal to 0"),
    warehouse_quantities: z.array(createWarehouseQuantityType).optional(),
    min_quantity: z
      .number()
      .nonnegative("Min Quantity needs to be greater than equal to 0")
  })
  .strict("Too many fields in request body");

export const getItemType = z.object({
  item_id: z.string().transform((val) => Number(val)),
})

export const getMoreItemOrderItemsType = z.object({
  item_id: z.string().transform((val) => Number(val)),
  cursor: z.string().transform((val) => Number(val)),
})

export const getItemRatesType = getItemType.extend({
  customer_id: z.string().transform((val) => Number(val)).optional()
});

export const editItemType = createItemType
  .extend({
    item_id: z.number(),
  })
  .omit({
    quantity: true,
  })
  .partial({
    name: true,
    multiplier: true,
    category: true,
    min_rate: true,
    sale_rate: true,
    rate_dimension: true,
    min_quantity: true,
  })
  .strict("Too many fields in request body");

export const createItemOrderType = z.object({
  item_id: z.number(),
  vendor_name: z.string().max(255).optional(),
  ordered_quantity: z.number().optional(),
  order_date: z.string()
  .transform((dateString) => new Date(dateString))
  .refine((date) => !isNaN(date.getTime()), { message: "Invalid date format" }),
  received_quantity: z.number().optional(),
  warehouse_quantities: z.array(recieveWarehouseQuantityType).optional(),
  receive_date: z.string()
    .transform((dateString) => new Date(dateString))
    .refine((date) => !isNaN(date.getTime()), { message: "Invalid date format" }).optional()
});

export const editItemOrderType = z.object({
  id: z.number(),
  vendor_name: z.string().max(255).optional(),
  ordered_quantity: z.number().optional(),
  order_date: z.string()
    .transform((dateString) => new Date(dateString))
    .refine((date) => !isNaN(date.getTime()), { message: "Invalid date format" })
});

export const receiveItemOrderType = z.object({
  id: z.number(),
  received_quantity: z.number(),
  warehouse_quantities: z.array(recieveWarehouseQuantityType).min(1),
  receive_date: z.string()
    .transform((dateString) => new Date(dateString))
    .refine((date) => !isNaN(date.getTime()), { message: "Invalid date format" }).optional()
});

export const deleteItemOrderType = z.object({
  id: z.number(),
});

export const deleteItemType = z.object({
  item_id: z.number(),
})

export const createWarehouseType = z.object({
  name: z.string().max(255, "Warehouse name is too long"),
});

export const editWarehouseType = createWarehouseType.extend({
  warehouse_id: z.number(),
})

export const getWarehouseType = z.object({
  warehouse_id: z.string().transform((val) => Number(val)),
});

export const getMoreWarehouseQuantitiesType = z.object({
  warehouse_id: z.string().transform((val) => Number(val)),
  cursor: z.string().transform((val) => Number(val)),
});

export const deleteWarehouseType = getWarehouseType;

export const getWarehouseItemQuantitiesType = z.object({
  item_id: z.string().transform((val) => Number(val)),
});