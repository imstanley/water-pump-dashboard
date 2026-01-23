"use client";

import { useState, useEffect, useCallback } from "react";
import { usePumpMetrics } from "@/hooks/usePumpMetrics";
import { usePumpAlerts } from "@/hooks/usePumpAlerts";
import { getPumps, getPump } from "@/lib/api/pumps";
import { getLatestReading, getReadingsInRange } from "@/lib/api/pumpApi";
import { PumpSelector } from "@/components/pumps/PumpSelector";
import { CurrentPumpWidget } from "@/components/dashboard/CurrentPumpWidget";
import { HighlightWidget } from "@/components/dashboard/HighlightWidget";
import { ForecastWidget } from "@/components/dashboard/ForecastWidget";
import { TomorrowWidget } from "@/components/dashboard/TomorrowWidget";
import { ActivityWidget } from "@/components/dashboard/ActivityWidget";
import { Wind, Gauge, Sunrise, Droplets, Eye, Thermometer, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Pump, PumpReading } from "@/types/pump";

export default function DashboardPage() {
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [selectedPumpId, setSelectedPumpId] = useState<string | null>(null);
  const [selectedPump, setSelectedPump] = useState<Pump | null>(null);
  const [latestReading, setLatestReading] = useState<PumpReading | null>(null);
  const [historicalReadings, setHistoricalReadings] = useState<PumpReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { metrics, loading: metricsLoading } = usePumpMetrics(selectedPumpId || undefined);
  const { alerts } = usePumpAlerts(selectedPumpId || undefined);

  // Load pumps on mount with error handling
  useEffect(() => {
    const loadPumps = async () => {
      try {
        setError(null);
        const allPumps = await getPumps();
        setPumps(allPumps);
        if (allPumps.length > 0 && !selectedPumpId) {
          setSelectedPumpId(allPumps[0].id);
        }
      } catch (err) {
        console.error("Error loading pumps:", err);
        setError("Failed to load pumps. Please try refreshing the page.");
      } finally {
        setLoading(false);
      }
    };
    loadPumps();
  }, [selectedPumpId]);

  // Load selected pump details with error handling
  useEffect(() => {
    if (selectedPumpId) {
      const loadPump = async () => {
        try {
          const pump = await getPump(selectedPumpId);
          setSelectedPump(pump);
        } catch (err) {
          console.error("Error loading pump details:", err);
          setError("Failed to load pump details.");
        }
      };
      loadPump();
    }
  }, [selectedPumpId]);

  // Load latest reading and historical data with error handling
  useEffect(() => {
    if (selectedPumpId) {
      const loadData = async () => {
        try {
          setLoading(true);
          setError(null);
          const [latest, historical] = await Promise.all([
            getLatestReading(selectedPumpId),
            getReadingsInRange(
              new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              new Date(),
              selectedPumpId
            ),
          ]);
          setLatestReading(latest);
          setHistoricalReadings(historical);
        } catch (err) {
          console.error("Error loading pump data:", err);
          setError("Failed to load pump readings.");
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [selectedPumpId]);

  // Handle pump selection with error handling
  const handlePumpSelect = useCallback((pumpId: string) => {
    try {
      setSelectedPumpId(pumpId);
      setError(null);
    } catch (err) {
      console.error("Error selecting pump:", err);
      setError("Failed to select pump.");
    }
  }, []);

  // Generate predicted reading for tomorrow widget
  const predictedReading: PumpReading | null = latestReading
    ? {
        ...latestReading,
        pressure: latestReading.pressure ? latestReading.pressure * 1.02 : null,
        flow_rate: latestReading.flow_rate ? latestReading.flow_rate * 0.98 : null,
        temperature: latestReading.temperature ? latestReading.temperature + 2 : null,
      }
    : null;

  if (loading && !selectedPumpId) {
    return (
      <div className="space-y-8 animate-fade-in" role="status" aria-label="Loading dashboard">
        <div className="h-9 w-48 bg-muted rounded animate-pulse mb-2" />
        <div className="h-5 w-64 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Error Banner */}
      {error && (
        <div
          className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg"
          role="alert"
          aria-live="polite"
        >
          <p className="text-sm font-medium">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-xs underline mt-1 hover:no-underline"
            aria-label="Dismiss error"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header with Pump Selector */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text-blue">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Real-time pump monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/history">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              History
            </Button>
          </Link>
          <div className="w-64">
            <PumpSelector
              pumps={pumps}
              selectedPumpId={selectedPumpId}
              onSelect={handlePumpSelect}
            />
          </div>
        </div>
      </div>

      {/* Current Pump Overview Widget */}
      <CurrentPumpWidget pump={selectedPump} latestReading={latestReading} />

      {/* Today's Highlights */}
      <div>
        <h2 className="text-xl font-semibold mb-4 gradient-text-indigo">Today&apos;s Highlights</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <HighlightWidget
            title="Flow Rate"
            value={latestReading?.flow_rate ?? 0}
            unit="GPM"
            icon={Wind}
            trend="up"
            trendValue="+2.3%"
          />
          <HighlightWidget
            title="Pressure"
            value={latestReading?.pressure ?? 0}
            unit="PSI"
            icon={Gauge}
            trend="neutral"
          />
          <HighlightWidget
            title="Operating Hours"
            value="14"
            unit="hrs"
            icon={Sunrise}
          />
          <HighlightWidget
            title="Efficiency"
            value="87"
            unit="%"
            icon={Droplets}
            trend="up"
            trendValue="+1.2%"
          />
          <HighlightWidget
            title="System Health"
            value="Good"
            icon={Eye}
          />
          <HighlightWidget
            title="Performance"
            value="Optimal"
            icon={Thermometer}
          />
        </div>
      </div>

      {/* 7-Day Forecast */}
      <div>
        <h2 className="text-xl font-semibold mb-4 gradient-text-indigo">7-Day Forecast</h2>
        <ForecastWidget
          readings={historicalReadings}
          metric="pressure"
          title="Pressure Trend"
          unit="PSI"
        />
      </div>

      {/* Tomorrow Preview and Activity Feed */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div>
          <h2 className="text-xl font-semibold mb-4 gradient-text-indigo">Next Period Preview</h2>
          <TomorrowWidget
            currentReading={latestReading}
            predictedReading={predictedReading}
          />
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4 gradient-text-indigo">Recent Activity</h2>
          <ActivityWidget alerts={alerts} maxItems={5} />
        </div>
      </div>
    </div>
  );
}
