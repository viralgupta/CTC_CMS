import { z } from "zod";
import { phone_numberType } from "./miscellaneous";

export const createCarpanterType = z
  .object({
    name: z.string(),
    profileUrl: z.string().optional(),
    phone_numbers: z.array(phone_numberType).min(1),
    area: z.string(),
    balance: z.string().optional(),
  })
  .strict("Too many fields in request body");

export const editCarpanterType = z.object({
    carpanter_id: z.string(),
    name: z.string().optional(),
    profileUrl: z.string().optional(),
    area: z.string().optional(),
  })
  .strict("Too many fields in request body");

export const settleBalanceType = z
  .object({
    carpanter_id: z.string(),
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

export const getCarpanterType = z.object({
  carpanter_id: z.string()
}).strict("Too many fields in request params");

export const deleteCarpanterType = getCarpanterType;