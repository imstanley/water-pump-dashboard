"use client";

import { Activity, MapPin, Gauge, Droplets, Thermometer } from "lucide-react";
import type { Pump, PumpReading } from "@/types/pump";
import { StatusIndicator } from "./StatusIndicator";

interface CurrentPumpWidgetProps {
  pump: Pump | null;
  latestReading: PumpReading | null;
}

export const CurrentPumpWidget = ({ pump, latestReading }: CurrentPumpWidgetProps) => {
  if (!pump) {
    return (
      <div className="rounded-xl glass-panel p-8">
        <p className="text-muted-foreground">No pump selected</p>
      </div>
    );
  }

  const mainValue = latestReading?.pressure ?? latestReading?.flow_rate ?? 0;
  const mainUnit = latestReading?.pressure ? "PSI" : latestReading?.flow_rate ? "GPM" : "";

  return (
    <div className="relative overflow-hidden rounded-2xl gradient-bg-blue p-8 text-white transition-all duration-400 ease-out hover:shadow-2xl">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10 mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">{pump.name}</h2>
          {pump.location && (
            <div className="flex items-center gap-1 text-sm text-white/80">
              <MapPin className="h-4 w-4" />
              {pump.location}
            </div>
          )}
        </div>
        <StatusIndicator status={pump.status} />
      </div>

      {latestReading ? (
        <>
          {/* Main metric display */}
          <div className="relative z-10 mb-6">
            <div className="text-sm text-white/70 mb-1">Current Reading</div>
            <div className="text-6xl font-bold">
              {mainValue.toFixed(1)}
              <span className="ml-2 text-3xl font-normal text-white/80">{mainUnit}</span>
            </div>
            <div className="text-sm text-white/70 mt-2">
              {new Date(latestReading.timestamp).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>

          {/* Secondary metrics grid */}
          <div className="relative z-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-xl bg-white/10 backdrop-blur-sm p-4 border border-white/20">
              <div className="mb-2 flex items-center gap-2 text-xs text-white/70">
                <Gauge className="h-3.5 w-3.5" />
                Pressure
              </div>
              <div className="text-xl font-bold text-white">
                {latestReading.pressure?.toFixed(1) ?? "—"}
                <span className="ml-1 text-sm font-normal text-white/70">PSI</span>
              </div>
            </div>

            <div className="rounded-xl bg-white/10 backdrop-blur-sm p-4 border border-white/20">
              <div className="mb-2 flex items-center gap-2 text-xs text-white/70">
                <Droplets className="h-3.5 w-3.5" />
                Flow Rate
              </div>
              <div className="text-xl font-bold text-white">
                {latestReading.flow_rate?.toFixed(1) ?? "—"}
                <span className="ml-1 text-sm font-normal text-white/70">GPM</span>
              </div>
            </div>

            <div className="rounded-xl bg-white/10 backdrop-blur-sm p-4 border border-white/20">
              <div className="mb-2 flex items-center gap-2 text-xs text-white/70">
                <Thermometer className="h-3.5 w-3.5" />
                Temperature
              </div>
              <div className="text-xl font-bold text-white">
                {latestReading.temperature?.toFixed(1) ?? "—"}
                <span className="ml-1 text-sm font-normal text-white/70">°F</span>
              </div>
            </div>

            <div className="rounded-xl bg-white/10 backdrop-blur-sm p-4 border border-white/20">
              <div className="mb-2 flex items-center gap-2 text-xs text-white/70">
                <Activity className="h-3.5 w-3.5" />
                Power
              </div>
              <div className="text-xl font-bold text-white">
                {latestReading.power_consumption?.toFixed(0) ?? "—"}
                <span className="ml-1 text-sm font-normal text-white/70">W</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="relative z-10 rounded-xl bg-white/10 backdrop-blur-sm p-12 text-center text-white/70 border border-white/20">
          No readings available
        </div>
      )}
    </div>
  );
};
