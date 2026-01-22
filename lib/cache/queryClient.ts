import { QueryClient } from "@tanstack/react-query";

/**
 * Default query client configuration
 * Provides caching, retry logic, and stale time management
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered stale after 30 seconds
      staleTime: 30 * 1000,
      // Cache data for 5 minutes
      gcTime: 5 * 60 * 1000,
      // Retry failed requests up to 3 times
      retry: 3,
      // Retry delay increases exponentially
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus in production
      refetchOnWindowFocus: process.env.NODE_ENV === "production",
      // Don't refetch on mount if data is fresh
      refetchOnMount: true,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});

/**
 * Query keys for consistent cache key management
 */
export const queryKeys = {
  pumps: {
    all: ["pumps"] as const,
    lists: () => [...queryKeys.pumps.all, "list"] as const,
    list: (filters: string) => [...queryKeys.pumps.lists(), { filters }] as const,
    details: () => [...queryKeys.pumps.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.pumps.details(), id] as const,
  },
  readings: {
    all: ["readings"] as const,
    lists: () => [...queryKeys.readings.all, "list"] as const,
    list: (pumpId: string, filters: string) =>
      [...queryKeys.readings.lists(), pumpId, { filters }] as const,
    latest: (pumpId?: string) => [...queryKeys.readings.all, "latest", pumpId] as const,
    metrics: (pumpId?: string) => [...queryKeys.readings.all, "metrics", pumpId] as const,
  },
  alerts: {
    all: ["alerts"] as const,
    lists: () => [...queryKeys.alerts.all, "list"] as const,
    list: (filters: string) => [...queryKeys.alerts.lists(), { filters }] as const,
  },
  config: {
    all: ["config"] as const,
    detail: (pumpId?: string) => [...queryKeys.config.all, pumpId] as const,
  },
} as const;
