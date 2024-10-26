import { z } from "zod";

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
    min_quantity: z
      .number()
      .nonnegative("Min Quantity needs to be greater than equal to 0")
  })
  .strict("Too many fields in request body");

export const getItemType = z.object({
  item_id: z.string().uuid("Invalid Item ID"),
})

export const getItemRatesType = getItemType.extend({
  customer_id: z.string().uuid().optional()
});

export const editItemType = createItemType
  .extend({
    item_id: z.string().uuid("Invalid Item ID"),
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
  item_id: z.string().uuid("Invalid Item ID"),
  vendor_name: z.string().max(255).optional(),
  ordered_quantity: z.number().optional(),
  order_date: z.string()
  .transform((dateString) => new Date(dateString))
  .refine((date) => !isNaN(date.getTime()), { message: "Invalid date format" }),
  received_quantity: z.number().optional(),
  receive_date: z.string()
    .transform((dateString) => new Date(dateString))
    .refine((date) => !isNaN(date.getTime()), { message: "Invalid date format" }).optional()
});

export const editItemOrderType = z.object({
  id: z.string().uuid(),
  vendor_name: z.string().max(255).optional(),
  ordered_quantity: z.number().optional(),
  order_date: z.string()
    .transform((dateString) => new Date(dateString))
    .refine((date) => !isNaN(date.getTime()), { message: "Invalid date format" })
});

export const receiveItemOrderType = z.object({
  id: z.string().uuid(),
  received_quantity: z.number(),
  receive_date: z.string()
    .transform((dateString) => new Date(dateString))
    .refine((date) => !isNaN(date.getTime()), { message: "Invalid date format" }).optional()
});

export const deleteItemOrderType = z.object({
  id: z.string().uuid(),
});

export const deleteItemType = z.object({
  item_id: z.string().uuid("Invalid Item ID"),
})