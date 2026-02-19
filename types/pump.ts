export type PumpStatus = "running" | "stopped" | "error" | "unknown";

export interface Pump {
  id: string;
  name: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  api_endpoint: string | null;
  api_key: string | null;
  status: PumpStatus;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface PumpReading {
  id: string;
  pump_id: string;
  timestamp: string;
  pressure: number | null;
  flow_rate: number | null;
  temperature: number | null;
  status: PumpStatus;
  power_consumption: number | null;
  created_at: string;
}

export type AlertSeverity = "critical" | "warning" | "info";

export interface PumpAlert {
  id: string;
  pump_id: string;
  severity: AlertSeverity;
  message: string;
  pump_reading_id: string | null;
  acknowledged: boolean;
  acknowledged_at: string | null;
  acknowledged_by: string | null;
  created_at: string;
}

export interface PumpConfig {
  id: string;
  pump_id: string;
  api_endpoint: string | null;
  api_key: string | null;
  poll_interval: number;
  alert_thresholds: {
    pressure_min?: number;
    pressure_max?: number;
    flow_rate_min?: number;
    flow_rate_max?: number;
    temperature_max?: number;
  };
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export interface PumpControl {
  id: string;
  pump_id: string;
  command_type: string;
  command_value: string | null;
  status: "pending" | "executed" | "failed";
  executed_at: string | null;
  created_by: string | null;
  created_at: string;
}

export interface PumpMetrics {
  latest: PumpReading | null;
  avgPressure: number | null;
  avgFlowRate: number | null;
  avgTemperature: number | null;
  totalReadings: number;
}

export type UserRole = "admin" | "operator" | "viewer";

export interface UserSettings {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  notifications_enabled: boolean;
  alert_email: boolean;
  alert_sms: boolean;
  created_at: string;
  updated_at: string;
}
