import { describe, it, expect } from "vitest";
import {
  createPumpSchema,
  updatePumpSchema,
  pumpIdSchema,
} from "@/lib/validations/pumpSchemas";
import {
  createPumpConfigSchema,
  sendPumpCommandSchema,
} from "@/lib/validations/configSchemas";
import { loginSchema, signupSchema } from "@/lib/validations/authSchemas";
import { createPumpReadingSchema } from "@/lib/validations/readingSchemas";
import { createPumpAlertSchema } from "@/lib/validations/alertSchemas";

describe("Validation Schemas", () => {
  describe("Pump Schemas", () => {
    it("should validate a valid pump", () => {
      const validPump = {
        name: "Test Pump",
        location: "Test Location",
        latitude: 28.5383,
        longitude: -81.3792,
        status: "running",
      };

      const result = createPumpSchema.safeParse(validPump);
      expect(result.success).toBe(true);
    });

    it("should reject invalid pump status", () => {
      const invalidPump = {
        name: "Test Pump",
        status: "invalid_status",
      };

      const result = createPumpSchema.safeParse(invalidPump);
      expect(result.success).toBe(false);
    });

    it("should reject invalid latitude", () => {
      const invalidPump = {
        name: "Test Pump",
        latitude: 100, // Invalid latitude
      };

      const result = createPumpSchema.safeParse(invalidPump);
      expect(result.success).toBe(false);
    });

    it("should validate pump ID", () => {
      const validId = "123e4567-e89b-12d3-a456-426614174000";
      const result = pumpIdSchema.safeParse(validId);
      expect(result.success).toBe(true);
    });

    it("should reject invalid pump ID", () => {
      const invalidId = "not-a-uuid";
      const result = pumpIdSchema.safeParse(invalidId);
      expect(result.success).toBe(false);
    });
  });

  describe("Config Schemas", () => {
    it("should validate a valid pump config", () => {
      const validConfig = {
        pump_id: "123e4567-e89b-12d3-a456-426614174000",
        poll_interval: 30,
        alert_thresholds: {
          pressure_min: 20,
          pressure_max: 100,
        },
      };

      const result = createPumpConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
    });

    it("should reject invalid poll interval", () => {
      const invalidConfig = {
        pump_id: "123e4567-e89b-12d3-a456-426614174000",
        poll_interval: 2, // Too low
      };

      const result = createPumpConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });

    it("should validate pump command", () => {
      const validCommand = {
        pump_id: "123e4567-e89b-12d3-a456-426614174000",
        command_type: "start",
        command_value: null,
      };

      const result = sendPumpCommandSchema.safeParse(validCommand);
      expect(result.success).toBe(true);
    });
  });

  describe("Auth Schemas", () => {
    it("should validate a valid login", () => {
      const validLogin = {
        email: "test@example.com",
        password: "password123",
      };

      const result = loginSchema.safeParse(validLogin);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const invalidLogin = {
        email: "not-an-email",
        password: "password123",
      };

      const result = loginSchema.safeParse(invalidLogin);
      expect(result.success).toBe(false);
    });

    it("should validate signup with matching passwords", () => {
      const validSignup = {
        email: "test@example.com",
        password: "Password123",
        confirmPassword: "Password123",
      };

      const result = signupSchema.safeParse(validSignup);
      expect(result.success).toBe(true);
    });

    it("should reject signup with mismatched passwords", () => {
      const invalidSignup = {
        email: "test@example.com",
        password: "Password123",
        confirmPassword: "DifferentPassword123",
      };

      const result = signupSchema.safeParse(invalidSignup);
      expect(result.success).toBe(false);
    });
  });

  describe("Reading Schemas", () => {
    it("should validate a valid pump reading", () => {
      const validReading = {
        pump_id: "123e4567-e89b-12d3-a456-426614174000",
        pressure: 45.5,
        flow_rate: 25.3,
        temperature: 75.2,
        status: "running",
      };

      const result = createPumpReadingSchema.safeParse(validReading);
      expect(result.success).toBe(true);
    });

    it("should reject invalid pressure", () => {
      const invalidReading = {
        pump_id: "123e4567-e89b-12d3-a456-426614174000",
        pressure: -10, // Invalid
      };

      const result = createPumpReadingSchema.safeParse(invalidReading);
      expect(result.success).toBe(false);
    });
  });

  describe("Alert Schemas", () => {
    it("should validate a valid alert", () => {
      const validAlert = {
        pump_id: "123e4567-e89b-12d3-a456-426614174000",
        severity: "warning",
        message: "Test alert message",
      };

      const result = createPumpAlertSchema.safeParse(validAlert);
      expect(result.success).toBe(true);
    });

    it("should reject invalid severity", () => {
      const invalidAlert = {
        pump_id: "123e4567-e89b-12d3-a456-426614174000",
        severity: "invalid",
        message: "Test alert",
      };

      const result = createPumpAlertSchema.safeParse(invalidAlert);
      expect(result.success).toBe(false);
    });
  });
});
