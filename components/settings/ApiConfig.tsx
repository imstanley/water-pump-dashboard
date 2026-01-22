"use client";

import { useState, useEffect } from "react";
import { getPumpConfig, updatePumpConfig } from "@/lib/api/pumpApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PumpConfig } from "@/types/pump";

export const ApiConfig = () => {
  const [config, setConfig] = useState<PumpConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [apiEndpoint, setApiEndpoint] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [pollInterval, setPollInterval] = useState(30);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await getPumpConfig();
        if (data) {
          setConfig(data);
          setApiEndpoint(data.api_endpoint || "");
          setApiKey(data.api_key || "");
          setPollInterval(data.poll_interval || 30);
        }
      } catch (err) {
        console.error("Error fetching config:", err);
        setError("Failed to load configuration");
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const updated = await updatePumpConfig({
        api_endpoint: apiEndpoint || null,
        api_key: apiKey || null,
        poll_interval: pollInterval,
      });

      if (updated) {
        setConfig(updated);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError("Failed to save configuration");
      }
    } catch (err: any) {
      setError(err.message || "Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            Loading configuration...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Configuration</CardTitle>
        <CardDescription>
          Configure the water pump API endpoint and authentication
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiEndpoint">API Endpoint</Label>
            <Input
              id="apiEndpoint"
              type="url"
              placeholder="https://api.example.com/pump"
              value={apiEndpoint}
              onChange={(e) => setApiEndpoint(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Enter API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pollInterval">Poll Interval (seconds)</Label>
            <Input
              id="pollInterval"
              type="number"
              min="10"
              max="300"
              value={pollInterval}
              onChange={(e) => setPollInterval(parseInt(e.target.value) || 30)}
            />
            <p className="text-xs text-muted-foreground">
              How often to poll the pump API for new readings (10-300 seconds)
            </p>
          </div>
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
              Configuration saved successfully!
            </div>
          )}
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Configuration"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
