import { z } from "zod";
import { pumpStatusSchema } from "./pumpSchemas";

export const createPumpReadingSchema = z.object({
  pump_id: z.string().uuid("Pump ID must be a valid UUID"),
  timestamp: z
    .string()
    .datetime("Timestamp must be a valid ISO datetime")
    .optional()
    .default(() => new Date().toISOString()),
  pressure: z
    .number()
    .min(0, "Pressure must be 0 or greater")
    .max(1000, "Pressure must be less than 1000")
    .nullable()
    .optional(),
  flow_rate: z
    .number()
    .min(0, "Flow rate must be 0 or greater")
    .max(1000, "Flow rate must be less than 1000")
    .nullable()
    .optional(),
  temperature: z
    .number()
    .min(-50, "Temperature must be -50 or greater")
    .max(300, "Temperature must be less than 300")
    .nullable()
    .optional(),
  status: pumpStatusSchema.default("unknown"),
  power_consumption: z
    .number()
    .min(0, "Power consumption must be 0 or greater")
    .max(100000, "Power consumption must be less than 100000")
    .nullable()
    .optional(),
});

export const getReadingsQuerySchema = z.object({
  pump_id: z.string().uuid("Pump ID must be a valid UUID").optional(),
  start_date: z.string().datetime("Start date must be a valid ISO datetime").optional(),
  end_date: z.string().datetime("End date must be a valid ISO datetime").optional(),
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

export type CreatePumpReadingInput = z.infer<typeof createPumpReadingSchema>;
export type GetReadingsQuery = z.infer<typeof getReadingsQuerySchema>;
