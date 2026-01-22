"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PumpOverviewCard } from "@/components/pumps/PumpOverviewCard";
import { generateDemoPumps, simulateTick, demoPumpToPump, type DemoPumpData } from "@/lib/demo/pumpGenerator";
import { useInterval } from "@/hooks/useInterval";
import { useRouter } from "next/navigation";
import type { PumpStatus } from "@/types/pump";

type StatusFilter = "all" | "running" | "stopped" | "error";

export default function OverviewPage() {
  const router = useRouter();
  const [pumps, setPumps] = useState<DemoPumpData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedPumpId, setSelectedPumpId] = useState<string | null>(null);

  // Initialize pumps on mount
  useEffect(() => {
    const initialPumps = generateDemoPumps(25, "florida-v1");
    setPumps(initialPumps);
  }, []);

  // Simulate tick every 2.5 seconds
  useInterval(() => {
    setPumps((currentPumps) => {
      if (currentPumps.length === 0) return currentPumps;
      return simulateTick([...currentPumps]);
    });
  }, 2500);

  // Filter pumps based on search and status
  const filteredPumps = useMemo(() => {
    return pumps.filter((pump) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        pump.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pump.controllerId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pump.location?.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "running" && pump.status === "running") ||
        (statusFilter === "stopped" && pump.status === "stopped") ||
        (statusFilter === "error" && pump.status === "error");

      return matchesSearch && matchesStatus;
    });
  }, [pumps, searchQuery, statusFilter]);

  // Handle pump card click
  const handlePumpClick = useCallback(
    (pumpId: string) => {
      setSelectedPumpId(pumpId);
      // Navigate to pump detail or open drawer
      router.push(`/pumps?selected=${pumpId}`);
    },
    [router]
  );

  // Status filter options
  const statusFilters: { value: StatusFilter; label: string; count: number }[] = [
    { value: "all", label: "All", count: pumps.length },
    {
      value: "running",
      label: "Running",
      count: pumps.filter((p) => p.status === "running").length,
    },
    {
      value: "stopped",
      label: "Stopped",
      count: pumps.filter((p) => p.status === "stopped").length,
    },
    {
      value: "error",
      label: "Alerts",
      count: pumps.filter((p) => p.status === "error").length,
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text-blue">Pump Overview</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">Monitor all pumps at a glance</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search pumps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 text-base"
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="flex items-center gap-2 flex-wrap">
            {statusFilters.map((filter) => (
              <Button
                key={filter.value}
                variant={statusFilter === filter.value ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(filter.value)}
                className="text-xs min-h-[36px] px-3"
              >
                {filter.label}
                {filter.count > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-primary/20 text-xs">
                    {filter.count}
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Pumps Grid */}
      <div>
        {filteredPumps.length === 0 ? (
          <div className="rounded-xl glass-panel p-8 sm:p-12 text-center">
            <p className="text-muted-foreground mb-2">No pumps found</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "No pumps available"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
            {filteredPumps.map((pump) => (
              <PumpOverviewCard
                key={pump.id}
                pump={{
                  id: pump.id,
                  name: pump.name,
                  status: pump.status,
                  pressure: pump.pressure,
                  flowRate: pump.flowRate,
                  lastSeen: pump.lastSeen,
                  location: pump.location,
                  controllerId: pump.controllerId,
                }}
                selected={selectedPumpId === pump.id}
                onClick={() => handlePumpClick(pump.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
        <span>
          Showing {filteredPumps.length} of {pumps.length} pumps
        </span>
        {pumps.filter((p) => p.status === "error").length > 0 && (
          <span className="text-red-600 dark:text-red-400 font-medium">
            {pumps.filter((p) => p.status === "error").length} alert
            {pumps.filter((p) => p.status === "error").length !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
}
