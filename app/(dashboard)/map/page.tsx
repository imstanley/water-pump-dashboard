"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { X } from "lucide-react";
import { PumpOverviewCard } from "@/components/pumps/PumpOverviewCard";

const PumpMap = dynamic(() => import("@/components/map/PumpMap").then((m) => ({ default: m.PumpMap })), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-xl bg-muted/30" role="status" aria-label="Loading map">
      <span className="text-muted-foreground text-sm">Loading map…</span>
    </div>
  ),
});

import { generateDemoPumps, simulateTick, type DemoPumpData } from "@/lib/demo/pumpGenerator";
import { useInterval } from "@/hooks/useInterval";
import { Button } from "@/components/ui/button";
import { getPumps } from "@/lib/api/pumps";
import { isDemoModeSync } from "@/lib/demo/isDemoMode";
import type { Pump } from "@/types/pump";

export default function MapPage() {
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [selectedPumpId, setSelectedPumpId] = useState<string | null>(null);
  const [demoPumpData, setDemoPumpData] = useState<DemoPumpData[]>([]);
  const isDemo = isDemoModeSync();

  // Load pumps
  useEffect(() => {
    const loadPumps = async () => {
      const allPumps = await getPumps();
      setPumps(allPumps);

      // If demo mode, also maintain demo pump data for metrics
      if (isDemo) {
        const demoPumps = generateDemoPumps(25, "florida-v1");
        setDemoPumpData(demoPumps);
      }
    };
    loadPumps();
  }, [isDemo]);

  // Simulate tick for demo mode
  useInterval(() => {
    if (isDemo && demoPumpData.length > 0) {
      setDemoPumpData((current) => simulateTick([...current]));
      // Also update the pumps array with new statuses
      setPumps((currentPumps) => {
        const updated = currentPumps.map((pump) => {
          const demoData = demoPumpData.find((d) => d.id === pump.id);
          if (demoData) {
            return { ...pump, status: demoData.status };
          }
          return pump;
        });
        return updated;
      });
    }
  }, 2500);

  // Get selected pump data
  const selectedPump = useMemo(() => {
    if (!selectedPumpId) return null;
    const pump = pumps.find((p) => p.id === selectedPumpId);
    if (!pump) return null;

    // If demo mode, get metrics from demo data
    if (isDemo) {
      const demoData = demoPumpData.find((d) => d.id === pump.id);
      if (demoData) {
        return {
          id: pump.id,
          name: pump.name,
          status: demoData.status,
          pressure: demoData.pressure,
          flowRate: demoData.flowRate,
          lastSeen: demoData.lastSeen,
          location: demoData.location,
          controllerId: demoData.controllerId,
        };
      }
    }

    // Fallback for non-demo or if demo data not found
    return {
      id: pump.id,
      name: pump.name,
      status: pump.status,
      pressure: 0,
      flowRate: 0,
      lastSeen: pump.updated_at,
      location: pump.location,
    };
  }, [selectedPumpId, pumps, demoPumpData, isDemo]);

  const handlePumpSelect = (pumpId: string) => {
    setSelectedPumpId(pumpId);
  };

  const handleClosePanel = () => {
    setSelectedPumpId(null);
  };

  return (
    <div className="fixed inset-0 animate-fade-in z-0">
      {/* Map */}
      <div className="absolute inset-0">
        <PumpMap
          pumps={pumps}
          selectedPumpId={selectedPumpId}
          onPumpSelect={handlePumpSelect}
          height="100%"
          className="rounded-none"
        />
      </div>

      {/* Side Panel */}
      {selectedPump && (
        <>
          {/* Mobile Overlay */}
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-[1001]"
            onClick={handleClosePanel}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-14 bottom-0 w-full sm:w-96 max-w-sm bg-background/95 backdrop-blur-sm border-l border-border shadow-elevated z-[1002] overflow-y-auto">
            <div className="p-4 sm:p-6 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold">Pump Details</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClosePanel}
                  aria-label="Close panel"
                  className="min-h-[44px] min-w-[44px]"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Pump Card */}
              <PumpOverviewCard 
                pump={{
                  ...selectedPump,
                  location: selectedPump.location ?? undefined,
                }} 
                selected={true} 
              />

              {/* Additional Details */}
              <div className="space-y-3 pt-4 border-t border-border">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Controller ID</div>
                  <div className="text-sm font-medium break-all">{selectedPump.controllerId || "N/A"}</div>
                </div>
                {selectedPump.location && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Location</div>
                    <div className="text-sm font-medium">{selectedPump.location}</div>
                  </div>
                )}
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Status</div>
                  <div className="text-sm font-medium capitalize">{selectedPump.status}</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Info Overlay */}
      <div className="absolute top-16 sm:top-18 left-2 sm:left-4 z-[999] bg-background/95 backdrop-blur-sm rounded-lg p-2 sm:p-3 shadow-elevated max-w-[calc(100%-1rem)] sm:max-w-none">
        <div className="text-xs sm:text-sm font-medium mb-0.5 sm:mb-1">Pump Map</div>
        <div className="text-xs text-muted-foreground">
          {pumps.length} pump{pumps.length !== 1 ? "s" : ""} • Tap marker for details
        </div>
      </div>
    </div>
  );
}
