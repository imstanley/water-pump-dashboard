"use client";

import { useState } from "react";
import { usePumpAlerts } from "@/hooks/usePumpAlerts";
import { AlertList } from "@/components/alerts/AlertList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AlertsPage() {
  const [showAcknowledged, setShowAcknowledged] = useState(false);
  const { alerts, loading, acknowledgeAlert } = usePumpAlerts(
    undefined,
    showAcknowledged ? undefined : false
  );

  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length;
  const criticalCount = alerts.filter(
    (a) => !a.acknowledged && a.severity === "critical"
  ).length;
  const warningCount = alerts.filter(
    (a) => !a.acknowledged && a.severity === "warning"
  ).length;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Alerts
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage pump system alerts
          </p>
        </div>
        <Button
          variant={showAcknowledged ? "default" : "outline"}
          onClick={() => setShowAcknowledged(!showAcknowledged)}
        >
          {showAcknowledged ? "Hide Acknowledged" : "Show All"}
        </Button>
      </div>

      {/* Alert Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {criticalCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Critical alerts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {warningCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Warning alerts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alert List */}
      <AlertList
        alerts={alerts}
        onAcknowledge={acknowledgeAlert}
        loading={loading}
      />
    </div>
  );
}
