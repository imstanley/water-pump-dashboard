import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware/auth";
import { validateQuery } from "@/lib/api/middleware/validation";
import { standardRateLimit } from "@/lib/api/middleware/rateLimit";
import { handleError } from "@/lib/errors/errorHandler";
import { getAlertsQuerySchema, type GetAlertsQuery } from "@/lib/validations/alertSchemas";
import { usePumpAlerts } from "@/hooks/usePumpAlerts";
import { logger } from "@/lib/logging/logger";
import { createClient } from "@/lib/supabase/server";

// GET /api/alerts - Get alerts
export const GET = standardRateLimit(
  validateQuery(getAlertsQuerySchema, async (request: NextRequest, query: GetAlertsQuery) => {
    try {
      const { user } = await requireAuth(request);
      const supabase = await createClient();

      let alertsQuery = supabase
        .from("pump_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .range(query.offset || 0, (query.offset || 0) + (query.limit || 100) - 1);

      if (query.pump_id) {
        alertsQuery = alertsQuery.eq("pump_id", query.pump_id);
      }

      if (query.severity) {
        alertsQuery = alertsQuery.eq("severity", query.severity);
      }

      if (query.acknowledged !== undefined) {
        alertsQuery = alertsQuery.eq("acknowledged", query.acknowledged);
      }

      const { data: alerts, error } = await alertsQuery;

      if (error) {
        throw error;
      }

      logger.info("Alerts fetched", {
        userId: user.id,
        count: alerts?.length || 0,
      });

      return NextResponse.json({ data: alerts || [] });
    } catch (error) {
      return handleError(error);
    }
  })
);
