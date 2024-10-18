import { z } from "zod";

export const createItemType = z
  .object({
    name: z.string().max(256, "Item name is too long"),
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

export const editQuantityType = z.object({
  item_id: z.string().uuid("Invalid Item ID"),
  operation: z.enum(["add", "subtract"]),
  quantity: z.number().nonnegative("Quantity needs to be greater than equal to 0"),
}).strict("Too many fields in request body");

export const deleteItemType = z.object({
  item_id: z.string().uuid("Invalid Item ID"),
})