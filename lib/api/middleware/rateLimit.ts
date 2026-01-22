import { NextRequest, NextResponse } from "next/server";
import { RateLimitError } from "@/lib/errors/AppError";
import { logger } from "@/lib/logging/logger";

// Simple in-memory rate limiter (for production, use Redis or similar)
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

const store: RateLimitStore = {};

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetAt < now) {
      delete store[key];
    }
  });
}, 60000); // Clean up every minute

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  identifier?: (request: NextRequest) => string; // Custom identifier function
}

const defaultIdentifier = (request: NextRequest): string => {
  // Try to get user ID from auth, fallback to IP
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : "unknown";
  return ip;
};

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests, identifier = defaultIdentifier } = options;

  return (
    handler: (request: NextRequest) => Promise<NextResponse>
  ): ((request: NextRequest) => Promise<NextResponse>) => {
    return async (request: NextRequest): Promise<NextResponse> => {
      const key = identifier(request);
      const now = Date.now();

      // Get or create rate limit entry
      if (!store[key] || store[key].resetAt < now) {
        store[key] = {
          count: 0,
          resetAt: now + windowMs,
        };
      }

      // Increment count
      store[key].count += 1;

      // Check if limit exceeded
      if (store[key].count > maxRequests) {
        const resetIn = Math.ceil((store[key].resetAt - now) / 1000);

        logger.warn("Rate limit exceeded", {
          key,
          count: store[key].count,
          maxRequests,
          resetIn,
        });

        return NextResponse.json(
          {
            error: "Rate limit exceeded",
            code: "RATE_LIMIT_EXCEEDED",
            retryAfter: resetIn,
          },
          {
            status: 429,
            headers: {
              "Retry-After": resetIn.toString(),
              "X-RateLimit-Limit": maxRequests.toString(),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": new Date(store[key].resetAt).toISOString(),
            },
          }
        );
      }

      // Add rate limit headers
      const remaining = Math.max(0, maxRequests - store[key].count);
      const response = await handler(request);

      response.headers.set("X-RateLimit-Limit", maxRequests.toString());
      response.headers.set("X-RateLimit-Remaining", remaining.toString());
      response.headers.set("X-RateLimit-Reset", new Date(store[key].resetAt).toISOString());

      return response;
    };
  };
}

// Pre-configured rate limiters
export const standardRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
});

export const strictRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute
});
