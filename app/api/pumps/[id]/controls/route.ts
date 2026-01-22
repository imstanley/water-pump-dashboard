import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware/auth";
import { validateRequest } from "@/lib/api/middleware/validation";
import { strictRateLimit } from "@/lib/api/middleware/rateLimit";
import { handleError } from "@/lib/errors/errorHandler";
import { z } from "zod";
import { pumpIdSchema } from "@/lib/validations/pumpSchemas";
import { sendPumpCommandSchema, type SendPumpCommandInput } from "@/lib/validations/configSchemas";
import { sendPumpCommand } from "@/lib/api/pumpApi";
import { logger } from "@/lib/logging/logger";

const paramsSchema = z.object({
  id: pumpIdSchema,
});

// POST /api/pumps/[id]/controls - Send a control command to a pump
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return strictRateLimit(
    validateRequest(sendPumpCommandSchema, async (req: NextRequest, data: SendPumpCommandInput) => {
      try {
        const { user } = await requireAuth(req);
        const { id } = await params;
        const validatedParams = paramsSchema.parse({ id });

        // Ensure pump_id matches the route parameter
        if (data.pump_id !== validatedParams.id) {
          return NextResponse.json(
            {
              error: "Pump ID in body must match route parameter",
              code: "VALIDATION_ERROR",
            },
            { status: 400 }
          );
        }

        const control = await sendPumpCommand(data.command_type, data.command_value ?? undefined);

        if (!control) {
          return NextResponse.json(
            {
              error: "Failed to send pump command",
              code: "COMMAND_FAILED",
            },
            { status: 500 }
          );
        }

        logger.info("Pump command sent", {
          userId: user.id,
          pumpId: validatedParams.id,
          commandType: data.command_type,
        });

        return NextResponse.json({ data: control }, { status: 201 });
      } catch (error) {
        return handleError(error);
      }
    })
  )(request);
}
