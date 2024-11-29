import { z } from "zod";
import { phone_numberType } from "./miscellaneous";

export const createDriverType = z
  .object({
    name: z.string(),
    profileUrl: z.string().optional(),
    phone_numbers: z.array(phone_numberType),
    vehicle_number: z.string().optional(),
    size_of_vehicle: z.enum([
      "rickshaw",
      "tempo",
      "chota-hathi",
      "tata",
      "truck",
    ]),
  })
  .strict("Too many fields in request body");

export const editDriverType = createDriverType
  .omit({
    phone_numbers: true,
  })
  .extend({
    driver_id: z.number(),
  })
  .strict("Too many fields in request body");

export const getDriverType = z.object({
  driver_id: z.string().transform((val) => Number(val))
}).strict("Too many fields in request params");

export const deleteDriverType = getDriverType;