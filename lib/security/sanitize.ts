import DOMPurify from "dompurify";

// Create a DOMPurify instance for server-side use
let purify: typeof DOMPurify;
if (typeof window === "undefined") {
  // Server-side: use jsdom
  const { JSDOM } = require("jsdom");
  const window = new JSDOM("").window;
  purify = DOMPurify(window as any);
} else {
  // Client-side: use browser's DOMPurify
  purify = DOMPurify as any;
}

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(dirty: string): string {
  return purify.sanitize(dirty, {
    ALLOWED_TAGS: [], // No HTML tags allowed by default
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitize a string by removing HTML and trimming
 */
export function sanitizeString(input: string): string {
  if (typeof input !== "string") {
    return "";
  }
  // Remove HTML tags and trim
  const withoutHtml = sanitizeHtml(input);
  return withoutHtml.trim();
}

/**
 * Sanitize text content (allows some basic formatting)
 */
export function sanitizeText(input: string): string {
  if (typeof input !== "string") {
    return "";
  }
  // Allow basic formatting tags if needed, but be strict
  const sanitized = purify.sanitize(input, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "p", "br"],
    ALLOWED_ATTR: [],
  });
  return sanitized.trim();
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(url: string): string | null {
  if (typeof url !== "string") {
    return null;
  }

  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== "string") {
    return "";
  }
  // Remove any HTML and trim, convert to lowercase
  return sanitizeString(email).toLowerCase();
}

/**
 * Sanitize numeric input
 */
export function sanitizeNumber(input: unknown): number | null {
  if (typeof input === "number") {
    return isNaN(input) || !isFinite(input) ? null : input;
  }
  if (typeof input === "string") {
    const parsed = parseFloat(input);
    return isNaN(parsed) || !isFinite(parsed) ? null : parsed;
  }
  return null;
}
