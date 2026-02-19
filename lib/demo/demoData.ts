/**
 * Demo Data Generators
 * 
 * Generates realistic mock data for pump readings, alerts, and metrics
 */

import type {
  PumpReading,
  PumpAlert,
  PumpConfig,
  PumpMetrics,
  PumpStatus,
  AlertSeverity,
} from "@/types/pump";

// Realistic ranges for pump data
const PRESSURE_MIN = 35;
const PRESSURE_MAX = 65;
const FLOW_RATE_MIN = 12;
const FLOW_RATE_MAX = 38;
const TEMPERATURE_MIN = 68;
const TEMPERATURE_MAX = 88;
const POWER_CONSUMPTION_MIN = 800;
const POWER_CONSUMPTION_MAX = 1500;

/**
 * Generate a realistic pump reading with slight variations
 */
export const generatePumpReading = (pumpId: string, baseReading?: Partial<PumpReading>): PumpReading => {
  const now = new Date();
  const hour = now.getHours();
  
  // Simulate diurnal patterns - lower values at night, higher during day
  const timeOfDayFactor = 0.7 + 0.3 * (0.5 + 0.5 * Math.sin((hour - 6) * Math.PI / 12));
  
  // Add some random variation
  const randomFactor = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
  
  const pressure = baseReading?.pressure ?? 
    PRESSURE_MIN + (PRESSURE_MAX - PRESSURE_MIN) * timeOfDayFactor * randomFactor;
  
  const flowRate = baseReading?.flow_rate ??
    FLOW_RATE_MIN + (FLOW_RATE_MAX - FLOW_RATE_MIN) * timeOfDayFactor * randomFactor;
  
  const temperature = baseReading?.temperature ??
    TEMPERATURE_MIN + (TEMPERATURE_MAX - TEMPERATURE_MIN) * (0.5 + Math.random() * 0.5);
  
  const powerConsumption = baseReading?.power_consumption ??
    POWER_CONSUMPTION_MIN + (POWER_CONSUMPTION_MAX - POWER_CONSUMPTION_MIN) * timeOfDayFactor;
  
  // Determine status - mostly running, occasional stopped
  const statusRoll = Math.random();
  let status: PumpStatus = "running";
  if (statusRoll < 0.05) {
    status = "stopped";
  } else if (statusRoll < 0.08) {
    status = "error";
  }

  return {
    id: `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    pump_id: pumpId,
    timestamp: (baseReading?.timestamp ?? now.toISOString()),
    pressure: Math.round(pressure * 10) / 10,
    flow_rate: Math.round(flowRate * 10) / 10,
    temperature: Math.round(temperature * 10) / 10,
    status,
    power_consumption: Math.round(powerConsumption),
    created_at: now.toISOString(),
  };
};

/**
 * Generate historical readings for a date range
 */
export const generateHistoricalReadings = (
  pumpId: string,
  startDate: Date,
  endDate: Date,
  intervalMinutes: number = 15
): PumpReading[] => {
  const readings: PumpReading[] = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const reading = generatePumpReading(pumpId, {
      timestamp: current.toISOString(),
    });
    readings.push(reading);
    
    // Move to next interval
    current.setMinutes(current.getMinutes() + intervalMinutes);
  }
  
  return readings;
};

/**
 * Generate sample alerts with varied severity
 */
export const generateSampleAlerts = (pumpId: string, count: number = 10): PumpAlert[] => {
  const alerts: PumpAlert[] = [];
  const now = new Date();
  
  const alertTemplates = [
    {
      severity: "critical" as AlertSeverity,
      messages: [
        "Pressure dropped below 30 PSI - Check for leaks",
        "Pump temperature exceeded 90°F - Immediate attention required",
        "Flow rate dropped to 0 GPM - Pump may be blocked",
        "Power consumption spike detected - Electrical issue possible",
        "Pump status: ERROR - Manual inspection required",
        "Seal failure detected - Shutdown initiated",
        "Motor overheating - Automatic emergency stop triggered",
        "Bearing vibration exceeded safe threshold",
        "Cavitation detected - Inlet blockage likely",
        "Communication lost with pump controller for 15+ minutes",
      ],
    },
    {
      severity: "warning" as AlertSeverity,
      messages: [
        "Pressure below recommended threshold (40 PSI)",
        "Flow rate lower than expected for current operation",
        "Temperature approaching maximum (85°F)",
        "Unusual power consumption pattern detected",
        "Pump running longer than scheduled cycle",
        "Filter pressure differential rising - Cleaning recommended",
        "Voltage fluctuation detected on power supply",
        "Runtime exceeded daily limit by 20%",
        "Backup pump failed self-test",
        "Water level in supply tank is low",
      ],
    },
    {
      severity: "info" as AlertSeverity,
      messages: [
        "Scheduled maintenance due in 7 days",
        "Pump cycle completed successfully",
        "Normal operating parameters within range",
        "Daily usage summary: 12,450 gallons",
        "System health check completed - All systems OK",
        "Firmware update available for controller",
        "Weekly performance report generated",
        "Pump restarted after scheduled maintenance window",
      ],
    },
  ];
  
  for (let i = 0; i < count; i++) {
    const severityRoll = Math.random();
    let severity: AlertSeverity = "info";
    if (severityRoll < 0.35) {
      severity = "critical";
    } else if (severityRoll < 0.65) {
      severity = "warning";
    }
    
    const templates = alertTemplates.find((t) => t.severity === severity) || alertTemplates[2];
    const message = templates.messages[Math.floor(Math.random() * templates.messages.length)];
    
    const alertTime = new Date(now);
    alertTime.setHours(alertTime.getHours() - Math.floor(Math.random() * 168));
    alertTime.setMinutes(alertTime.getMinutes() - Math.floor(Math.random() * 60));
    
    const acknowledged = Math.random() < 0.25;
    
    alerts.push({
      id: `demo-alert-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
      pump_id: pumpId,
      severity,
      message,
      pump_reading_id: null,
      acknowledged,
      acknowledged_at: acknowledged ? new Date(alertTime.getTime() + 1000 * 60 * 15).toISOString() : null,
      acknowledged_by: acknowledged ? `demo-user-${i}` : null,
      created_at: alertTime.toISOString(),
    });
  }
  
  // Sort by created_at descending (newest first)
  return alerts.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
};

