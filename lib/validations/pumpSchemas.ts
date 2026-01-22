import { z } from "zod";
import { sanitizeString, sanitizeUrl } from "@/lib/security/sanitize";

export const pumpStatusSchema = z.enum(["running", "stopped", "error", "unknown"]);

export const coordinateSchema = z
  .number()
  .min(-90, "Latitude must be between -90 and 90")
  .max(90, "Latitude must be between -90 and 90")
  .nullable()
  .optional();

export const longitudeSchema = z
  .number()
  .min(-180, "Longitude must be between -180 and 180")
  .max(180, "Longitude must be between -180 and 180")
  .nullable()
  .optional();

export const createPumpSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(200, "Name must be less than 200 characters")
    .transform((val) => sanitizeString(val)),
  location: z
    .string()
    .max(500, "Location must be less than 500 characters")
    .transform((val) => sanitizeString(val))
    .nullable()
    .optional(),
  latitude: coordinateSchema,
  longitude: longitudeSchema,
  api_endpoint: z
    .string()
    .max(500, "API endpoint must be less than 500 characters")
    .transform((val) => {
      if (!val || val === "") return null;
      return sanitizeUrl(val);
    })
    .refine((val) => val !== null || val === null, {
      message: "API endpoint must be a valid URL",
    })
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
  api_key: z
    .string()
    .max(500, "API key must be less than 500 characters")
    .transform((val) => sanitizeString(val))
    .nullable()
    .optional(),
  status: pumpStatusSchema.default("unknown"),
});

export const updatePumpSchema = createPumpSchema.partial();

export const pumpIdSchema = z.string().uuid("Pump ID must be a valid UUID");

export const getPumpQuerySchema = z.object({
  id: pumpIdSchema,
});

export type CreatePumpInput = z.infer<typeof createPumpSchema>;
export type UpdatePumpInput = z.infer<typeof updatePumpSchema>;
export type GetPumpQuery = z.infer<typeof getPumpQuerySchema>;
