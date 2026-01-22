"use client";

import { useEffect, useRef, memo, useMemo } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { Pump } from "@/types/pump";

interface PumpMarkerProps {
  pump: Pump;
  selected?: boolean;
  onSelect?: (pumpId: string) => void;
}

// Validate coordinates are within valid ranges
const isValidCoordinate = (lat: number | null | undefined, lng: number | null | undefined): boolean => {
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return false;
  }
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

// Custom icon colors based on status
const getMarkerColor = (status: string): string => {
  switch (status) {
    case "running":
      return "#10b981"; // green
    case "stopped":
      return "#6b7280"; // gray
    case "error":
      return "#ef4444"; // red
    default:
      return "#f59e0b"; // yellow
  }
};

// Create custom icon (memoized to prevent recreation on every render)
const createIcon = (status: string, selected: boolean = false): L.DivIcon => {
  const color = getMarkerColor(status);
  const size = selected ? 32 : 24;
  const className = selected ? "pump-marker-selected" : "pump-marker";

  return L.divIcon({
    className,
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border: 3px solid ${selected ? "#3b82f6" : "#ffffff"};
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        ${selected ? "transform: scale(1.2); z-index: 1000;" : ""}
      ">
        <div style="
          width: ${size - 8}px;
          height: ${size - 8}px;
          background-color: ${color};
          border-radius: 50%;
          opacity: 0.8;
        "></div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

const PumpMarkerComponent = ({ pump, selected = false, onSelect }: PumpMarkerProps) => {
  const map = useMap();
  const markerRef = useRef<L.Marker>(null);

  // Validate coordinates before rendering
  const isValid = isValidCoordinate(pump.latitude, pump.longitude);
  const position: [number, number] | null = isValid
    ? [pump.latitude!, pump.longitude!]
    : null;

  // Memoize icon creation to prevent unnecessary recreations
  const icon = useMemo(() => {
    if (!isValid) return null;
    return createIcon(pump.status || "unknown", selected);
  }, [pump.status, selected, isValid]);

  // Handle selected state - pan to marker when selected
  useEffect(() => {
    if (selected && markerRef.current && position) {
      try {
        map.setView(position, map.getZoom(), {
          animate: true,
          duration: 0.5,
        });
      } catch (error) {
        console.error("Error setting map view for selected pump:", error);
      }
    }
  }, [selected, position, map]);

  // Don't render if coordinates are invalid
  if (!isValid || !position || !icon) {
    return null;
  }

  const handleClick = () => {
    try {
      onSelect?.(pump.id);
    } catch (error) {
      console.error("Error selecting pump:", error);
    }
  };

  const handlePopupClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleClick();
  };

  return (
    <Marker
      ref={markerRef}
      position={position}
      icon={icon}
      eventHandlers={{
        click: handleClick,
      }}
      aria-label={`Pump marker: ${pump.name || pump.id}`}
    >
      <Popup>
        <div className="p-2 min-w-[200px]">
          <h3 className="font-semibold text-sm mb-1">{pump.name || "Unnamed Pump"}</h3>
          <p className="text-xs text-muted-foreground mb-2">{pump.location || "No location"}</p>
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getMarkerColor(pump.status || "unknown") }}
              aria-hidden="true"
            />
            <span className="text-xs capitalize">{pump.status || "unknown"}</span>
          </div>
          {onSelect && (
            <button
              onClick={handlePopupClick}
              className="mt-2 text-xs text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded px-1"
              aria-label={`View details for ${pump.name || pump.id}`}
            >
              View Details
            </button>
          )}
        </div>
      </Popup>
    </Marker>
  );
};

// Memoize component to prevent unnecessary re-renders
// Only re-render if pump data, selected state, or onSelect callback changes
export const PumpMarker = memo(PumpMarkerComponent, (prevProps, nextProps) => {
  return (
    prevProps.pump.id === nextProps.pump.id &&
    prevProps.pump.latitude === nextProps.pump.latitude &&
    prevProps.pump.longitude === nextProps.pump.longitude &&
    prevProps.pump.status === nextProps.pump.status &&
    prevProps.pump.name === nextProps.pump.name &&
    prevProps.selected === nextProps.selected &&
    prevProps.onSelect === nextProps.onSelect
  );
});

PumpMarker.displayName = "PumpMarker";
