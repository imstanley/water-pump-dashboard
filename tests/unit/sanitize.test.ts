import { describe, it, expect } from "vitest";
import {
  sanitizeHtml,
  sanitizeString,
  sanitizeText,
  sanitizeUrl,
  sanitizeEmail,
  sanitizeNumber,
} from "@/lib/security/sanitize";

describe("Sanitization Functions", () => {
  describe("sanitizeHtml", () => {
    it("should remove HTML tags", () => {
      const input = "<script>alert('xss')</script>Hello";
      const result = sanitizeHtml(input);
      expect(result).not.toContain("<script>");
      expect(result).toContain("Hello");
    });

    it("should handle empty string", () => {
      const result = sanitizeHtml("");
      expect(result).toBe("");
    });
  });

  describe("sanitizeString", () => {
    it("should sanitize and trim string", () => {
      const input = "  <script>alert('xss')</script>Hello  ";
      const result = sanitizeString(input);
      expect(result).not.toContain("<script>");
      expect(result).not.toContain("  ");
      expect(result).toContain("Hello");
    });

    it("should return empty string for non-string input", () => {
      const result = sanitizeString(null as unknown as string);
      expect(result).toBe("");
    });
  });

  describe("sanitizeText", () => {
    it("should allow basic formatting tags", () => {
      const input = "<b>Bold</b> and <i>italic</i> text";
      const result = sanitizeText(input);
      expect(result).toContain("<b>");
      expect(result).toContain("<i>");
    });

    it("should remove dangerous tags", () => {
      const input = "<script>alert('xss')</script>Safe text";
      const result = sanitizeText(input);
      expect(result).not.toContain("<script>");
      expect(result).toContain("Safe text");
    });
  });

  describe("sanitizeUrl", () => {
    it("should validate and return valid HTTP URL", () => {
      const input = "http://example.com";
      const result = sanitizeUrl(input);
      expect(result).toBe("http://example.com/");
    });

    it("should validate and return valid HTTPS URL", () => {
      const input = "https://example.com";
      const result = sanitizeUrl(input);
      expect(result).toBe("https://example.com/");
    });

    it("should reject invalid protocol", () => {
      const input = "javascript:alert('xss')";
      const result = sanitizeUrl(input);
      expect(result).toBeNull();
    });

    it("should return null for invalid URL", () => {
      const input = "not-a-url";
      const result = sanitizeUrl(input);
      expect(result).toBeNull();
    });
  });

  describe("sanitizeEmail", () => {
    it("should sanitize and lowercase email", () => {
      const input = "  TEST@EXAMPLE.COM  ";
      const result = sanitizeEmail(input);
      expect(result).toBe("test@example.com");
    });

    it("should remove HTML from email", () => {
      const input = "<script>test</script>@example.com";
      const result = sanitizeEmail(input);
      expect(result).not.toContain("<script>");
      expect(result).toContain("@example.com");
    });
  });

  describe("sanitizeNumber", () => {
    it("should return number for valid number", () => {
      const result = sanitizeNumber(42);
      expect(result).toBe(42);
    });

    it("should parse string number", () => {
      const result = sanitizeNumber("42.5");
      expect(result).toBe(42.5);
    });

    it("should return null for invalid input", () => {
      const result = sanitizeNumber("not-a-number");
      expect(result).toBeNull();
    });

    it("should return null for NaN", () => {
      const result = sanitizeNumber(NaN);
      expect(result).toBeNull();
    });
  });
});
