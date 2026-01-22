import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware/auth";
import { validateRequest } from "@/lib/api/middleware/validation";
import { standardRateLimit } from "@/lib/api/middleware/rateLimit";
import { handleError } from "@/lib/errors/errorHandler";
import { z } from "zod";
import {
  updatePumpSchema,
  pumpIdSchema,
  type UpdatePumpInput,
} from "@/lib/validations/pumpSchemas";
import { getPump, updatePump, deletePump } from "@/lib/api/pumps";
import { logger } from "@/lib/logging/logger";
import { NotFoundError } from "@/lib/errors/AppError";

const paramsSchema = z.object({
  id: pumpIdSchema,
});

// GET /api/pumps/[id] - Get a single pump
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return standardRateLimit(async (req: NextRequest) => {
    try {
      const { user } = await requireAuth(req);
      const { id } = await params;
      const validatedParams = paramsSchema.parse({ id });

      const pump = await getPump(validatedParams.id);

      if (!pump) {
        throw new NotFoundError("Pump", validatedParams.id);
      }

      logger.info("Pump fetched", {
        userId: user.id,
        pumpId: validatedParams.id,
      });

      return NextResponse.json({ data: pump });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}

// PUT /api/pumps/[id] - Update a pump
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return standardRateLimit(
    validateRequest(
      updatePumpSchema,
      async (
        req: NextRequest,
        data: UpdatePumpInput
      ) => {
        try {
          const { user } = await requireAuth(req);
          const { id } = await params;
          const validatedParams = paramsSchema.parse({ id });

          const pump = await updatePump(validatedParams.id, data);

          if (!pump) {
            throw new NotFoundError("Pump", validatedParams.id);
          }

          logger.info("Pump updated", {
            userId: user.id,
            pumpId: validatedParams.id,
          });

          return NextResponse.json({ data: pump });
        } catch (error) {
          return handleError(error);
        }
      }
    )
  )(request);
}

// DELETE /api/pumps/[id] - Delete a pump
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return standardRateLimit(async (req: NextRequest) => {
    try {
      const { user } = await requireAuth(req);
      const { id } = await params;
      const validatedParams = paramsSchema.parse({ id });

      const success = await deletePump(validatedParams.id);

      if (!success) {
        throw new NotFoundError("Pump", validatedParams.id);
      }

      logger.info("Pump deleted", {
        userId: user.id,
        pumpId: validatedParams.id,
      });

      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
