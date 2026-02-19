"use client";

import { ApiConfig } from "@/components/settings/ApiConfig";
import { PumpControls } from "@/components/settings/PumpControls";
import { UserSettingsManager } from "@/components/settings/UserSettingsManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { getPumpConfig, updatePumpConfig } from "@/lib/api/pumpApi";
import { isDemoModeSync } from "@/lib/demo/isDemoMode";
import type { PumpConfig } from "@/types/pump";

export default function SettingsPage() {
  const isDemo = isDemoModeSync();
  const [config, setConfig] = useState<PumpConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [pressureMin, setPressureMin] = useState("");
  const [pressureMax, setPressureMax] = useState("");
  const [flowRateMin, setFlowRateMin] = useState("");
  const [flowRateMax, setFlowRateMax] = useState("");
  const [temperatureMax, setTemperatureMax] = useState("");

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await getPumpConfig();
        if (data) {
          setConfig(data);
          const thresholds = data.alert_thresholds || {};
          setPressureMin(thresholds.pressure_min?.toString() || "");
          setPressureMax(thresholds.pressure_max?.toString() || "");
          setFlowRateMin(thresholds.flow_rate_min?.toString() || "");
          setFlowRateMax(thresholds.flow_rate_max?.toString() || "");
          setTemperatureMax(thresholds.temperature_max?.toString() || "");
        }
      } catch (err) {
        console.error("Error fetching config:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleSaveThresholds = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const thresholds = {
        pressure_min: pressureMin ? parseFloat(pressureMin) : undefined,
        pressure_max: pressureMax ? parseFloat(pressureMax) : undefined,
        flow_rate_min: flowRateMin ? parseFloat(flowRateMin) : undefined,
        flow_rate_max: flowRateMax ? parseFloat(flowRateMax) : undefined,
        temperature_max: temperatureMax ? parseFloat(temperatureMax) : undefined,
      };

      const updated = await updatePumpConfig({
        alert_thresholds: thresholds,
      });

      if (updated) {
        setConfig(updated);
        alert("Alert thresholds saved successfully!");
      }
    } catch (err: any) {
      alert("Failed to save thresholds: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold gradient-text-blue">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure API connection, pump controls, and alert thresholds
        </p>
        {isDemo && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Demo Mode:</strong> Settings are displayed but not persisted. Configure Supabase to enable real configuration storage.
            </p>
          </div>
        )}
      </div>

      {/* API Configuration */}
      <ApiConfig />

      {/* Alert Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Thresholds</CardTitle>
          <CardDescription>
            Configure when alerts should be triggered based on metric values
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              Loading thresholds...
            </div>
          ) : (
            <form onSubmit={handleSaveThresholds} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pressureMin">Minimum Pressure (PSI)</Label>
                  <Input
                    id="pressureMin"
                    type="number"
                    placeholder="e.g., 20"
                    value={pressureMin}
                    onChange={(e) => setPressureMin(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Alert when pressure drops below this value
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pressureMax">Maximum Pressure (PSI)</Label>
                  <Input
                    id="pressureMax"
                    type="number"
                    placeholder="e.g., 100"
                    value={pressureMax}
                    onChange={(e) => setPressureMax(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Alert when pressure exceeds this value
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flowRateMin">Minimum Flow Rate (GPM)</Label>
                  <Input
                    id="flowRateMin"
                    type="number"
                    placeholder="e.g., 5"
                    value={flowRateMin}
                    onChange={(e) => setFlowRateMin(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Alert when flow rate drops below this value
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flowRateMax">Maximum Flow Rate (GPM)</Label>
                  <Input
                    id="flowRateMax"
                    type="number"
                    placeholder="e.g., 50"
                    value={flowRateMax}
                    onChange={(e) => setFlowRateMax(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Alert when flow rate exceeds this value
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temperatureMax">Maximum Temperature (°F)</Label>
                  <Input
                    id="temperatureMax"
                    type="number"
                    placeholder="e.g., 120"
                    value={temperatureMax}
                    onChange={(e) => setTemperatureMax(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Alert when temperature exceeds this value
                  </p>
                </div>
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Thresholds"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Pump Controls */}
      <PumpControls />

      {/* User Management */}
      <UserSettingsManager />
    </div>
  );
}
