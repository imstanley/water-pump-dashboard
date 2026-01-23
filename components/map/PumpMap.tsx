"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { LatLngBounds } from "leaflet";
import "leaflet/dist/leaflet.css";
import "@/app/leaflet.css";
import { PumpMarker } from "./PumpMarker";
import type { Pump } from "@/types/pump";

interface PumpMapProps {
  pumps: Pump[];
  selectedPumpId?: string | null;
  onPumpSelect?: (pumpId: string) => void;
  height?: string;
  className?: string;
}

// Validate coordinates are within valid ranges
const isValidCoordinate = (lat: number | null | undefined, lng: number | null | undefined): boolean => {
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return false;
  }
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

// Component to fit map bounds to all pumps
function FitBounds({ pumps }: { pumps: Pump[] }) {
  const map = useMap();

  useEffect(() => {
    const validPumps = pumps.filter((p) => isValidCoordinate(p.latitude, p.longitude));
    
    if (validPumps.length === 0) return;
    
    if (validPumps.length === 1) {
      // Single pump - center on it
      const pump = validPumps[0];
      map.setView([pump.latitude!, pump.longitude!], 12);
      return;
    }

    // Multiple pumps - fit bounds
    const bounds = new LatLngBounds(
      validPumps.map((p) => [p.latitude!, p.longitude!] as [number, number])
    );
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
  }, [pumps, map]);

  return null;
}

export const PumpMap = ({
  pumps,
  selectedPumpId,
  onPumpSelect,
  height = "400px",
  className = "",
}: PumpMapProps) => {
  const [isMounted, setIsMounted] = useState(false);
  // Use a stable, unique key per component instance to prevent double initialization
  const mapInstanceId = useRef(`pump-map-${Date.now()}-${Math.random()}`);

  // Validate and memoize valid pumps
  const validPumps = useMemo(() => {
    return pumps.filter((p) => isValidCoordinate(p.latitude, p.longitude));
  }, [pumps]);

  // Ensure component is mounted before rendering map (prevents SSR issues)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div
        className={`flex items-center justify-center glass-panel rounded-xl ${className}`}
        style={{ height }}
        role="status"
        aria-label="Loading map"
      >
        <div className="text-muted-foreground text-center p-4">
          <p className="text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  if (validPumps.length === 0) {
    return (
      <div
        className={`flex items-center justify-center glass-panel rounded-xl ${className}`}
        style={{ height }}
        role="status"
        aria-label="No pumps available"
      >
        <div className="text-muted-foreground text-center p-4">
          <p className="text-sm">No pumps with location data</p>
        </div>
      </div>
    );
  }

  const defaultCenter: [number, number] = [27.7663, -82.6404];

  return (
    <div
      className={`rounded-xl overflow-hidden glass-panel shadow-panel ${className}`}
      style={{ height }}
      role="application"
      aria-label="Pump locations map"
    >
      <MapContainer
        key={mapInstanceId.current}
        center={defaultCenter}
        zoom={10}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds pumps={validPumps} />
        {validPumps.map((pump) => (
          <PumpMarker
            key={pump.id}
            pump={pump}
            selected={pump.id === selectedPumpId}
            onSelect={onPumpSelect}
          />
        ))}
      </MapContainer>
    </div>
  );
};
