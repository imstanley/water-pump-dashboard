"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Pump } from "@/types/pump";

interface PumpSelectorProps {
  pumps: Pump[];
  selectedPumpId: string | null;
  onSelect: (pumpId: string) => void;
}

export const PumpSelector = ({ pumps, selectedPumpId, onSelect }: PumpSelectorProps) => {
  const selectedPump = pumps.find((p) => p.id === selectedPumpId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <span>{selectedPump?.name || "Select a pump"}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
        {pumps.map((pump) => (
          <DropdownMenuItem
            key={pump.id}
            onClick={() => onSelect(pump.id)}
            className={selectedPumpId === pump.id ? "bg-accent" : ""}
          >
            {pump.name}
            {pump.location && (
              <span className="ml-2 text-xs text-muted-foreground">({pump.location})</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
