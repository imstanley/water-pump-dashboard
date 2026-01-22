import { createClient } from "@/lib/supabase/client";
import { isDemoModeSync } from "@/lib/demo/isDemoMode";
import type {
  PumpReading,
  PumpControl,
  PumpConfig,
  PumpMetrics,
} from "@/types/pump";

// Import demo API functions
import * as demoApi from "@/lib/demo/demoApi";

const supabase = createClient();

// Check if we should use demo mode
const useDemoMode = () => {
  const demoMode = isDemoModeSync();
  return demoMode ?? false;
};

/**
 * Fetches the latest pump reading from the database
 */
export const getLatestReading = async (pumpId?: string): Promise<PumpReading | null> => {
  if (useDemoMode()) {
    return demoApi.getLatestReading();
  }

  let query = supabase
    .from("pump_readings")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(1);

  if (pumpId) {
    query = query.eq("pump_id", pumpId);
  }

  const { data, error } = await query.single();

  if (error) {
    console.error("Error fetching latest reading:", error);
    return null;
  }

  return data;
};

/**
 * Fetches pump readings within a date range
 */
export const getReadingsInRange = async (
  startDate: Date,
  endDate: Date,
  pumpId?: string
): Promise<PumpReading[]> => {
  if (useDemoMode()) {
    return demoApi.getReadingsInRange(startDate, endDate);
  }

  let query = supabase
    .from("pump_readings")
    .select("*")
    .gte("timestamp", startDate.toISOString())
    .lte("timestamp", endDate.toISOString())
    .order("timestamp", { ascending: true });

  if (pumpId) {
    query = query.eq("pump_id", pumpId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching readings:", error);
    return [];
  }

  return data || [];
};

/**
 * Fetches aggregated pump metrics
 */
export const getPumpMetrics = async (pumpId?: string): Promise<PumpMetrics> => {
  if (useDemoMode()) {
    return demoApi.getPumpMetrics();
  }

  const latest = await getLatestReading(pumpId);

  let query = supabase
    .from("pump_readings")
    .select("pressure, flow_rate, temperature")
    .order("timestamp", { ascending: false })
    .limit(100);

  if (pumpId) {
    query = query.eq("pump_id", pumpId);
  }

  const { data, error } = await query;

  if (error || !data || data.length === 0) {
    return {
      latest,
      avgPressure: null,
      avgFlowRate: null,
      avgTemperature: null,
      totalReadings: 0,
    };
  }

  const avgPressure =
    data.reduce((sum: number, r: any) => sum + (r.pressure || 0), 0) / data.length;
  const avgFlowRate =
    data.reduce((sum: number, r: any) => sum + (r.flow_rate || 0), 0) / data.length;
  const avgTemperature =
    data.reduce((sum: number, r: any) => sum + (r.temperature || 0), 0) / data.length;

  return {
    latest,
    avgPressure,
    avgFlowRate,
    avgTemperature,
    totalReadings: data.length,
  };
};

/**
 * Fetches pump configuration
 */
export const getPumpConfig = async (pumpId?: string): Promise<PumpConfig | null> => {
  if (useDemoMode()) {
    return demoApi.getPumpConfig();
  }

  let query = supabase.from("pump_config").select("*");

  if (pumpId) {
    query = query.eq("pump_id", pumpId).single();
  } else {
    query = query.order("created_at", { ascending: false }).limit(1).single();
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching pump config:", error);
    return null;
  }

  return data;
};

/**
 * Updates pump configuration
 */
export const updatePumpConfig = async (
  config: Partial<PumpConfig>,
  pumpId?: string
): Promise<PumpConfig | null> => {
  if (useDemoMode()) {
    return demoApi.updatePumpConfig(config);
  }

  if (!pumpId && !config.pump_id) {
    console.error("Pump ID is required for config update");
    return null;
  }

  const targetPumpId = pumpId || config.pump_id!;

  const { data: currentConfig } = await supabase
    .from("pump_config")
    .select("*")
    .eq("pump_id", targetPumpId)
    .single();

  if (!currentConfig) {
    const { data, error } = await supabase
      .from("pump_config")
      .insert([
        {
          ...config,
          pump_id: targetPumpId,
        } as PumpConfig,
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating pump config:", error);
      return null;
    }
    return data;
  }

  const { data, error } = await supabase
    .from("pump_config")
    .update(config)
    .eq("id", currentConfig.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating pump config:", error);
    return null;
  }

  return data;
};

/**
 * Sends a control command to the pump API
 * 
 * Supports:
 * - Virtual SCADA control commands
 * - Hunter's Centralus & Hydrawise zone/pump controls
 * 
 * Adjust the request format based on your specific API requirements
 */
export const sendPumpCommand = async (
  commandType: string,
  commandValue?: string
): Promise<PumpControl | null> => {
  // Check if we should use demo mode
  if (useDemoMode()) {
    // Get a pump ID from config or use default demo pump
    const config = await getPumpConfig();
    const pumpId = config?.pump_id || "demo-pump-1";
    return demoApi.sendPumpCommand(commandType, commandValue, pumpId);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Create control record
  const { data: control, error: controlError } = await supabase
    .from("pump_controls")
    .insert([
      {
        command_type: commandType,
        command_value: commandValue || null,
        status: "pending",
        created_by: user?.id || null,
      },
    ])
    .select()
    .single();

  if (controlError || !control) {
    const errorMessage = controlError?.message || "Unknown error";
    const errorDetails = controlError?.details || controlError?.hint || "";
    console.error("Error creating pump control:", {
      message: errorMessage,
      details: errorDetails,
      code: controlError?.code,
      fullError: controlError,
    });
    return null;
  }

  // Fetch API config
  const config = await getPumpConfig();

  if (!config?.api_endpoint) {
    // Update control status to failed if no API endpoint configured
    await supabase
      .from("pump_controls")
      .update({ status: "failed" })
      .eq("id", control.id);
    return { ...control, status: "failed" };
  }

  try {
    // Call the external pump API
    // Adjust the request body format based on your system:
    // - Virtual SCADA may use different command structure
    // - Hydrawise may require zone IDs or different parameters
    const response = await fetch(`${config.api_endpoint}/control`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(config.api_key && { Authorization: `Bearer ${config.api_key}` }),
      },
      body: JSON.stringify({
        command: commandType,
        value: commandValue,
        // Add system-specific fields as needed:
        // timestamp: new Date().toISOString(),
        // zone_id: "optional_zone_id",
      }),
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    const result = await response.json();

    // Update control status to executed
    const { data: updatedControl, error: updateError } = await supabase
      .from("pump_controls")
      .update({
        status: "executed",
        executed_at: new Date().toISOString(),
      })
      .eq("id", control.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating pump control:", updateError);
    }

    return updatedControl || control;
  } catch (error) {
    console.error("Error calling pump API:", error);

    // Update control status to failed
    await supabase
      .from("pump_controls")
      .update({ status: "failed" })
      .eq("id", control.id);

    return { ...control, status: "failed" };
  }
};

/**
 * Polls the pump API for new readings
 * This should be called from a server-side job/cron, not directly from the client
 * 
 * Supports:
 * - Virtual SCADA systems
 * - Hunter's Centralus & Hydrawise
 * 
 * Customize the response mapping below based on your specific API format
 */
export const pollPumpApi = async (pumpId: string): Promise<PumpReading | null> => {
  if (useDemoMode()) {
    return demoApi.pollPumpApi(pumpId);
  }

  const config = await getPumpConfig(pumpId);

  if (!config?.api_endpoint) {
    console.warn("Pump API endpoint not configured");
    return null;
  }

  try {
    const response = await fetch(`${config.api_endpoint}/status`, {
      method: "GET",
      headers: {
        ...(config.api_key && { Authorization: `Bearer ${config.api_key}` }),
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Map API response to our standard format
    // Adjust field names based on your system:
    // - Virtual SCADA may use different field names
    // - Hydrawise/Centralus may have different structure
    const mappedData = {
      pressure: data.pressure ?? data.Pressure ?? data.psi ?? null,
      flow_rate: data.flow_rate ?? data.FlowRate ?? data.gpm ?? null,
      temperature: data.temperature ?? data.Temperature ?? data.temp ?? null,
      status: data.status ?? data.Status ?? "unknown",
      power_consumption: data.power_consumption ?? data.PowerConsumption ?? data.watts ?? null,
    };

    // Insert reading into database
    const { data: reading, error } = await supabase
      .from("pump_readings")
      .insert([
        {
          pump_id: pumpId,
          timestamp: new Date().toISOString(),
          pressure: mappedData.pressure,
          flow_rate: mappedData.flow_rate,
          temperature: mappedData.temperature,
          status: mappedData.status,
          power_consumption: mappedData.power_consumption,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error saving pump reading:", error);
      return null;
    }

    // Check for alerts based on thresholds
    if (config.alert_thresholds) {
      await checkAndCreateAlerts(reading, config.alert_thresholds, pumpId);
    }

    return reading;
  } catch (error) {
    console.error("Error polling pump API:", error);
    return null;
  }
};

/**
 * Checks readings against thresholds and creates alerts if needed
 */
const checkAndCreateAlerts = async (
  reading: PumpReading,
  thresholds: PumpConfig["alert_thresholds"],
  pumpId: string
): Promise<void> => {
  const alerts: Array<{ severity: "critical" | "warning" | "info"; message: string }> = [];

  if (reading.pressure !== null) {
    if (thresholds.pressure_max && reading.pressure > thresholds.pressure_max) {
      alerts.push({
        severity: "critical",
        message: `Pressure too high: ${reading.pressure} PSI (max: ${thresholds.pressure_max} PSI)`,
      });
    }
    if (thresholds.pressure_min && reading.pressure < thresholds.pressure_min) {
      alerts.push({
        severity: "warning",
        message: `Pressure too low: ${reading.pressure} PSI (min: ${thresholds.pressure_min} PSI)`,
      });
    }
  }

  if (reading.flow_rate !== null) {
    if (thresholds.flow_rate_max && reading.flow_rate > thresholds.flow_rate_max) {
      alerts.push({
        severity: "warning",
        message: `Flow rate too high: ${reading.flow_rate} GPM (max: ${thresholds.flow_rate_max} GPM)`,
      });
    }
    if (thresholds.flow_rate_min && reading.flow_rate < thresholds.flow_rate_min) {
      alerts.push({
        severity: "warning",
        message: `Flow rate too low: ${reading.flow_rate} GPM (min: ${thresholds.flow_rate_min} GPM)`,
      });
    }
  }

  if (reading.temperature !== null && thresholds.temperature_max) {
    if (reading.temperature > thresholds.temperature_max) {
      alerts.push({
        severity: "critical",
        message: `Temperature too high: ${reading.temperature}°F (max: ${thresholds.temperature_max}°F)`,
      });
    }
  }

  if (reading.status === "error") {
    alerts.push({
      severity: "critical",
      message: "Pump status: ERROR",
    });
  }

  // Create alerts
  for (const alert of alerts) {
    await supabase.from("pump_alerts").insert([
      {
        severity: alert.severity,
        message: alert.message,
        pump_reading_id: reading.id,
        acknowledged: false,
      },
    ]);
  }
};
