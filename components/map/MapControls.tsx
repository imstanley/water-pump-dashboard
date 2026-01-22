"use client";

import { useMap } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2, MapPin } from "lucide-react";
import { useEffect } from "react";

export const MapControls = () => {
  const map = useMap();

  const handleZoomIn = () => {
    try {
      map.zoomIn();
    } catch (error) {
      console.error("Error zooming in:", error);
    }
  };

  const handleZoomOut = () => {
    try {
      map.zoomOut();
    } catch (error) {
      console.error("Error zooming out:", error);
    }
  };

  const handleLocateMe = () => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            map.setView(
              [position.coords.latitude, position.coords.longitude],
              13,
              { animate: true }
            );
          },
          (error) => {
            console.error("Geolocation error:", error);
          },
          {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 60000,
          }
        );
      } else {
        console.warn("Geolocation is not supported by this browser");
      }
    } catch (error) {
      console.error("Error locating user:", error);
    }
  };

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if no input is focused
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      try {
        switch (e.key) {
          case "+":
          case "=":
            e.preventDefault();
            map.zoomIn();
            break;
          case "-":
          case "_":
            e.preventDefault();
            map.zoomOut();
            break;
          case "l":
          case "L":
            e.preventDefault();
            handleLocateMe();
            break;
        }
      } catch (error) {
        console.error("Error handling keyboard navigation:", error);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [map]);

  return (
    <div
      className="absolute top-4 right-4 z-[1000] flex flex-col gap-2"
      role="toolbar"
      aria-label="Map controls"
    >
      <Button
        variant="outline"
        size="sm"
        onClick={handleZoomIn}
        className="bg-card/90 backdrop-blur-sm"
        title="Zoom in (or press +)"
        aria-label="Zoom in"
        type="button"
      >
        <ZoomIn className="h-4 w-4" aria-hidden="true" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleZoomOut}
        className="bg-card/90 backdrop-blur-sm"
        title="Zoom out (or press -)"
        aria-label="Zoom out"
        type="button"
      >
        <ZoomOut className="h-4 w-4" aria-hidden="true" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleLocateMe}
        className="bg-card/90 backdrop-blur-sm"
        title="Locate me (or press L)"
        aria-label="Locate my position"
        type="button"
      >
        <MapPin className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  );
};
