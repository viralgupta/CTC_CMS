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

export const createPhoneType = phone_numberType;

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