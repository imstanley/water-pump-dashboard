import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware/auth";
import { validateRequest } from "@/lib/api/middleware/validation";
import { standardRateLimit } from "@/lib/api/middleware/rateLimit";
import { handleError } from "@/lib/errors/errorHandler";
import {
  createPumpConfigSchema,
  updatePumpConfigSchema,
  type CreatePumpConfigInput,
  type UpdatePumpConfigInput,
} from "@/lib/validations/configSchemas";
import { getPumpConfig, updatePumpConfig } from "@/lib/api/pumpApi";
import { logger } from "@/lib/logging/logger";
import { NotFoundError } from "@/lib/errors/AppError";
import { z } from "zod";

const querySchema = z.object({
  pump_id: z.string().uuid().optional(),
});

// GET /api/config - Get pump configuration
export const GET = standardRateLimit(
  async (request: NextRequest) => {
    try {
      const { user } = await requireAuth(request);
      const url = new URL(request.url);
      const pumpId = url.searchParams.get("pump_id");

      const config = await getPumpConfig(pumpId || undefined);

      if (!config) {
        throw new NotFoundError("Pump configuration", pumpId || undefined);
      }

      logger.info("Config fetched", {
        userId: user.id,
        pumpId: config.pump_id,
      });

      return NextResponse.json({ data: config });
    } catch (error) {
      return handleError(error);
    }
  }
);

// PUT /api/config - Update pump configuration
export const PUT = standardRateLimit(
  validateRequest(updatePumpConfigSchema, async (request: NextRequest, data: UpdatePumpConfigInput) => {
    try {
      const { user } = await requireAuth(request);

      if (!data.pump_id) {
        return NextResponse.json(
          {
            error: "pump_id is required",
            code: "VALIDATION_ERROR",
          },
          { status: 400 }
        );
      }

      // Convert null values to undefined for type compatibility
      const cleanedData = {
        ...data,
        alert_thresholds: data.alert_thresholds ? {
          pressure_min: data.alert_thresholds.pressure_min ?? undefined,
          pressure_max: data.alert_thresholds.pressure_max ?? undefined,
          flow_rate_min: data.alert_thresholds.flow_rate_min ?? undefined,
          flow_rate_max: data.alert_thresholds.flow_rate_max ?? undefined,
          temperature_max: data.alert_thresholds.temperature_max ?? undefined,
        } : undefined,
        api_endpoint: data.api_endpoint ?? undefined,
        api_key: data.api_key ?? undefined,
      };
      const config = await updatePumpConfig(cleanedData, data.pump_id);

      if (!config) {
        throw new NotFoundError("Pump configuration", data.pump_id);
      }

      logger.info("Config updated", {
        userId: user.id,
        pumpId: data.pump_id,
      });

      return NextResponse.json({ data: config });
    } catch (error) {
      return handleError(error);
    }
  })
);
