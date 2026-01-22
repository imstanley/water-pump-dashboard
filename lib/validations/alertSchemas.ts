import { z } from "zod";
import { sanitizeText } from "@/lib/security/sanitize";

export const alertSeveritySchema = z.enum(["critical", "warning", "info"]);

export const createPumpAlertSchema = z.object({
  pump_id: z.string().uuid("Pump ID must be a valid UUID"),
  severity: alertSeveritySchema,
  message: z
    .string()
    .min(1, "Message is required")
    .max(1000, "Message must be less than 1000 characters")
    .transform((val) => sanitizeText(val)),
  pump_reading_id: z.string().uuid("Pump reading ID must be a valid UUID").nullable().optional(),
});

export const acknowledgeAlertSchema = z.object({
  alert_id: z.string().uuid("Alert ID must be a valid UUID"),
});

export const getAlertsQuerySchema = z.object({
  pump_id: z.string().uuid("Pump ID must be a valid UUID").optional(),
  severity: alertSeveritySchema.optional(),
  acknowledged: z
    .string()
    .transform((val) => val === "true")
    .pipe(z.boolean())
    .optional(),
  limit: z
    .number()
    .int("Limit must be an integer")
    .min(1, "Limit must be at least 1")
    .max(1000, "Limit must be less than 1000")
    .optional()
    .default(100),
  offset: z
    .number()
    .int("Offset must be an integer")
    .min(0, "Offset must be 0 or greater")
    .optional()
    .default(0),
});

export type CreatePumpAlertInput = z.infer<typeof createPumpAlertSchema>;
export type AcknowledgeAlertInput = z.infer<typeof acknowledgeAlertSchema>;
export type GetAlertsQuery = z.infer<typeof getAlertsQuerySchema>;
