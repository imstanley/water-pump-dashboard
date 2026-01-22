// Sentry integration setup
// This file provides a placeholder for Sentry integration
// To enable, install @sentry/nextjs and configure it

export const initSentry = () => {
  // Only initialize in production
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!sentryDsn) {
    console.warn("Sentry DSN not configured. Error tracking disabled.");
    return;
  }

  // TODO: Initialize Sentry when package is installed
  // import * as Sentry from "@sentry/nextjs";
  // Sentry.init({
  //   dsn: sentryDsn,
  //   tracesSampleRate: 0.1,
  //   environment: process.env.NODE_ENV,
  // });
};

export const captureException = (error: Error, context?: Record<string, unknown>) => {
  if (process.env.NODE_ENV === "production") {
    // TODO: Send to Sentry when package is installed
    // import * as Sentry from "@sentry/nextjs";
    // Sentry.captureException(error, { extra: context });
  } else {
    console.error("Exception captured:", error, context);
  }
};

export const captureMessage = (message: string, level: "info" | "warning" | "error" = "info") => {
  if (process.env.NODE_ENV === "production") {
    // TODO: Send to Sentry when package is installed
    // import * as Sentry from "@sentry/nextjs";
    // Sentry.captureMessage(message, level);
  } else {
    console[level === "error" ? "error" : level === "warning" ? "warn" : "log"](message);
  }
};
