import type { Pump, PumpReading, PumpAlert, PumpConfig } from "@/types/pump";

export const mockPump: Pump = {
  id: "test-pump-1",
  name: "Test Pump",
  location: "Test Location",
  latitude: 28.5383,
  longitude: -81.3792,
  api_endpoint: "https://api.example.com",
  api_key: "test-key",
  status: "running",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  created_by: "test-user-id",
};

export const mockPumpReading: PumpReading = {
  id: "test-reading-1",
  pump_id: "test-pump-1",
  timestamp: new Date().toISOString(),
  pressure: 45.5,
  flow_rate: 25.3,
  temperature: 75.2,
  status: "running",
  power_consumption: 1200.0,
  created_at: new Date().toISOString(),
};

export const mockPumpAlert: PumpAlert = {
  id: "test-alert-1",
  pump_id: "test-pump-1",
  severity: "warning",
  message: "Test alert message",
  pump_reading_id: "test-reading-1",
  acknowledged: false,
  acknowledged_at: null,
  acknowledged_by: null,
  created_at: new Date().toISOString(),
};

export const mockPumpConfig: PumpConfig = {
  id: "test-config-1",
  pump_id: "test-pump-1",
  api_endpoint: "https://api.example.com",
  api_key: "test-key",
  poll_interval: 30,
  alert_thresholds: {
    pressure_min: 20,
    pressure_max: 100,
    flow_rate_min: 5,
    flow_rate_max: 50,
    temperature_max: 120,
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  updated_by: "test-user-id",
};

export const createMockPump = (overrides?: Partial<Pump>): Pump => ({
  ...mockPump,
  ...overrides,
});

export const createMockPumpReading = (
  overrides?: Partial<PumpReading>
): PumpReading => ({
  ...mockPumpReading,
  ...overrides,
});

export const createMockPumpAlert = (
  overrides?: Partial<PumpAlert>
): PumpAlert => ({
  ...mockPumpAlert,
  ...overrides,
});
