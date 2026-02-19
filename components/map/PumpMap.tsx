"use client";

import { useMemo, useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@/app/leaflet.css";
import type { Pump } from "@/types/pump";

interface PumpMapProps {
  pumps: Pump[];
  selectedPumpId?: string | null;
  onPumpSelect?: (pumpId: string) => void;
  height?: string;
  className?: string;
}

const isValidCoordinate = (lat: number | null | undefined, lng: number | null | undefined): boolean => {
  if (lat === null || lat === undefined || lng === null || lng === undefined) return false;
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

const getMarkerColor = (status: string): string => {
  switch (status) {
    case "running": return "#10b981";
    case "stopped": return "#6b7280";
    case "error": return "#ef4444";
    default: return "#f59e0b";
  }
};

const createIcon = (status: string, selected: boolean): L.DivIcon => {
  const color = getMarkerColor(status);
  const size = selected ? 32 : 24;
  return L.divIcon({
    className: selected ? "pump-marker-selected" : "pump-marker",
    html: `
      <div style="
        width: ${size}px; height: ${size}px;
        background-color: ${color};
        border: 3px solid ${selected ? "#3b82f6" : "#ffffff"};
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex; align-items: center; justify-content: center;
        transition: all 0.3s ease;
        ${selected ? "transform: scale(1.2); z-index: 1000;" : ""}
      ">
        <div style="
          width: ${size - 8}px; height: ${size - 8}px;
          background-color: ${color}; border-radius: 50%; opacity: 0.8;
        "></div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

export const PumpMap = ({
  pumps,
  selectedPumpId,
  onPumpSelect,
  height = "400px",
  className = "",
}: PumpMapProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  const validPumps = useMemo(
    () => pumps.filter((p) => isValidCoordinate(p.latitude, p.longitude)),
    [pumps],
  );

  const onPumpSelectRef = useRef(onPumpSelect);
  onPumpSelectRef.current = onPumpSelect;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isMounted || !containerRef.current) return;

    // Destroy any leftover instance on this container
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    if ((containerRef.current as any)._leaflet_id) {
      delete (containerRef.current as any)._leaflet_id;
    }

    const map = L.map(containerRef.current, {
      center: [27.7663, -82.6404],
      zoom: 10,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapRef.current = map;

    // Leaflet caches container dimensions; recalculate after layout settles
    const timer = setTimeout(() => map.invalidateSize(), 200);

    return () => {
      clearTimeout(timer);
      markersRef.current.forEach((m) => m.remove());
      markersRef.current.clear();
      map.remove();
      mapRef.current = null;
    };
  }, [isMounted]);

  // Sync markers with pump data
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const currentIds = new Set(validPumps.map((p) => p.id));
    const existing = markersRef.current;

    // Remove markers for pumps that no longer exist
    existing.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.remove();
        existing.delete(id);
      }
    });

    // Add or update markers
    validPumps.forEach((pump) => {
      const pos: L.LatLngExpression = [pump.latitude!, pump.longitude!];
      const selected = pump.id === selectedPumpId;
      const icon = createIcon(pump.status || "unknown", selected);

      let marker = existing.get(pump.id);
      if (marker) {
        marker.setLatLng(pos);
        marker.setIcon(icon);
      } else {
        marker = L.marker(pos, { icon }).addTo(map);
        marker.on("click", () => onPumpSelectRef.current?.(pump.id));
        existing.set(pump.id, marker);
      }

      const popupHtml = `
        <div style="padding:8px;min-width:200px">
          <h3 style="font-weight:600;font-size:0.875rem;margin:0 0 4px">${pump.name || "Unnamed Pump"}</h3>
          <p style="font-size:0.75rem;color:#888;margin:0 0 8px">${pump.location || "No location"}</p>
          <div style="display:flex;align-items:center;gap:8px">
            <div style="width:8px;height:8px;border-radius:50%;background:${getMarkerColor(pump.status || "unknown")}"></div>
            <span style="font-size:0.75rem;text-transform:capitalize">${pump.status || "unknown"}</span>
          </div>
        </div>
      `;
      marker.bindPopup(popupHtml);
    });
  }, [validPumps, selectedPumpId]);

  // Fit bounds only on initial load so user can freely pan/zoom afterwards
  const hasFitBounds = useRef(false);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || validPumps.length === 0 || hasFitBounds.current) return;

    hasFitBounds.current = true;

    if (validPumps.length === 1) {
      map.setView([validPumps[0].latitude!, validPumps[0].longitude!], 12);
      return;
    }

    const bounds = L.latLngBounds(
      validPumps.map((p) => [p.latitude!, p.longitude!] as [number, number]),
    );
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
  }, [validPumps]);

  // Pan to selected pump
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedPumpId) return;
    const pump = validPumps.find((p) => p.id === selectedPumpId);
    if (pump) {
      map.setView([pump.latitude!, pump.longitude!], map.getZoom(), {
        animate: true,
        duration: 0.5,
      });
    }
  }, [selectedPumpId, validPumps]);

  return (
    <div
      className={`relative rounded-xl overflow-hidden glass-panel shadow-panel ${className}`}
      style={{ height }}
      role="application"
      aria-label="Pump locations map"
    >
      {/* Always render the map container so Leaflet can initialize */}
      {isMounted && (
        <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
      )}

      {/* Overlay messages */}
      {!isMounted && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      )}
      {isMounted && validPumps.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <p className="text-sm text-muted-foreground">No pumps with location data</p>
        </div>
      )}
    </div>
  );
};
