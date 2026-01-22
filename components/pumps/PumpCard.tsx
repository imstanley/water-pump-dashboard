"use client";

import { MapPin, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/dashboard/StatusIndicator";
import { cn } from "@/lib/utils";
import type { Pump } from "@/types/pump";

interface PumpCardProps {
  pump: Pump;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  selected?: boolean;
}

export const PumpCard = ({ pump, onSelect, onEdit, onDelete, selected }: PumpCardProps) => {
  return (
    <div
      className={cn(
        "rounded-xl glass-panel p-6 transition-all duration-400 ease-out hover:shadow-panel cursor-pointer",
        selected && "shadow-elevated ring-2 ring-primary/30"
      )}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">{pump.name}</h3>
          {pump.location && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {pump.location}
            </div>
          )}
        </div>
        <StatusIndicator status={pump.status} />
      </div>

      <div className="flex items-center gap-2 mt-4">
        {onEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="flex-1"
          >
            <Edit className="mr-2 h-3 w-3" />
            Edit
          </Button>
        )}
        {onDelete && (
          <Button
            variant="destructive"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="flex-1"
          >
            <Trash2 className="mr-2 h-3 w-3" />
            Delete
          </Button>
        )}
      </div>
    </div>
  );
};
