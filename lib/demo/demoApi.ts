/**
 * Demo API Layer
 * 
 * Drop-in replacements for real API functions that use mock data
 * Same function signatures as the real API for easy swapping
 */

import type {
  PumpReading,
  PumpControl,
  PumpConfig,
  PumpMetrics,
} from "@/types/pump";
import {
  generatePumpReading,
  generateHistoricalReadings,
  generateSampleAlerts,
  calculateMetrics,
  getDefaultPumpConfig,
} from "./demoData";
import type { PumpAlert } from "@/types/pump";

// In-memory state for demo mode (per pump)
const demoReadingsByPump: Record<string, PumpReading[]> = {};
const demoAlertsByPump: Record<string, PumpAlert[]> = {};
const demoConfigsByPump: Record<string, PumpConfig> = {};

// Get demo pump IDs (matches the 25 pumps from pumpGenerator)
const getDemoPumpIds = (): string[] => {
  return Array.from({ length: 25 }, (_, i) => `demo-pump-${i + 1}`);
};

// Initialize demo data for a pump
const initializeDemoDataForPump = (pumpId: string) => {
  if (!demoReadingsByPump[pumpId]) {
    // Generate initial readings for the last 7 days
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 7);
    
    demoReadingsByPump[pumpId] = generateHistoricalReadings(pumpId, startDate, endDate, 15);
  }
  
  if (!demoAlertsByPump[pumpId]) {
    demoAlertsByPump[pumpId] = generateSampleAlerts(pumpId, 15);
  }
  
  if (!demoConfigsByPump[pumpId]) {
    demoConfigsByPump[pumpId] = getDefaultPumpConfig(pumpId);
  }
};

// Initialize all demo pumps
const initializeAllDemoData = () => {
  getDemoPumpIds().forEach((pumpId) => {
    initializeDemoDataForPump(pumpId);
  });
};

// Initialize on first load
if (typeof window !== "undefined") {
  initializeAllDemoData();
}

/**
 * Simulate a network delay for realistic feel
 */
const delay = (ms: number = 200): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Fetches the latest pump reading (demo)
 */
export const getLatestReading = async (pumpId?: string): Promise<PumpReading | null> => {
  await delay(150);
  
  const targetPumpId = pumpId || getDemoPumpIds()[0];
  initializeDemoDataForPump(targetPumpId);
  
  const readings = demoReadingsByPump[targetPumpId] || [];
  if (readings.length === 0) {
    return generatePumpReading(targetPumpId);
  }
  
  return readings[readings.length - 1];
};

/**
 * Fetches pump readings within a date range (demo)
 */
export const getReadingsInRange = async (
  startDate: Date,
  endDate: Date,
  pumpId?: string
): Promise<PumpReading[]> => {
  await delay(200);
  
  const targetPumpId = pumpId || getDemoPumpIds()[0];
  initializeDemoDataForPump(targetPumpId);
  
  const readings = demoReadingsByPump[targetPumpId] || [];
  const filtered = readings.filter((reading) => {
    const readingDate = new Date(reading.timestamp);
    return readingDate >= startDate && readingDate <= endDate;
  });
  
  // If we don't have enough data for the range, generate some
  if (filtered.length < 10) {
    const generated = generateHistoricalReadings(targetPumpId, startDate, endDate, 15);
    // Merge with existing, avoiding duplicates
    const existingTimes = new Set(filtered.map((r) => r.timestamp));
    const newReadings = generated.filter((r) => !existingTimes.has(r.timestamp));
    filtered.push(...newReadings);
    filtered.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }
  
  return filtered;
};

/**
 * Fetches aggregated pump metrics (demo)
 */
