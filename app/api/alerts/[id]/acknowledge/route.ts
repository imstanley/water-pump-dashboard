import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware/auth";
import { standardRateLimit } from "@/lib/api/middleware/rateLimit";
import { handleError } from "@/lib/errors/errorHandler";
import { z } from "zod";
import { acknowledgeAlertSchema } from "@/lib/validations/alertSchemas";
import { logger } from "@/lib/logging/logger";
import { createClient } from "@/lib/supabase/server";
import { NotFoundError } from "@/lib/errors/AppError";

const paramsSchema = z.object({
  id: z.string().uuid("Alert ID must be a valid UUID"),
});

// POST /api/alerts/[id]/acknowledge - Acknowledge an alert
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return standardRateLimit(async (req: NextRequest) => {
    try {
      const { user } = await requireAuth(req);
      const { id } = await params;
      const validatedParams = paramsSchema.parse({ id });
      const supabase = await createClient();

      // Check if alert exists
      const { data: alert, error: fetchError } = await supabase
        .from("pump_alerts")
        .select("*")
        .eq("id", validatedParams.id)
        .single();

      if (fetchError || !alert) {
        throw new NotFoundError("Alert", validatedParams.id);
      }

      // Update alert
      const { data: updatedAlert, error: updateError } = await supabase
        .from("pump_alerts")
        .update({
          acknowledged: true,
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: user.id,
        })
        .eq("id", validatedParams.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      logger.info("Alert acknowledged", {
        userId: user.id,
        alertId: validatedParams.id,
      });

      return NextResponse.json({ data: updatedAlert });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
