import { z } from "zod";

export const alertThresholdsSchema = z
  .object({
    pressure_min: z
      .number()
      .min(0, "Minimum pressure must be 0 or greater")
      .max(1000, "Minimum pressure must be less than 1000")
      .optional()
      .nullable(),
    pressure_max: z
      .number()
      .min(0, "Maximum pressure must be 0 or greater")
      .max(1000, "Maximum pressure must be less than 1000")
      .optional()
      .nullable(),
    flow_rate_min: z
      .number()
      .min(0, "Minimum flow rate must be 0 or greater")
      .max(1000, "Minimum flow rate must be less than 1000")
      .optional()
      .nullable(),
    flow_rate_max: z
      .number()
      .min(0, "Maximum flow rate must be 0 or greater")
      .max(1000, "Maximum flow rate must be less than 1000")
      .optional()
      .nullable(),
    temperature_max: z
      .number()
      .min(-50, "Maximum temperature must be -50 or greater")
      .max(300, "Maximum temperature must be less than 300")
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      const min = data.pressure_min;
      const max = data.pressure_max;
      if (min != null && max != null) {
        return min <= max;
      }
      return true;
    },
    {
      message: "Minimum pressure must be less than or equal to maximum pressure",
      path: ["pressure_min"],
    }
  )
  .refine(
    (data) => {
      const min = data.flow_rate_min;
      const max = data.flow_rate_max;
      if (min != null && max != null) {
        return min <= max;
      }
      return true;
    },
    {
      message: "Minimum flow rate must be less than or equal to maximum flow rate",
      path: ["flow_rate_min"],
    }
  );

export const createPumpConfigSchema = z.object({
  pump_id: z.string().uuid("Pump ID must be a valid UUID"),
  api_endpoint: z
    .string()
    .url("API endpoint must be a valid URL")
    .max(500, "API endpoint must be less than 500 characters")
    .nullable()
    .optional()
    .or(z.literal("")),
  api_key: z
    .string()
    .max(500, "API key must be less than 500 characters")
    .nullable()
    .optional(),
  poll_interval: z
    .number()
    .int("Poll interval must be an integer")
    .min(5, "Poll interval must be at least 5 seconds")
    .max(3600, "Poll interval must be less than 3600 seconds")
    .default(30),
  alert_thresholds: alertThresholdsSchema.default({}),
});

export const updatePumpConfigSchema = createPumpConfigSchema.partial().extend({
  pump_id: z.string().uuid("Pump ID must be a valid UUID").optional(),
});

export const pumpControlCommandSchema = z.enum(["start", "stop", "set_pressure", "set_flow_rate"]);

export const sendPumpCommandSchema = z.object({
  command_type: pumpControlCommandSchema,
  command_value: z
    .string()
    .max(100, "Command value must be less than 100 characters")
    .nullable()
    .optional(),
  pump_id: z.string().uuid("Pump ID must be a valid UUID"),
});

export type CreatePumpConfigInput = z.infer<typeof createPumpConfigSchema>;
export type UpdatePumpConfigInput = z.infer<typeof updatePumpConfigSchema>;
export type AlertThresholdsInput = z.infer<typeof alertThresholdsSchema>;
export type SendPumpCommandInput = z.infer<typeof sendPumpCommandSchema>;
