"use client";

import { useState, useEffect, useMemo } from "react";
import { getPumps, deletePump, createPump, updatePump, getPump } from "@/lib/api/pumps";
import { getLatestReading } from "@/lib/api/pumpApi";
import { PumpCard } from "@/components/pumps/PumpCard";
import { PumpForm } from "@/components/pumps/PumpForm";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { Pump, PumpReading } from "@/types/pump";

interface PumpWithReading extends Pump {
  latestReading?: PumpReading | null;
  loading?: boolean;
}

export default function PumpsPage() {
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [pumpReadings, setPumpReadings] = useState<Record<string, PumpReading | null>>({});
  const [loadingReadings, setLoadingReadings] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [selectedPumpId, setSelectedPumpId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPump, setEditingPump] = useState<Pump | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadPumps();
  }, []);

  // Load latest readings for all pumps
  useEffect(() => {
    if (pumps.length > 0) {
      loadPumpReadings();
    }
  }, [pumps]);

  const loadPumps = async () => {
    setLoading(true);
    const allPumps = await getPumps();
    setPumps(allPumps);
    setLoading(false);
  };

  const loadPumpReadings = async () => {
    // Set loading state for all pumps
    const loadingState: Record<string, boolean> = {};
    pumps.forEach((pump) => {
      loadingState[pump.id] = true;
    });
    setLoadingReadings(loadingState);

    // Fetch readings for all pumps in parallel
    const readingPromises = pumps.map(async (pump) => {
      try {
        const reading = await getLatestReading(pump.id);
        return { pumpId: pump.id, reading };
      } catch (error) {
        console.error(`Error loading reading for pump ${pump.id}:`, error);
        return { pumpId: pump.id, reading: null };
      }
    });

    const results = await Promise.all(readingPromises);
    const readingsMap: Record<string, PumpReading | null> = {};
    const newLoadingState: Record<string, boolean> = {};

    results.forEach(({ pumpId, reading }) => {
      readingsMap[pumpId] = reading;
      newLoadingState[pumpId] = false;
    });

    setPumpReadings(readingsMap);
    setLoadingReadings(newLoadingState);
  };

  const handleDelete = async (pumpId: string) => {
    if (confirm("Are you sure you want to delete this pump?")) {
      const success = await deletePump(pumpId);
      if (success) {
        setPumps(pumps.filter((p) => p.id !== pumpId));
        if (selectedPumpId === pumpId) {
          setSelectedPumpId(null);
        }
        // Remove reading from state
        const newReadings = { ...pumpReadings };
        delete newReadings[pumpId];
        setPumpReadings(newReadings);
      }
    }
  };

  const handleAddPump = () => {
    setEditingPump(null);
    setIsModalOpen(true);
  };

  const handleEditPump = async (pumpId: string) => {
    const pump = await getPump(pumpId);
    if (pump) {
      setEditingPump(pump);
      setIsModalOpen(true);
    }
  };

  const handleFormSubmit = async (
    data: Omit<Pump, "id" | "created_at" | "updated_at">
  ) => {
    setFormLoading(true);
    try {
      if (editingPump) {
        // Update existing pump
        const updated = await updatePump(editingPump.id, data);
        if (updated) {
          setPumps(pumps.map((p) => (p.id === updated.id ? updated : p)));
          setIsModalOpen(false);
          setEditingPump(null);
          // Reload readings for updated pump
          const reading = await getLatestReading(updated.id);
          setPumpReadings({ ...pumpReadings, [updated.id]: reading });
        }
      } else {
        // Create new pump
        const newPump = await createPump(data);
        if (newPump) {
          setPumps([newPump, ...pumps]);
          setIsModalOpen(false);
          setEditingPump(null);
          // Load reading for new pump
          const reading = await getLatestReading(newPump.id);
          setPumpReadings({ ...pumpReadings, [newPump.id]: reading });
        }
      }
    } catch (error) {
      console.error("Error saving pump:", error);
      alert("Failed to save pump. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingPump(null);
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-9 w-48 bg-muted rounded animate-pulse mb-2" />
            <div className="h-5 w-64 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl glass-panel p-5 h-[180px] animate-pulse">
              <div className="h-6 w-32 bg-muted rounded mb-3" />
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="h-16 bg-muted rounded" />
                <div className="h-16 bg-muted rounded" />
              </div>
              <div className="h-4 w-24 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text-blue">Pumps</h1>
          <p className="text-muted-foreground mt-1">Manage your irrigation pumps</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/overview">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Overview
            </Button>
          </Link>
          <Button onClick={handleAddPump}>
            <Plus className="mr-2 h-4 w-4" />
            Add Pump
          </Button>
        </div>
      </div>

      {/* Pumps Grid */}
      <div>
        {pumps.length === 0 ? (
          <div className="rounded-xl glass-panel p-12 text-center">
            <p className="text-muted-foreground mb-4">No pumps configured</p>
            <Button onClick={handleAddPump}>
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
                latestReading={pumpReadings[pump.id]}
                loading={loadingReadings[pump.id]}
                onSelect={() => setSelectedPumpId(pump.id)}
                onEdit={() => handleEditPump(pump.id)}
                onDelete={() => handleDelete(pump.id)}
                selected={pump.id === selectedPumpId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Pump Modal */}
      <Dialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={editingPump ? "Edit Pump" : "Add New Pump"}
        description={
          editingPump
            ? "Update pump information and configuration"
            : "Create a new pump to monitor and control"
        }
      >
        <PumpForm
          pump={editingPump}
          onSubmit={handleFormSubmit}
          onCancel={handleModalClose}
          loading={formLoading}
        />
      </Dialog>
    </div>
  );
}
