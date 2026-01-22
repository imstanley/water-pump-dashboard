"use client";

import { useState, useEffect } from "react";
import { getPumps, deletePump } from "@/lib/api/pumps";
import { PumpCard } from "@/components/pumps/PumpCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Pump } from "@/types/pump";

export default function PumpsPage() {
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPumpId, setSelectedPumpId] = useState<string | null>(null);

  useEffect(() => {
    loadPumps();
  }, []);

  const loadPumps = async () => {
    setLoading(true);
    const allPumps = await getPumps();
    setPumps(allPumps);
    setLoading(false);
  };

  const handleDelete = async (pumpId: string) => {
    if (confirm("Are you sure you want to delete this pump?")) {
      const success = await deletePump(pumpId);
      if (success) {
        setPumps(pumps.filter((p) => p.id !== pumpId));
        if (selectedPumpId === pumpId) {
          setSelectedPumpId(null);
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-9 w-48 bg-muted rounded animate-pulse mb-2" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pumps</h1>
          <p className="text-muted-foreground mt-1">Manage your irrigation pumps</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Pump
        </Button>
      </div>

      {/* Pumps Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">All Pumps</h2>
        {pumps.length === 0 ? (
          <div className="rounded-xl glass-panel p-12 text-center">
            <p className="text-muted-foreground mb-4">No pumps configured</p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Pump
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pumps.map((pump) => (
              <PumpCard
                key={pump.id}
                pump={pump}
                onSelect={() => setSelectedPumpId(pump.id)}
                onDelete={() => handleDelete(pump.id)}
                selected={pump.id === selectedPumpId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
