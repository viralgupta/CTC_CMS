import { z } from "zod";
import { phone_numberType } from "./miscellaneous";

export const createCarpenterType = z
  .object({
    name: z.string(),
    profileUrl: z.string().optional(),
    phone_numbers: z.array(phone_numberType).min(1),
    area: z.string(),
    balance: z.string().optional(),
    tier_id: z.number(),
  })
  .strict("Too many fields in request body");

export const editCarpenterType = z.object({
    carpenter_id: z.number(),
    name: z.string().optional(),
    profileUrl: z.string().optional(),
    area: z.string().optional(),
    tier_id: z.number().optional(),
  })
  .strict("Too many fields in request body");

export const settleBalanceType = z
  .object({
    carpenter_id: z.number(),
    amount: z
      .string()
      .refine(
        (val) =>
          !isNaN(parseFloat(val)) &&
          parseFloat(parseFloat(val).toFixed(2)) >= 0.00,
        {
          message: "The amount must be greater than or equal to 0.00",
        }
      )
      .transform((val) => parseFloat(parseFloat(val).toFixed(2))),
    operation: z.enum(["add", "subtract"]),
  })
  .strict("Too many fields in request body");

export const getCarpenterType = z.object({
  carpenter_id: z.string().transform((val) => Number(val))
}).strict("Too many fields in request params");

export const getCarpenterOrderType = z.object({
  carpenter_id: z.string().transform((val) => Number(val)),
  cursor: z.string().transform((val) => Number(val)),
}).strict("Too many fields in request params");

export const deleteCarpenterType = z.object({
  carpenter_id: z.number(),
}).strict("Too many fields in request body");