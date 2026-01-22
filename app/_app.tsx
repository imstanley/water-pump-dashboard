"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { reportWebVitals, logWebVitals } from "@/lib/monitoring/webVitals";

/**
 * Client-side app component for Web Vitals tracking
 * This is called on every route change
 */
export function AppMonitoring() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Report Web Vitals
    reportWebVitals(logWebVitals);
  }, []);

  useEffect(() => {
    // Track page views
    if (process.env.NODE_ENV === "production") {
      // Example: analytics.page(pathname);
    }
  }, [pathname, searchParams]);

  return null;
}
