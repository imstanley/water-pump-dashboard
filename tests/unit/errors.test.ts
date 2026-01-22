import { describe, it, expect } from "vitest";
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  DatabaseError,
} from "@/lib/errors/AppError";

describe("Error Classes", () => {
  describe("AppError", () => {
    it("should create an AppError with default values", () => {
      const error = new AppError("Test error", "TEST_ERROR");
      expect(error.message).toBe("Test error");
      expect(error.code).toBe("TEST_ERROR");
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
    });

    it("should create an AppError with custom values", () => {
      const error = new AppError("Test error", "TEST_ERROR", 400, false, { key: "value" });
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(false);
      expect(error.metadata).toEqual({ key: "value" });
    });
  });

  describe("ValidationError", () => {
    it("should create a ValidationError with validation details", () => {
      const validationErrors = [
        { path: "name", message: "Name is required" },
        { path: "email", message: "Invalid email" },
      ];
      const error = new ValidationError("Validation failed", validationErrors);
      expect(error.message).toBe("Validation failed");
      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.statusCode).toBe(400);
      expect(error.validationErrors).toEqual(validationErrors);
    });
  });

  describe("AuthenticationError", () => {
    it("should create an AuthenticationError", () => {
      const error = new AuthenticationError("Not authenticated");
      expect(error.message).toBe("Not authenticated");
      expect(error.code).toBe("AUTHENTICATION_ERROR");
      expect(error.statusCode).toBe(401);
    });
  });

  describe("AuthorizationError", () => {
    it("should create an AuthorizationError", () => {
      const error = new AuthorizationError("Access denied");
      expect(error.message).toBe("Access denied");
      expect(error.code).toBe("AUTHORIZATION_ERROR");
      expect(error.statusCode).toBe(403);
    });
  });

  describe("NotFoundError", () => {
    it("should create a NotFoundError with resource and ID", () => {
      const error = new NotFoundError("Pump", "123");
      expect(error.message).toBe("Pump with ID 123 not found");
      expect(error.code).toBe("NOT_FOUND");
      expect(error.statusCode).toBe(404);
    });

    it("should create a NotFoundError without ID", () => {
      const error = new NotFoundError("Pump");
      expect(error.message).toBe("Pump not found");
    });
  });

  describe("DatabaseError", () => {
    it("should create a DatabaseError with original error", () => {
      const originalError = new Error("Database connection failed");
      const error = new DatabaseError("Database operation failed", originalError);
      expect(error.message).toBe("Database operation failed");
      expect(error.code).toBe("DATABASE_ERROR");
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(false);
      expect(error.metadata?.originalError).toBe(originalError);
    });
  });
});
