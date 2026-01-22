"use client";

import { useState, useEffect } from "react";
import { X, Info } from "lucide-react";
import { Button } from "./button";
import { isDemoMode } from "@/lib/demo/isDemoMode";

export const DemoBanner = () => {
  const [isDemo, setIsDemo] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkDemoMode = async () => {
      const demo = await isDemoMode();
      setIsDemo(demo);
      
      // Check if banner was dismissed
      if (typeof window !== "undefined") {
        const dismissed = localStorage.getItem("demo-banner-dismissed") === "true";
        setDismissed(dismissed);
      }
      
      setLoading(false);
    };

    checkDemoMode();
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("demo-banner-dismissed", "true");
    }
  };

  if (loading || !isDemo || dismissed) {
    return null;
  }

  return (
    <div className="relative bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white shadow-lg">
      <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-start sm:items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 mt-0.5 sm:mt-0">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium">
                Demo Mode - Sample data for demonstration
              </p>
              <p className="text-xs opacity-90 mt-0.5 hidden sm:block">
                Configure Supabase to connect to a real pump system
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-white hover:bg-white/20 hover:text-white flex-shrink-0 min-h-[36px] min-w-[36px] sm:min-h-[44px] sm:min-w-[44px]"
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
