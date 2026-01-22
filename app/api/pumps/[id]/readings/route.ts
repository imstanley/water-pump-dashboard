import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware/auth";
import { validateQuery } from "@/lib/api/middleware/validation";
import { standardRateLimit } from "@/lib/api/middleware/rateLimit";
import { handleError } from "@/lib/errors/errorHandler";
import { z } from "zod";
import { pumpIdSchema } from "@/lib/validations/pumpSchemas";
import { getReadingsInRange } from "@/lib/api/pumpApi";
import { logger } from "@/lib/logging/logger";

const paramsSchema = z.object({
  id: pumpIdSchema,
});

const querySchema = z.object({
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(1000).optional().default(100),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

// GET /api/pumps/[id]/readings - Get readings for a pump
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return standardRateLimit(async (req: NextRequest) => {
    try {
      const { user } = await requireAuth(req);
      const { id } = await params;
      const validatedParams = paramsSchema.parse({ id });

      const url = new URL(req.url);
      const startDate = url.searchParams.get("start_date")
        ? new Date(url.searchParams.get("start_date")!)
        : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const endDate = url.searchParams.get("end_date")
        ? new Date(url.searchParams.get("end_date")!)
        : new Date();
      const limit = parseInt(url.searchParams.get("limit") || "100", 10);
      const offset = parseInt(url.searchParams.get("offset") || "0", 10);

      const validatedQuery = querySchema.parse({
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        limit,
        offset,
      });

      const readings = await getReadingsInRange(startDate, endDate, validatedParams.id);

      logger.info("Readings fetched", {
        userId: user.id,
        pumpId: validatedParams.id,
        count: readings.length,
      });

      return NextResponse.json({
        data: readings.slice(validatedQuery.offset, validatedQuery.offset + validatedQuery.limit),
        pagination: {
          total: readings.length,
          limit: validatedQuery.limit,
          offset: validatedQuery.offset,
          hasMore: readings.length > validatedQuery.offset + validatedQuery.limit,
        },
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
