"use client";

import { useState, useEffect, useMemo } from "react";
import { usePumpAlerts } from "@/hooks/usePumpAlerts";
import { AlertList } from "@/components/alerts/AlertList";
import { PumpSelector } from "@/components/pumps/PumpSelector";
import { getPumps } from "@/lib/api/pumps";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { Pump } from "@/types/pump";

export default function AlertsPage() {
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [selectedPumpId, setSelectedPumpId] = useState<string | null>(null);
  const [showAcknowledged, setShowAcknowledged] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<"all" | "critical" | "warning">("all");
  const { alerts, loading, acknowledgeAlert } = usePumpAlerts(
    selectedPumpId ?? undefined,
    showAcknowledged ? undefined : false
  );

  useEffect(() => {
    const loadPumps = async () => {
      const allPumps = await getPumps();
      setPumps(allPumps);
    };
    loadPumps();
  }, []);

  const pumpNames = useMemo(() => {
    const map: Record<string, string> = {};
    pumps.forEach((p) => { map[p.id] = p.name; });
    return map;
  }, [pumps]);

  const pumpFiltered = selectedPumpId
    ? alerts.filter((a) => a.pump_id === selectedPumpId)
    : alerts;

  const unacknowledgedCount = pumpFiltered.filter((a) => !a.acknowledged).length;
  const criticalCount = pumpFiltered.filter(
    (a) => !a.acknowledged && a.severity === "critical"
  ).length;
  const warningCount = pumpFiltered.filter(
    (a) => !a.acknowledged && a.severity === "warning"
  ).length;

  const filteredAlerts = severityFilter === "all"
    ? pumpFiltered
    : pumpFiltered.filter((a) => a.severity === severityFilter);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text-blue">Alerts</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage pump system alerts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-64">
            <PumpSelector
              pumps={[{ id: "", name: "All Pumps", status: "unknown", location: null, latitude: null, longitude: null, api_endpoint: null, api_key: null, created_by: null, created_at: "", updated_at: "" } as Pump, ...pumps]}
              selectedPumpId={selectedPumpId ?? ""}
              onSelect={(id) => setSelectedPumpId(id || null)}
            />
          </div>
          <Link href="/pumps">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Pumps
            </Button>
          </Link>
          <Button
            variant={showAcknowledged ? "default" : "outline"}
            onClick={() => setShowAcknowledged(!showAcknowledged)}
          >
            {showAcknowledged ? "Hide Acknowledged" : "Show All"}
          </Button>
        </div>
      </div>

      {/* Alert Summary — click to filter */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card
          className={`cursor-pointer transition-all ${severityFilter === "all" ? "ring-2 ring-primary" : "hover:shadow-elevated"}`}
          onClick={() => setSeverityFilter("all")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unacknowledgedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Unacknowledged alerts
            </p>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-all ${severityFilter === "critical" ? "ring-2 ring-destructive" : "hover:shadow-elevated"}`}
          onClick={() => setSeverityFilter(severityFilter === "critical" ? "all" : "critical")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {criticalCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {severityFilter === "critical" ? "Showing critical only" : "Critical alerts"}
            </p>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-all ${severityFilter === "warning" ? "ring-2 ring-yellow-500" : "hover:shadow-elevated"}`}
          onClick={() => setSeverityFilter(severityFilter === "warning" ? "all" : "warning")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {warningCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {severityFilter === "warning" ? "Showing warnings only" : "Warning alerts"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alert List */}
      <AlertList
        alerts={filteredAlerts}
        onAcknowledge={acknowledgeAlert}
        loading={loading}
        pumpNames={pumpNames}
      />
    </div>
  );
}
