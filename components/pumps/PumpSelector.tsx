"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Pump } from "@/types/pump";

interface PumpSelectorProps {
  pumps: Pump[];
  selectedPumpId: string | null;
  onSelect: (pumpId: string) => void;
}

export const PumpSelector = ({ pumps, selectedPumpId, onSelect }: PumpSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [listMaxHeight, setListMaxHeight] = useState<number | undefined>(undefined);

  const selectedPump = pumps.find((p) => p.id === selectedPumpId);

  const filtered = query.trim()
    ? pumps.filter((p) => {
        const q = query.toLowerCase();
        return (
          p.name?.toLowerCase().includes(q) ||
          p.location?.toLowerCase().includes(q) ||
          p.status?.toLowerCase().includes(q)
        );
      })
    : pumps;

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        if (panelRef.current) {
          const panelRect = panelRef.current.getBoundingClientRect();
          const searchBarHeight = panelRef.current.querySelector("[data-search-bar]")?.getBoundingClientRect().height ?? 0;
          const padding = 8;
          const available = window.innerHeight - panelRect.top - searchBarHeight - padding;
          setListMaxHeight(Math.max(available, 120));
        }
      });
    } else {
      setQuery("");
      setListMaxHeight(undefined);
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) setOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="outline"
        className="w-full justify-between"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="truncate">{selectedPump?.name || "Select a pump"}</span>
        <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${open ? "rotate-180" : ""}`} />
      </Button>

      {open && (
        <div ref={panelRef} className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
          <div data-search-bar className="flex items-center border-b px-2 py-1.5">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pumps…"
              className="flex-1 bg-transparent px-2 py-1 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="overflow-y-auto p-1" style={listMaxHeight ? { maxHeight: listMaxHeight } : { maxHeight: 240 }}>
            {filtered.length === 0 ? (
              <div className="px-2 py-3 text-center text-sm text-muted-foreground">
                No pumps found
              </div>
            ) : (
              filtered.map((pump) => (
                <div
                  key={pump.id}
                  className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                    selectedPumpId === pump.id ? "bg-accent" : ""
                  }`}
                  onClick={() => {
                    onSelect(pump.id);
                    setOpen(false);
                  }}
                >
                  {pump.name}
                  {pump.location && (
                    <span className="ml-2 text-xs text-muted-foreground">({pump.location})</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
