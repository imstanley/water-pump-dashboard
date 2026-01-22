"use client";

import { onCLS, onINP, onFCP, onLCP, onTTFB, Metric } from "web-vitals";

type WebVitalsCallback = (metric: Metric) => void;

/**
 * Report Web Vitals metrics
 * Can be extended to send to analytics service
 */
export function reportWebVitals(onPerfEntry?: WebVitalsCallback) {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    onCLS(onPerfEntry);
    onINP(onPerfEntry);
    onFCP(onPerfEntry);
    onLCP(onPerfEntry);
    onTTFB(onPerfEntry);
  }
}

/**
 * Log Web Vitals to console in development
 */
export function logWebVitals(metric: Metric) {
  if (process.env.NODE_ENV === "development") {
    console.log(metric);
  }

  // In production, send to analytics service
  if (process.env.NODE_ENV === "production") {
    // Example: Send to analytics
    // analytics.track('web_vital', {
    //   name: metric.name,
    //   value: metric.value,
    //   id: metric.id,
    //   delta: metric.delta,
    //   rating: metric.rating,
    // });
  }
}