export const getPumpMetrics = async (pumpId?: string): Promise<PumpMetrics> => {
  await delay(180);
  
  const targetPumpId = pumpId || getDemoPumpIds()[0];
  initializeDemoDataForPump(targetPumpId);
  
  // Use recent readings (last 100)
  const readings = demoReadingsByPump[targetPumpId] || [];
  const recentReadings = readings.slice(-100);
  
  if (recentReadings.length === 0) {
    const newReading = generatePumpReading(targetPumpId);
    if (!demoReadingsByPump[targetPumpId]) {
      demoReadingsByPump[targetPumpId] = [];
    }
    demoReadingsByPump[targetPumpId].push(newReading);
    return {
      latest: newReading,
      avgPressure: newReading.pressure,
      avgFlowRate: newReading.flow_rate,
      avgTemperature: newReading.temperature,
      totalReadings: 1,
    };
  }
  
  return calculateMetrics(recentReadings);
};

/**
 * Fetches pump configuration (demo)
 */
export const getPumpConfig = async (pumpId?: string): Promise<PumpConfig | null> => {
  await delay(100);
  
  const targetPumpId = pumpId || getDemoPumpIds()[0];
  initializeDemoDataForPump(targetPumpId);
  
  return demoConfigsByPump[targetPumpId] || null;
};

/**
 * Updates pump configuration (demo)
 */
export const updatePumpConfig = async (
  config: Partial<PumpConfig>,
  pumpId?: string
): Promise<PumpConfig | null> => {
  await delay(300);
  
  const targetPumpId = pumpId || config.pump_id || getDemoPumpIds()[0];
  initializeDemoDataForPump(targetPumpId);
  
  if (!demoConfigsByPump[targetPumpId]) {
    demoConfigsByPump[targetPumpId] = getDefaultPumpConfig(targetPumpId);
  }
  
  demoConfigsByPump[targetPumpId] = {
    ...demoConfigsByPump[targetPumpId],
    ...config,
    pump_id: targetPumpId,
    updated_at: new Date().toISOString(),
  };
  
  return demoConfigsByPump[targetPumpId];
};

/**
 * Sends a control command to the pump API (demo)
 */
export const sendPumpCommand = async (
  commandType: string,
  commandValue: string | undefined,
  pumpId: string
): Promise<PumpControl | null> => {
  await delay(500);
  
  const control: PumpControl = {
    id: `demo-control-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    pump_id: pumpId,
    command_type: commandType,
    command_value: commandValue || null,
    status: "executed",
    executed_at: new Date().toISOString(),
    created_by: "demo-user",
    created_at: new Date().toISOString(),
  };
  
  // Simulate updating pump status if start/stop command
  if (commandType === "start" || commandType === "stop") {
    // Update the latest reading's status
    initializeDemoDataForPump(pumpId);
    const readings = demoReadingsByPump[pumpId] || [];
    if (readings.length > 0) {
      const latest = readings[readings.length - 1];
      latest.status = commandType === "start" ? "running" : "stopped";
    }
  }
  
  return control;
};

/**
 * Polls the pump API for new readings (demo)
 */
export const pollPumpApi = async (pumpId: string): Promise<PumpReading | null> => {
  await delay(400);
  
  initializeDemoDataForPump(pumpId);
  
  const newReading = generatePumpReading(pumpId);
  if (!demoReadingsByPump[pumpId]) {
    demoReadingsByPump[pumpId] = [];
  }
  demoReadingsByPump[pumpId].push(newReading);
  
  // Keep only last 1000 readings in memory per pump
  if (demoReadingsByPump[pumpId].length > 1000) {
    demoReadingsByPump[pumpId] = demoReadingsByPump[pumpId].slice(-1000);
  }
  
  // Occasionally generate alerts (10% chance)
  const config = demoConfigsByPump[pumpId];
  if (Math.random() < 0.1 && config?.alert_thresholds) {
    const thresholds = config.alert_thresholds;
    const alerts: PumpAlert[] = [];
    
    if (newReading.pressure !== null) {
      if (thresholds.pressure_max && newReading.pressure > thresholds.pressure_max) {
        alerts.push({
          id: `demo-alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          pump_id: pumpId,
          severity: "critical",
          message: `Pressure too high: ${newReading.pressure.toFixed(1)} PSI (max: ${thresholds.pressure_max} PSI)`,
          pump_reading_id: newReading.id,
          acknowledged: false,
          acknowledged_at: null,
          acknowledged_by: null,
          created_at: new Date().toISOString(),
        });
      }
      if (thresholds.pressure_min && newReading.pressure < thresholds.pressure_min) {
        alerts.push({
          id: `demo-alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          pump_id: pumpId,
          severity: "warning",
          message: `Pressure too low: ${newReading.pressure.toFixed(1)} PSI (min: ${thresholds.pressure_min} PSI)`,
          pump_reading_id: newReading.id,
          acknowledged: false,
          acknowledged_at: null,
          acknowledged_by: null,
          created_at: new Date().toISOString(),
        });
      }
    }
    
    if (newReading.temperature !== null && thresholds.temperature_max) {
      if (newReading.temperature > thresholds.temperature_max) {
        alerts.push({
          id: `demo-alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          pump_id: pumpId,
          severity: "critical",
          message: `Temperature too high: ${newReading.temperature.toFixed(1)}°F (max: ${thresholds.temperature_max}°F)`,
          pump_reading_id: newReading.id,
          acknowledged: false,
          acknowledged_at: null,
          acknowledged_by: null,
          created_at: new Date().toISOString(),
        });
      }
    }
    
    if (!demoAlertsByPump[pumpId]) {
      demoAlertsByPump[pumpId] = [];
    }
    demoAlertsByPump[pumpId].unshift(...alerts);
    // Keep only last 100 alerts per pump
    if (demoAlertsByPump[pumpId].length > 100) {
      demoAlertsByPump[pumpId] = demoAlertsByPump[pumpId].slice(0, 100);
    }
  }
  
  return newReading;
};

