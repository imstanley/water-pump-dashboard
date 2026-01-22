"use client";

import { useState } from "react";
import { sendPumpCommand } from "@/lib/api/pumpApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Square, Gauge, Droplet } from "lucide-react";

export const PumpControls = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pressureLimit, setPressureLimit] = useState("");

  const handleCommand = async (command: string, value?: string) => {
    setLoading(true);
    setMessage(null);

    try {
      const result = await sendPumpCommand(command, value);

      if (result && result.status === "executed") {
        setMessage({ type: "success", text: "Command executed successfully" });
      } else if (result && result.status === "failed") {
        setMessage({ type: "error", text: "Command failed. Check API configuration." });
      } else {
        setMessage({ type: "error", text: "Failed to send command" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to send command" });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pump Controls</CardTitle>
        <CardDescription>Send control commands to the pump</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Controls */}
        <div className="space-y-4">
          <h3 className="font-semibold">Basic Controls</h3>
          <div className="flex gap-4">
            <Button
              variant="default"
              onClick={() => handleCommand("start")}
              disabled={loading}
              className="flex-1"
            >
              <Play className="mr-2 h-4 w-4" />
              Start Pump
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleCommand("stop")}
              disabled={loading}
              className="flex-1"
            >
              <Square className="mr-2 h-4 w-4" />
              Stop Pump
            </Button>
          </div>
        </div>

        {/* Pressure Settings */}
        <div className="space-y-4">
          <h3 className="font-semibold">Pressure Settings</h3>
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="pressureLimit">Pressure Limit (PSI)</Label>
              <Input
                id="pressureLimit"
                type="number"
                placeholder="e.g., 100"
                value={pressureLimit}
                onChange={(e) => setPressureLimit(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => handleCommand("set_pressure", pressureLimit)}
                disabled={loading || !pressureLimit}
              >
                <Gauge className="mr-2 h-4 w-4" />
                Set Limit
              </Button>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {message && (
          <div
            className={`text-sm p-3 rounded-md ${
              message.type === "success"
                ? "text-green-600 bg-green-50"
                : "text-destructive bg-destructive/10"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="text-xs text-muted-foreground pt-4 border-t">
          <p>
            <strong>Note:</strong> Commands require the API endpoint to be configured in the API Configuration section above.
          </p>
          <p className="mt-2">
            Commands are logged in the pump_controls table for audit purposes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
