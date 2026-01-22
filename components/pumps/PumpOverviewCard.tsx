"use client";

import { memo } from "react";
import { MapPin, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PumpStatus } from "@/types/pump";

export interface PumpOverviewCardData {
  id: string;
  name: string;
  status: PumpStatus;
  pressure: number;
  flowRate: number;
  lastSeen: string;
  location?: string;
  controllerId?: string;
}

interface PumpOverviewCardProps {
  pump: PumpOverviewCardData;
  selected?: boolean;
  onClick?: () => void;
}

const PumpOverviewCardComponent = ({ pump, selected, onClick }: PumpOverviewCardProps) => {
  const getStatusStyles = () => {
    switch (pump.status) {
      case "running":
        return {
          dot: "bg-green-500",
          border: "border-2 border-green-200 dark:border-green-800",
          bg: "bg-green-100 dark:bg-green-950/30",
        };
      case "stopped":
        return {
          dot: "bg-blue-500",
          border: "border-2 border-blue-200 dark:border-blue-800",
          bg: "bg-blue-100 dark:bg-blue-950/30",
        };
      case "error":
        return {
          dot: "bg-red-500",
          border: "border-2 border-red-500 dark:border-red-500",
          bg: "bg-red-100 dark:bg-red-950/30 shadow-red-500/20",
        };
      default:
        return {
          dot: "bg-gray-500",
          border: "border-2 border-gray-200 dark:border-gray-700",
          bg: "bg-gray-100 dark:bg-gray-950/30",
        };
    }
  };

  const styles = getStatusStyles();
  const isAlert = pump.status === "error";

  // Format last seen time
  const formatLastSeen = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div
      className={cn(
        "rounded-lg p-3 sm:p-3 transition-all duration-200 cursor-pointer min-h-[120px] sm:min-h-[110px]",
        "active:scale-[0.98] touch-manipulation",
        styles.bg,
        styles.border,
        selected && "ring-2 ring-primary/50 shadow-elevated",
        onClick && "hover:shadow-panel"
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      aria-label={`Pump ${pump.name}, status: ${pump.status}`}
    >
      {/* Header with status dot and name */}
      <div className="flex items-start justify-between mb-2 sm:mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className={cn("w-2.5 h-2.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0", styles.dot)} aria-hidden="true" />
          <h3 className="text-sm sm:text-sm font-bold truncate leading-tight">{pump.name}</h3>
          {isAlert && (
            <div className="flex-shrink-0 flex items-center gap-1 text-red-600 dark:text-red-400">
              <AlertCircle className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
              <span className="text-xs font-semibold hidden sm:inline">ALERT</span>
            </div>
          )}
        </div>
      </div>

      {/* Metrics - GPM and PSI */}
      <div className="grid grid-cols-2 gap-2 sm:gap-2 mb-2 sm:mb-2">
        <div>
          <div className="text-xs text-muted-foreground mb-0.5 sm:mb-0.5">Flow</div>
          <div className="text-base sm:text-lg font-semibold">
            {pump.flowRate.toFixed(0)}
            <span className="text-xs font-normal text-muted-foreground ml-0.5">GPM</span>
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-0.5 sm:mb-0.5">Pressure</div>
          <div className="text-base sm:text-lg font-semibold">
            {pump.pressure.toFixed(1)}
            <span className="text-xs font-normal text-muted-foreground ml-0.5">PSI</span>
          </div>
        </div>
      </div>

      {/* Footer - Location and last seen */}
      <div className="flex items-center justify-between text-xs text-muted-foreground gap-2">
        {pump.location && (
          <div className="flex items-center gap-1 truncate min-w-0 flex-1">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="truncate text-xs">{pump.location}</span>
          </div>
        )}
        <div className="flex-shrink-0 text-xs whitespace-nowrap">{formatLastSeen(pump.lastSeen)}</div>
      </div>
    </div>
  );
};

// Memoize to prevent unnecessary re-renders
export const PumpOverviewCard = memo(PumpOverviewCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.pump.id === nextProps.pump.id &&
    prevProps.pump.status === nextProps.pump.status &&
    prevProps.pump.pressure === nextProps.pump.pressure &&
    prevProps.pump.flowRate === nextProps.pump.flowRate &&
    prevProps.pump.lastSeen === nextProps.pump.lastSeen &&
    prevProps.selected === nextProps.selected
  );
});

PumpOverviewCard.displayName = "PumpOverviewCard";