/**
 * Calculate metrics from readings
 */
export const calculateMetrics = (readings: PumpReading[]): PumpMetrics => {
  if (readings.length === 0) {
    return {
      latest: null,
      avgPressure: null,
      avgFlowRate: null,
      avgTemperature: null,
      totalReadings: 0,
    };
  }
  
  const latest = readings[readings.length - 1];
  
  const pressures = readings.map((r) => r.pressure).filter((p) => p !== null) as number[];
  const flowRates = readings.map((r) => r.flow_rate).filter((f) => f !== null) as number[];
  const temperatures = readings.map((r) => r.temperature).filter((t) => t !== null) as number[];
  
  const avgPressure = pressures.length > 0
    ? pressures.reduce((sum, p) => sum + p, 0) / pressures.length
    : null;
  
  const avgFlowRate = flowRates.length > 0
    ? flowRates.reduce((sum, f) => sum + f, 0) / flowRates.length
    : null;
  
  const avgTemperature = temperatures.length > 0
    ? temperatures.reduce((sum, t) => sum + t, 0) / temperatures.length
    : null;
  
  return {
    latest,
    avgPressure: avgPressure ? Math.round(avgPressure * 10) / 10 : null,
    avgFlowRate: avgFlowRate ? Math.round(avgFlowRate * 10) / 10 : null,
    avgTemperature: avgTemperature ? Math.round(avgTemperature * 10) / 10 : null,
    totalReadings: readings.length,
  };
};

/**
 * Get default pump configuration for demo mode
 */
export const getDefaultPumpConfig = (pumpId: string): PumpConfig => {
  return {
    id: `demo-config-${pumpId}`,
    pump_id: pumpId,
    api_endpoint: null,
    api_key: null,
    poll_interval: 30,
    alert_thresholds: {
      pressure_min: 35,
      pressure_max: 60,
      flow_rate_min: 15,
      flow_rate_max: 35,
      temperature_max: 85,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    updated_by: null,
  };
};
