"use client";

import { useState, useEffect } from "react";
import { isDemoModeSync } from "@/lib/demo/isDemoMode";
import * as demoApi from "@/lib/demo/demoApi";
import { createClient } from "@/lib/supabase/client";
import type { PumpAlert } from "@/types/pump";

export const usePumpAlerts = (pumpId?: string, acknowledged?: boolean) => {
  const [alerts, setAlerts] = useState<PumpAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchAlerts = async () => {
    try {
      const isDemo = isDemoModeSync();
      
      if (isDemo) {
        const data = await demoApi.getAlerts(pumpId, acknowledged);
        setAlerts(data);
        setLoading(false);
        return;
      }

      let query = supabase
        .from("pump_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (pumpId) {
        query = query.eq("pump_id", pumpId);
      }

      if (acknowledged !== undefined) {
        query = query.eq("acknowledged", acknowledged);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();

    const isDemo = isDemoModeSync();

    if (isDemo) {
      // Use demo real-time updates
      const cleanup = demoApi.setupDemoRealtime(
        () => {},
        () => {
          fetchAlerts();
        }
      );

      return cleanup;
    }

    // Subscribe to real-time updates
    const channel = supabase
      .channel("pump_alerts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pump_alerts",
        },
        () => {
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, pumpId, acknowledged]);

  const acknowledgeAlert = async (alertId: string) => {
    const isDemo = isDemoModeSync();

    if (isDemo) {
      const success = await demoApi.acknowledgeAlert(alertId);
      if (success) {
        fetchAlerts();
      }
      return success;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("pump_alerts")
      .update({
        acknowledged: true,
        acknowledged_at: new Date().toISOString(),
        acknowledged_by: user?.id || null,
      })
      .eq("id", alertId);

    if (error) {
      console.error("Error acknowledging alert:", error);
      return false;
    }

    fetchAlerts();
    return true;
  };

  return { alerts, loading, acknowledgeAlert, refetch: fetchAlerts };
};
