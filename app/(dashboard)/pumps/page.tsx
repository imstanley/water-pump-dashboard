"use client";

import { useState, useEffect, useMemo } from "react";
import { getPumps, deletePump, createPump, updatePump, getPump } from "@/lib/api/pumps";
import { getLatestReading } from "@/lib/api/pumpApi";
import { PumpCard } from "@/components/pumps/PumpCard";
import { PumpForm } from "@/components/pumps/PumpForm";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, ExternalLink, Search, AlertTriangle, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Pump | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [statusFilters, setStatusFilters] = useState<Set<string>>(new Set());

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

  const handleDeleteRequest = (pumpId: string) => {
    const pump = pumps.find((p) => p.id === pumpId);
    if (pump) setDeleteTarget(pump);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const success = await deletePump(deleteTarget.id);
      if (success) {
        setPumps(pumps.filter((p) => p.id !== deleteTarget.id));
        if (selectedPumpId === deleteTarget.id) {
          setSelectedPumpId(null);
        }
        const newReadings = { ...pumpReadings };
        delete newReadings[deleteTarget.id];
        setPumpReadings(newReadings);
      }
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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

      {/* Search, Filters + Pumps Grid */}
      <div className="space-y-4">
        {pumps.length > 0 && (
          <>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="relative max-w-sm flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search pumps…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>

              {/* Status filter pills */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
              {(
                [
                  { key: "all", label: "All", dot: "" },
                  { key: "running", label: "Running", dot: "bg-blue-500" },
                  { key: "stopped", label: "Stopped", dot: "bg-orange-500" },
                  { key: "error", label: "Error", dot: "bg-red-500" },
                ] as const
              ).map(({ key, label, dot }) => {
                const count =
                  key === "all"
                    ? pumps.length
                    : pumps.filter((p) => p.status === key).length;
                const allActive = statusFilters.size === 0;
                const active = key === "all" ? allActive : statusFilters.has(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      if (key === "all") {
                        setStatusFilters(new Set());
                      } else {
                        setStatusFilters((prev) => {
                          const next = new Set(prev);
                          if (next.has(key)) {
                            next.delete(key);
                          } else {
                            next.add(key);
                          }
                          if (next.size === 3) return new Set();
                          return next;
                        });
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {!active && dot && <span className={`inline-block h-2 w-2 rounded-full ${dot}`} />}
                    {label}
                    <span className={`text-xs ${active ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
              </div>
            </div>
          </>
        )}

        {pumps.length === 0 ? (
          <div className="rounded-xl glass-panel p-12 text-center">
            <p className="text-muted-foreground mb-4">No pumps configured</p>
            <Button onClick={handleAddPump}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Pump
            </Button>
          </div>
        ) : (
          (() => {
            const q = searchQuery.toLowerCase().trim();
            const filtered = pumps.filter((pump) => {
              if (statusFilters.size > 0 && !statusFilters.has(pump.status)) return false;
              if (q) {
                return (
                  pump.name?.toLowerCase().includes(q) ||
                  pump.location?.toLowerCase().includes(q) ||
                  pump.status?.toLowerCase().includes(q)
                );
              }
              return true;
            });

            return filtered.length === 0 ? (
              <div className="rounded-xl glass-panel p-12 text-center">
                <p className="text-muted-foreground">
                  No pumps match your {statusFilters.size > 0 ? "filter" : "search"}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {filtered.map((pump) => (
                  <PumpCard
                    key={pump.id}
                    pump={pump}
                    latestReading={pumpReadings[pump.id]}
                    loading={loadingReadings[pump.id]}
                    onSelect={() => setSelectedPumpId(pump.id)}
                    onEdit={() => handleEditPump(pump.id)}
                    onDelete={() => handleDeleteRequest(pump.id)}
                    selected={pump.id === selectedPumpId}
                  />
                ))}
              </div>
            );
          })()
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

      {/* Delete Confirmation Modal */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Delete Pump"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <p className="text-sm">
              Are you sure you want to delete <span className="font-semibold">{deleteTarget?.name}</span>?
            </p>
            <p className="text-xs text-muted-foreground mt-1">This action cannot be undone.</p>
          </div>
          <div className="flex items-center gap-2 w-full">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
