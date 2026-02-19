"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin, Edit, Trash2, XCircle, CheckCircle2, PauseCircle, HelpCircle, MoreVertical } from "lucide-react";
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

const statusConfig = {
  running: {
    label: "Running",
    icon: CheckCircle2,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  stopped: {
    label: "Stopped",
    icon: PauseCircle,
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-950/30",
  },
  error: {
    label: "Error",
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-950/30",
  },
  unknown: {
    label: "Unknown",
    icon: HelpCircle,
    color: "text-gray-400",
    bg: "bg-gray-50 dark:bg-gray-800/30",
  },
} as const;

export const PumpCard = ({
  pump,
  latestReading,
  onSelect,
  onEdit,
  onDelete,
  selected,
  loading = false,
}: PumpCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const status = statusConfig[pump.status as keyof typeof statusConfig] ?? statusConfig.unknown;
  const StatusIcon = status.icon;

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

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
        "relative rounded-xl glass-panel transition-all duration-300 ease-out cursor-pointer min-h-[180px] max-w-sm",
        "hover:shadow-elevated active:scale-[0.98]",
        selected && "ring-2 ring-primary/50 shadow-elevated"
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
      <div className="p-5 h-full flex flex-col">
        {/* Header: name + location on left, ellipsis menu on right */}
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-base truncate leading-tight">{pump.name}</h3>
            {pump.location && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{pump.location}</span>
              </div>
            )}
          </div>

          {/* Ellipsis menu */}
          {(onEdit || onDelete) && (
            <div ref={menuRef} className="relative shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-accent/60 transition-colors"
                aria-label="Pump actions"
              >
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-8 z-50 min-w-[120px] rounded-md border bg-popover text-popover-foreground shadow-md p-1">
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => { setMenuOpen(false); onEdit(); }}
                      className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => { setMenuOpen(false); onDelete(); }}
                      className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status badge */}
        <div className={cn("inline-flex items-center gap-2 rounded-lg px-3 py-2 mb-3 self-end", status.bg)}>
          <StatusIcon className={cn("h-5 w-5", status.color)} />
          <div>
            <div className="text-[10px] leading-tight text-muted-foreground">Status</div>
            <div className={cn("text-sm font-semibold leading-tight", status.color)}>{status.label}</div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-3 flex-1">
          <div className="bg-muted/50 rounded-lg p-3">
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
          <div className="bg-muted/50 rounded-lg p-3">
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

        {/* Footer */}
        <div className="flex items-center justify-end text-xs text-muted-foreground pt-2 border-t border-border">
          <span>{lastSeen ? formatLastSeen(lastSeen) : "Never"}</span>
        </div>
      </div>
    </div>
  );
};