/**
 * Get all alerts (demo)
 */
export const getAlerts = async (pumpId?: string, acknowledged?: boolean): Promise<PumpAlert[]> => {
  await delay(150);
  
  if (pumpId) {
    initializeDemoDataForPump(pumpId);
    const alerts = demoAlertsByPump[pumpId] || [];
    if (acknowledged === undefined) {
      return alerts;
    }
    return alerts.filter((alert) => alert.acknowledged === acknowledged);
  }
  
  // Return all alerts from all pumps
  initializeAllDemoData();
  const allAlerts = Object.values(demoAlertsByPump).flat();
  if (acknowledged === undefined) {
    return allAlerts;
  }
  return allAlerts.filter((alert) => alert.acknowledged === acknowledged);
};

/**
 * Acknowledge an alert (demo)
 */
export const acknowledgeAlert = async (alertId: string): Promise<boolean> => {
  await delay(200);
  
  initializeAllDemoData();
  
  // Find the alert across all pumps
  for (const pumpId in demoAlertsByPump) {
    const alert = demoAlertsByPump[pumpId].find((a) => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledged_at = new Date().toISOString();
      alert.acknowledged_by = "demo-user";
      return true;
    }
  }
  
  return false;
};

/**
 * Set up real-time updates for demo mode
 */
export const setupDemoRealtime = (
  onNewReading: (reading: PumpReading) => void,
  onNewAlert: (alert: PumpAlert) => void,
  pumpId?: string
): (() => void) => {
  const targetPumpId = pumpId || getDemoPumpIds()[0];
  
  // Poll every 10 seconds in demo mode
  const interval = setInterval(async () => {
    const reading = await pollPumpApi(targetPumpId);
    if (reading) {
      onNewReading(reading);
    }
    
    // Check for new alerts (already generated in pollPumpApi)
    initializeDemoDataForPump(targetPumpId);
    const alerts = demoAlertsByPump[targetPumpId] || [];
    const unacknowledged = alerts.filter((a) => !a.acknowledged);
    if (unacknowledged.length > 0) {
      const newest = unacknowledged[0];
      if (newest.created_at && new Date(newest.created_at).getTime() > Date.now() - 15000) {
        onNewAlert(newest);
      }
    }
  }, 10000);
  
  return () => clearInterval(interval);
};
