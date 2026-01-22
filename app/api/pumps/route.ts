import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware/auth";
import { validateRequest } from "@/lib/api/middleware/validation";
import { standardRateLimit } from "@/lib/api/middleware/rateLimit";
import { handleError } from "@/lib/errors/errorHandler";
import {
  createPumpSchema,
  type CreatePumpInput,
} from "@/lib/validations/pumpSchemas";
import { getPumps, createPump } from "@/lib/api/pumps";
import { logger } from "@/lib/logging/logger";
import { DatabaseError } from "@/lib/errors/AppError";

// GET /api/pumps - Get all pumps
export const GET = standardRateLimit(async (request: NextRequest) => {
  try {
    const { user } = await requireAuth(request);
    const pumps = await getPumps();

    logger.info("Pumps fetched", {
      userId: user.id,
      count: pumps.length,
    });

    return NextResponse.json({ data: pumps });
  } catch (error) {
    return handleError(error);
  }
});

// POST /api/pumps - Create a new pump
export const POST = standardRateLimit(
  validateRequest(createPumpSchema, async (request: NextRequest, data: CreatePumpInput) => {
    try {
      const { user } = await requireAuth(request);
      const pump = await createPump({
        ...data,
        created_by: user.id,
      } as Parameters<typeof createPump>[0]);

      if (!pump) {
        throw new DatabaseError("Failed to create pump");
      }

      logger.info("Pump created", {
        userId: user.id,
        pumpId: pump.id,
      });

      return NextResponse.json({ data: pump }, { status: 201 });
    } catch (error) {
      return handleError(error);
    }
  })
);
