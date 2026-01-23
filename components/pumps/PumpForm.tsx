"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Pump } from "@/types/pump";

interface PumpFormProps {
  pump?: Pump | null;
  onSubmit: (data: Omit<Pump, "id" | "created_at" | "updated_at">) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const PumpForm = ({ pump, onSubmit, onCancel, loading = false }: PumpFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    latitude: "",
    longitude: "",
    api_endpoint: "",
    api_key: "",
    status: "stopped" as Pump["status"],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (pump) {
      setFormData({
        name: pump.name || "",
        location: pump.location || "",
        latitude: pump.latitude?.toString() || "",
        longitude: pump.longitude?.toString() || "",
        api_endpoint: pump.api_endpoint || "",
        api_key: pump.api_key || "",
        status: pump.status || "stopped",
      });
    }
  }, [pump]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (formData.latitude) {
      const lat = parseFloat(formData.latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        newErrors.latitude = "Latitude must be between -90 and 90";
      }
    }

    if (formData.longitude) {
      const lng = parseFloat(formData.longitude);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        newErrors.longitude = "Longitude must be between -180 and 180";
      }
    }

    // If one coordinate is provided, both should be
    if ((formData.latitude && !formData.longitude) || (!formData.latitude && formData.longitude)) {
      newErrors.coordinates = "Both latitude and longitude must be provided together";
    }

    if (formData.api_endpoint && !formData.api_endpoint.match(/^https?:\/\/.+/)) {
      newErrors.api_endpoint = "API endpoint must be a valid URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const submitData: Omit<Pump, "id" | "created_at" | "updated_at"> = {
      name: formData.name.trim(),
      location: formData.location.trim() || null,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      api_endpoint: formData.api_endpoint.trim() || null,
      api_key: formData.api_key.trim() || null,
      status: formData.status,
      created_by: pump?.created_by || null, // Preserve created_by for updates
    };

    await onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Pump Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Main Irrigation Pump"
          className={errors.name ? "border-destructive" : ""}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="e.g., Field A, North Section"
        />
      </div>

      {/* Coordinates */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            type="number"
            step="any"
            value={formData.latitude}
            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
            placeholder="e.g., 27.7663"
            className={errors.latitude || errors.coordinates ? "border-destructive" : ""}
          />
          {errors.latitude && <p className="text-sm text-destructive">{errors.latitude}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            type="number"
            step="any"
            value={formData.longitude}
            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
            placeholder="e.g., -82.6404"
            className={errors.longitude || errors.coordinates ? "border-destructive" : ""}
          />
          {errors.longitude && <p className="text-sm text-destructive">{errors.longitude}</p>}
        </div>
      </div>
      {errors.coordinates && (
        <p className="text-sm text-destructive">{errors.coordinates}</p>
      )}

      {/* API Configuration */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h3 className="text-lg font-semibold">API Configuration (Optional)</h3>
        <p className="text-sm text-muted-foreground">
          Configure API endpoint for remote pump control and monitoring
        </p>

        <div className="space-y-2">
          <Label htmlFor="api_endpoint">API Endpoint</Label>
          <Input
            id="api_endpoint"
            type="url"
            value={formData.api_endpoint}
            onChange={(e) => setFormData({ ...formData, api_endpoint: e.target.value })}
            placeholder="https://api.example.com/pump"
            className={errors.api_endpoint ? "border-destructive" : ""}
          />
          {errors.api_endpoint && (
            <p className="text-sm text-destructive">{errors.api_endpoint}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="api_key">API Key</Label>
          <Input
            id="api_key"
            type="password"
            value={formData.api_key}
            onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
            placeholder="Enter API key"
          />
        </div>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label htmlFor="status">Initial Status</Label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) =>
            setFormData({ ...formData, status: e.target.value as Pump["status"] })
          }
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="stopped">Stopped</option>
          <option value="running">Running</option>
          <option value="error">Error</option>
          <option value="unknown">Unknown</option>
        </select>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : pump ? "Update Pump" : "Create Pump"}
        </Button>
      </div>
    </form>
  );
};
