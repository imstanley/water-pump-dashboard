"use client";

import { MapPin, Edit, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Pump, PumpReading } from "@/types/pump";

interface PumpCardProps {
  pump: Pump;
  latestReading?: PumpReading | null;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  selected?: boolean;
  loading?: boolean;
}

export const PumpCard = ({ 
  pump, 
  latestReading, 
  onSelect, 
  onEdit, 
  onDelete, 
  selected,
  loading = false 
}: PumpCardProps) => {
  const getStatusStyles = () => {
    switch (pump.status) {
      case "running":
        return {
          dot: "bg-green-500",
          border: "border-2 border-green-200 dark:border-green-800",
          bg: "bg-green-100 dark:bg-green-950/30",
          gradient: "from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40",
        };
      case "stopped":
        return {
          dot: "bg-blue-500",
          border: "border-2 border-blue-200 dark:border-blue-800",
          bg: "bg-blue-100 dark:bg-blue-950/30",
          gradient: "from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40",
        };
      case "error":
        return {
          dot: "bg-red-500",
          border: "border-2 border-red-500 dark:border-red-500",
          bg: "bg-red-100 dark:bg-red-950/30 shadow-red-500/20",
          gradient: "from-red-50 to-rose-50 dark:from-red-950/40 dark:to-rose-950/40",
        };
      default:
        return {
          dot: "bg-gray-500",
          border: "border-2 border-gray-200 dark:border-gray-700",
          bg: "bg-gray-100 dark:bg-gray-950/30",
          gradient: "from-gray-50 to-slate-50 dark:from-gray-950/40 dark:to-slate-950/40",
        };
    }
  };

  const styles = getStatusStyles();
  const isAlert = pump.status === "error";

  // Format last seen time
  const formatLastSeen = (timestamp: string) => {
    const date = new Date(timestamp);
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

  const pressure = latestReading?.pressure ?? null;
  const flowRate = latestReading?.flow_rate ?? null;
  const lastSeen = latestReading?.timestamp ?? pump.updated_at;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl transition-all duration-400 ease-out cursor-pointer min-h-[180px]",
        "hover:shadow-elevated active:scale-[0.98]",
        styles.border,
        `bg-gradient-to-br ${styles.gradient}`,
        selected && "ring-2 ring-primary/50 shadow-elevated scale-[1.02]"
      )}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.();
        }
      }}
      aria-label={`Pump ${pump.name}, status: ${pump.status}`}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 dark:bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 dark:bg-white/3 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10 p-5 h-full flex flex-col">
        {/* Header with status dot, name, and action buttons */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", styles.dot)} aria-hidden="true" />
            <h3 className="font-bold text-base truncate leading-tight">{pump.name}</h3>
            {isAlert && (
              <div className="flex-shrink-0 flex items-center gap-1 text-red-600 dark:text-red-400">
                <AlertCircle className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
          
          {/* Action buttons - subtle icon-only */}
          <div className="flex items-center gap-1 flex-shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="h-7 w-7 p-0 hover:bg-accent/50"
                aria-label="Edit pump"
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="h-7 w-7 p-0 hover:bg-destructive/20 hover:text-destructive"
                aria-label="Delete pump"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Metrics Section */}
        <div className="grid grid-cols-2 gap-3 mb-3 flex-1">
          <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-xs text-muted-foreground mb-1">Flow</div>
            {loading ? (
              <div className="h-6 w-12 bg-muted rounded animate-pulse" />
            ) : (
              <div className="text-lg font-semibold">
                {flowRate !== null ? (
                  <>
                    {flowRate.toFixed(0)}
                    <span className="text-xs font-normal text-muted-foreground ml-0.5">GPM</span>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">N/A</span>
                )}
              </div>
            )}
          </div>
          <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-xs text-muted-foreground mb-1">Pressure</div>
            {loading ? (
              <div className="h-6 w-12 bg-muted rounded animate-pulse" />
            ) : (
              <div className="text-lg font-semibold">
                {pressure !== null ? (
                  <>
                    {pressure.toFixed(1)}
                    <span className="text-xs font-normal text-muted-foreground ml-0.5">PSI</span>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">N/A</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer - Location and last seen */}
        <div className="flex items-center justify-between text-xs text-muted-foreground gap-2 pt-2 border-t border-white/20 dark:border-white/10">
          {pump.location && (
            <div className="flex items-center gap-1 truncate min-w-0 flex-1">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{pump.location}</span>
            </div>
          )}
          <div className="flex-shrink-0 whitespace-nowrap">
            {lastSeen ? formatLastSeen(lastSeen) : "Never"}
          </div>
        </div>
      </div>
    </div>
  );
};
