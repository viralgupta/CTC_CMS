import { z } from "zod";

export const updateOrderMovementOnUploadType = z.object({
  id: z.string().transform((val) => Number(val)),
  key: z.string(),
})

export const removeResourceOnDeleteHandlerType = z.string();