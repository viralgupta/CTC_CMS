import { z } from "zod";

const base_phone_numberType = z
  .object({
    customer_id: z.string().optional(),
    architect_id: z.string().optional(),
    carpanter_id: z.string().optional(),
    driver_id: z.string().optional(),
    country_code: z
      .string()
      .min(1, "Country code too short")
      .max(5, "Country code too long")
      .optional(),
    whatsappChatId: z.string().max(20, "Whatsapp Chat Id too long").optional(),
    isPrimary: z.boolean().optional(),
  })

export const phone_numberType = base_phone_numberType
  .extend({
    phone_number: z.string().length(10, "Phone number not of length 10"),
  }).omit({
    customer_id: true,
    architect_id: true,
    carpanter_id: true,
    driver_id: true,
  });

export const addressAreaType = z.object({
  area: z.string().max(50, "Area too long")
})

export const addressType = z
  .object({
    house_number: z.string().max(15, "House number too long"),
    address_area_id: z.string(),
    address: z.string().max(256, "Address too long"),
    city: z.string().max(30, "City too long"),
    state: z.string().max(20, "State too long"),
    isPrimary: z.boolean().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  })
  .strict("Too many fields in request body");

export const createPhoneType = base_phone_numberType
.extend({
  phone_number: z.string().length(10, "Phone number not of length 10"),
})
.refine((vals) => {
  const ids = [
    vals.customer_id,
    vals.architect_id,
    vals.carpanter_id,
    vals.driver_id,
  ].filter(Boolean);

  if (ids.length === 0) {
    return false;
  } else if (ids.length > 1) {
    return false;
  } else {
    return true;
  }
}, "Exactly one entity (customer_id, architect_id, carpanter_id, driver_id) should be specified to create a number");

export const editPhoneType = base_phone_numberType
  .extend({
    phone_number_id: z.string(),
    phone_number: z
      .string()
      .length(10, "Phone number not of length 10")
      .optional(),
  })
  .refine((vals) => {
    const ids = [
      vals.customer_id,
      vals.architect_id,
      vals.carpanter_id,
      vals.driver_id,
    ].filter(Boolean);

    if (ids.length === 0) {
      return false;
    } else if (ids.length > 1) {
      return false;
    } else {
      return true;
    }
  }, "Exactly one entity (customer_id, architect_id, carpanter_id, driver_id) should be specified to create a number");

export const deletePhoneType = z
  .object({
    phone_number_id: z.string(),
  })

export const createPutSignedURLType = z.object({
  type: z.enum(["PROFILE", "DOCUMENT"]),
  file_name: z.string(),
  extension: z.string().max(5),
  name: z.string().max(100),
  description: z.string().optional(),
})

export const editResourceType = z.object({
  resource_id: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
})

export const createGetSignedURLType = z.object({
  resource_id: z.string(),
})

export const deleteResourceType = z.object({
  resource_id: z.string(),
})