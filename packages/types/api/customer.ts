import { z } from "zod";
import { phone_numberType, addressType } from "./miscellaneous";

export const createCustomerType = z
  .object({
    name: z.string().min(2, "Name too short"),
    balance: z
      .string()
      .refine((val) => !isNaN(parseFloat(val)), {
        message: "The value must be a number",
      })
      .transform((val) => parseFloat(val).toFixed(2)),
    profileUrl: z.string().optional(),
    phone_numbers: z
      .array(phone_numberType)
      .min(1, "At least one phone number is required"),
    addresses: z.array(addressType),
  })
  .strict("Too many fields in request body");

export const addAddressAreaType = z.object({
  area: z.string().max(50, "Area name too long"),
}).strict("Too many fields in request body");

export const deleteAddressAreaType = z.object({
  address_area_id: z.number(),
}).strict("Too many fields in request body");

export const addAddressType = addressType.extend({
  customer_id: z.number()
})

export const editAddressType = addressType
  .partial({
    house_number: true,
    address_area_id: true,
    address: true,
    city: true,
    state: true,
    isPrimary: true,
    cordinates: true
  })
  .extend({
    address_id: z.number(),
    customer_id: z.number(),
  });

export const getAddressType = z.object({
  address_id: z.string().transform((val) => Number(val)),
});

export const deleteAddressType = getAddressType;

export const editCustomerType = createCustomerType.omit({
  phone_numbers: true,
  addresses: true,
  balance: true
}).extend({
  customer_id: z.number()
}).partial({
  name: true,
  profileUrl: true
}).refine((vals) => {
  if (vals.name == undefined && vals.profileUrl == undefined){
    return false;
  } else {
    return true;
  }
}, "At least one field is required to update customer")

export const settleBalanceType = z.object({
  customer_id: z.number(),
  amount: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(parseFloat(val).toFixed(2)) >= 0.00, {
      message: "The amount must be greater than or equal to 0.00",
    })
    .transform((val) => parseFloat(parseFloat(val).toFixed(2))),
  operation: z.enum(["add", "subtract"]),
}).strict("Too many fields in request body");

export const getCustomerType = z
  .object({
    customer_id: z.string().transform((val) => Number(val)).optional(),
    phone_number: z.string().optional(),
  })
  .superRefine((vals, ctx) => {
    const { customer_id, phone_number } = vals;
    if ((customer_id && phone_number) || (!customer_id && !phone_number)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Exactly one of customer_id or phone_number must be provided",
      });
    }
  });

export const deleteCustomerType = z
  .object({
    customer_id: z.number(),
  })
  .strict("Too many fields in request body");