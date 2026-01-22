"use client";

import { useState, useEffect } from "react";
import { isDemoModeSync } from "@/lib/demo/isDemoMode";
import * as demoApi from "@/lib/demo/demoApi";
import { createClient } from "@/lib/supabase/client";
import { getLatestReading, getPumpMetrics } from "@/lib/api/pumpApi";
import type { PumpReading, PumpMetrics } from "@/types/pump";

export const usePumpMetrics = (pumpId?: string) => {
  const [metrics, setMetrics] = useState<PumpMetrics>({
    latest: null,
    avgPressure: null,
    avgFlowRate: null,
    avgTemperature: null,
    totalReadings: 0,
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchMetrics = async () => {
    try {
      const data = await getPumpMetrics(pumpId);
      setMetrics(data);
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();

    const isDemo = isDemoModeSync();

    if (isDemo) {
      // Use demo real-time updates
      const cleanup = demoApi.setupDemoRealtime(
        () => {
          // Refresh metrics when new reading is added
          fetchMetrics();
        },
        () => {},
        pumpId
      );

      return cleanup;
    }

    // Subscribe to real-time updates
    const channel = supabase
      .channel("pump_readings")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "pump_readings",
          filter: pumpId ? `pump_id=eq.${pumpId}` : undefined,
        },
        (payload: any) => {
          // Refresh metrics when new reading is added
          fetchMetrics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, pumpId]);

  return { metrics, loading, refetch: fetchMetrics };
};
