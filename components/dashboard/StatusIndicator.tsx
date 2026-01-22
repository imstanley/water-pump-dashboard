"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { PumpStatus } from "@/types/pump";
import { Activity, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface StatusIndicatorProps {
  status: PumpStatus;
  lastUpdated?: string | null;
}

export const StatusIndicator = ({
  status,
  lastUpdated,
}: StatusIndicatorProps) => {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (status === "running") {
      const interval = setInterval(() => {
        setPulse((p) => !p);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [status]);

  const statusConfig = {
    running: {
      icon: CheckCircle2,
      color: "text-accent-teal",
      bgColor: "bg-accent-teal/20",
      ringColor: "ring-accent-teal/30",
      label: "Running",
      pulse: true,
    },
    stopped: {
      icon: XCircle,
      color: "text-muted-foreground",
      bgColor: "bg-muted/30",
      ringColor: "ring-muted-foreground/20",
      label: "Stopped",
      pulse: false,
    },
    error: {
      icon: AlertCircle,
      color: "text-accent-danger",
      bgColor: "bg-accent-danger/20",
      ringColor: "ring-accent-danger/30",
      label: "Error",
      pulse: true,
    },
    unknown: {
      icon: Activity,
      color: "text-accent-warning",
      bgColor: "bg-accent-warning/20",
      ringColor: "ring-accent-warning/30",
      label: "Unknown",
      pulse: false,
    },
  };

  const config = statusConfig[status] || statusConfig.unknown;
  const Icon = config.icon;
  const shouldPulse = config.pulse && status === "running" && pulse;

  return (
    <Card className="group relative overflow-hidden transition-all duration-400 ease-out hover:shadow-panel glass-panel rounded-xl">
      <CardContent className="pt-6 relative z-10">
        <div className="flex items-center gap-4">
          <div 
            className={`${config.bgColor} p-4 rounded-full transition-all duration-400 ease-out ${
              shouldPulse 
                ? `ring-2 ${config.ringColor} scale-105` 
                : "ring-0 scale-100"
            }`}
          >
            <Icon 
              className={`h-6 w-6 ${config.color} transition-transform duration-400 ease-out ${
                shouldPulse ? "scale-105" : "scale-100"
              }`} 
            />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-muted-foreground mb-1">
              Status
            </div>
            <div className="text-xl font-semibold text-foreground transition-colors duration-300">
              {config.label}
            </div>
            {lastUpdated && (
              <div className="text-xs text-muted-foreground mt-1 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                Last updated: {new Date(lastUpdated).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
