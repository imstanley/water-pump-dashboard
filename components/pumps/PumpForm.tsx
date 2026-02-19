"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin } from "lucide-react";
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

const DEFAULT_CENTER: [number, number] = [27.7663, -82.6404];
const DEFAULT_ZOOM = 10;

let _L: typeof import("leaflet") | null = null;
let _pinIcon: any = null;

function getLeaflet() {
  return _L;
}

function getPinIcon(L: typeof import("leaflet")) {
  if (!_pinIcon) {
    _pinIcon = L.divIcon({
      className: "location-picker-pin",
      html: `
        <div style="
          width: 28px; height: 28px;
          background: #3b82f6;
          border: 3px solid #ffffff;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 2px 8px rgba(0,0,0,0.35);
        ">
          <div style="
            width: 10px; height: 10px;
            background: #ffffff;
            border-radius: 50%;
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
          "></div>
        </div>
      `,
      iconSize: [28, 28] as [number, number],
      iconAnchor: [14, 28] as [number, number],
    });
  }
  return _pinIcon;
}

function LocationPicker({
  lat,
  lng,
  onChange,
}: {
  lat: string;
  lng: string;
  onChange: (lat: string, lng: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [ready, setReady] = useState(false);

  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);
  const hasCoords =
    !isNaN(parsedLat) && !isNaN(parsedLng) &&
    parsedLat >= -90 && parsedLat <= 90 &&
    parsedLng >= -180 && parsedLng <= 180;

  const placeOrMoveMarkerRef = useRef<(map: any, position: [number, number]) => void>(() => {});

  // Initialize map (dynamic import of Leaflet - client only)
  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    (async () => {
      if (!_L) {
        const leaflet = await import("leaflet");
        await import("leaflet/dist/leaflet.css");
        _L = leaflet.default || leaflet;
      }
      const L = _L!;
      if (cancelled || !containerRef.current) return;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if ((containerRef.current as any)._leaflet_id) {
        delete (containerRef.current as any)._leaflet_id;
      }

      const pinIcon = getPinIcon(L);

      const placeOrMove = (map: any, position: [number, number]) => {
        if (markerRef.current) {
          markerRef.current.setLatLng(position);
        } else {
          const marker = L.marker(position, { icon: pinIcon, draggable: true }).addTo(map);
          marker.on("dragend", () => {
            const p = marker.getLatLng();
            onChangeRef.current(p.lat.toFixed(6), p.lng.toFixed(6));
          });
          markerRef.current = marker;
        }
      };
      placeOrMoveMarkerRef.current = placeOrMove;

      const center: [number, number] = hasCoords
        ? [parsedLat, parsedLng]
        : DEFAULT_CENTER;

      const map = L.map(containerRef.current, {
        center,
        zoom: hasCoords ? 13 : DEFAULT_ZOOM,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      }).addTo(map);

      if (hasCoords) {
        placeOrMove(map, center);
      }

      map.on("click", (e: any) => {
        const { lat: clickLat, lng: clickLng } = e.latlng;
        placeOrMove(map, [clickLat, clickLng]);
        onChangeRef.current(clickLat.toFixed(6), clickLng.toFixed(6));
      });

      mapRef.current = map;
      setTimeout(() => map.invalidateSize(), 150);
      setReady(true);
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync marker position when lat/lng fields change externally
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    if (hasCoords) {
      placeOrMoveMarkerRef.current(map, [parsedLat, parsedLng]);
      map.setView([parsedLat, parsedLng], Math.max(map.getZoom(), 12), { animate: true });
    } else if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng, ready]);

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="h-3 w-3" />
        <span>Click or drag the pin to set location</span>
      </div>
      <div
        ref={containerRef}
        className="w-full rounded-lg border border-input overflow-hidden"
        style={{ height: "180px" }}
      />
    </div>
  );
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
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Name */}
      <div className="space-y-1">
        <Label htmlFor="name">
          Pump Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Main Irrigation Pump"
          className={`h-9 ${errors.name ? "border-destructive" : ""}`}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>

      {/* Location */}
      <div className="space-y-1">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="e.g., Field A, North Section"
          className="h-9"
        />
      </div>

      {/* Coordinates */}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            type="number"
            step="any"
            value={formData.latitude}
            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
            placeholder="e.g., 27.7663"
            className={`h-9 ${errors.latitude || errors.coordinates ? "border-destructive" : ""}`}
          />
          {errors.latitude && <p className="text-sm text-destructive">{errors.latitude}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            type="number"
            step="any"
            value={formData.longitude}
            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
            placeholder="e.g., -82.6404"
            className={`h-9 ${errors.longitude || errors.coordinates ? "border-destructive" : ""}`}
          />
          {errors.longitude && <p className="text-sm text-destructive">{errors.longitude}</p>}
        </div>
      </div>
      {errors.coordinates && (
        <p className="text-sm text-destructive">{errors.coordinates}</p>
      )}

      {/* Mini map for location picking */}
      <LocationPicker
        lat={formData.latitude}
        lng={formData.longitude}
        onChange={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
      />

      {/* API Configuration */}
      <div className="space-y-2 pt-2 border-t border-border">
        <h3 className="text-base font-semibold">API Configuration (Optional)</h3>
        <p className="text-xs text-muted-foreground">
          Configure API endpoint for remote pump control and monitoring
        </p>

        <div className="space-y-1">
          <Label htmlFor="api_endpoint">API Endpoint</Label>
          <Input
            id="api_endpoint"
            type="url"
            value={formData.api_endpoint}
            onChange={(e) => setFormData({ ...formData, api_endpoint: e.target.value })}
            placeholder="https://api.example.com/pump"
            className={`h-9 ${errors.api_endpoint ? "border-destructive" : ""}`}
          />
          {errors.api_endpoint && (
            <p className="text-sm text-destructive">{errors.api_endpoint}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="api_key">API Key</Label>
          <Input
            id="api_key"
            type="password"
            value={formData.api_key}
            onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
            placeholder="Enter API key"
            className="h-9"
          />
        </div>
      </div>

      {/* Status */}
      <div className="space-y-1">
        <Label htmlFor="status">Initial Status</Label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) =>
            setFormData({ ...formData, status: e.target.value as Pump["status"] })
          }
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
        >
          <option value="stopped">Stopped</option>
          <option value="running">Running</option>
          <option value="error">Error</option>
          <option value="unknown">Unknown</option>
        </select>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
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
