/**
 * Deterministic Demo Pump Generator
 * 
 * Generates stable, seeded pump data for demo mode.
 * Same seed = same pumps (deterministic).
 */

import type { Pump, PumpStatus } from "@/types/pump";

// Seeded random number generator for deterministic output
class SeededRandom {
  private seed: number;

  constructor(seed: string) {
    this.seed = this.hashString(seed);
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }
}

// Florida city centers for pump distribution
const FLORIDA_CITIES = [
  { name: "Orlando", lat: 28.5383, lng: -81.3792 },
  { name: "Tampa", lat: 27.9506, lng: -82.4572 },
  { name: "Miami", lat: 25.7617, lng: -80.1918 },
  { name: "Jacksonville", lat: 30.3322, lng: -81.6557 },
  { name: "Fort Lauderdale", lat: 26.1224, lng: -80.1373 },
  { name: "West Palm Beach", lat: 26.7153, lng: -80.0534 },
  { name: "Sarasota", lat: 27.3364, lng: -82.5307 },
  { name: "Naples", lat: 26.1420, lng: -81.7948 },
];

// Pump name prefixes and suffixes
const PUMP_PREFIXES = ["Station", "Pump", "Well", "Zone", "Field"];
const PUMP_SUFFIXES = ["A", "B", "C", "North", "South", "East", "West", "Main", "Primary", "Secondary"];

export interface DemoPumpData {
  id: string;
  name: string;
  status: PumpStatus;
  pressure: number; // PSI
  flowRate: number; // GPM
  latitude: number;
  longitude: number;
  lastSeen: string; // ISO timestamp
  controllerId?: string;
  zoneIds?: string[];
  location?: string;
}

/**
 * Generate demo pumps with deterministic seeded randomness
 */
export function generateDemoPumps(count: number = 25, seed: string = "florida-v1"): DemoPumpData[] {
  const rng = new SeededRandom(seed);
  const pumps: DemoPumpData[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    // Select city and add small random offset
    const city = FLORIDA_CITIES[i % FLORIDA_CITIES.length];
    const latOffset = rng.nextFloat(-0.15, 0.15);
    const lngOffset = rng.nextFloat(-0.15, 0.15);

    // Generate pump name
    const prefix = PUMP_PREFIXES[rng.nextInt(0, PUMP_PREFIXES.length - 1)];
    const suffix = PUMP_SUFFIXES[rng.nextInt(0, PUMP_SUFFIXES.length - 1)];
    const number = rng.nextInt(1, 99);
    const name = `${prefix} ${suffix}-${number.toString().padStart(2, "0")}`;

    // Status distribution: 70% running, 20% stopped, 10% alert
    const statusRoll = rng.next();
    let status: PumpStatus = "running";
    if (statusRoll < 0.7) {
      status = "running";
    } else if (statusRoll < 0.9) {
      status = "stopped";
    } else {
      status = "error"; // "error" maps to "alert" in UI
    }

    // Generate initial metrics based on status
    let pressure = 0;
    let flowRate = 0;
    if (status === "running") {
      pressure = rng.nextFloat(40, 65);
      flowRate = rng.nextFloat(20, 450);
    } else if (status === "stopped") {
      pressure = rng.nextFloat(0, 5);
      flowRate = 0;
    } else {
      // Alert state - could be high or low
      if (rng.next() < 0.5) {
        pressure = rng.nextFloat(70, 95); // High pressure alert
        flowRate = rng.nextFloat(0, 10);
      } else {
        pressure = rng.nextFloat(0, 25); // Low pressure alert
        flowRate = rng.nextFloat(0, 5);
      }
    }

    // Generate Hydrawise-style controller and zone IDs
    const controllerId = `HYD-${rng.nextInt(1000, 9999)}`;
    const zoneCount = rng.nextInt(1, 4);
    const zoneIds = Array.from({ length: zoneCount }, (_, j) => `Z${j + 1}`);

    // Last seen: within last 5 minutes to 2 hours
    const lastSeenMinutesAgo = rng.nextInt(5, 120);
    const lastSeen = new Date(now.getTime() - lastSeenMinutesAgo * 60 * 1000);

    pumps.push({
      id: `demo-pump-${i + 1}`,
      name,
      status,
      pressure: Math.round(pressure * 10) / 10,
      flowRate: Math.round(flowRate * 10) / 10,
      latitude: city.lat + latOffset,
      longitude: city.lng + lngOffset,
      lastSeen: lastSeen.toISOString(),
      controllerId,
      zoneIds,
      location: `${city.name}, FL`,
    });
  }

  return pumps;
}

/**
 * Simulate a tick - update pump metrics with small drift
 * This makes the demo feel "alive" without being chaotic
 */
export function simulateTick(pumps: DemoPumpData[]): DemoPumpData[] {
  const now = new Date();
  
  return pumps.map((pump) => {
    // Create a per-pump RNG based on pump ID for consistent behavior
    const rng = new SeededRandom(pump.id + Date.now().toString().slice(0, -3)); // Use seconds for tick-based seed

    // Update last seen
    const updatedPump = {
      ...pump,
      lastSeen: now.toISOString(),
    };

    // Only update running pumps
    if (pump.status === "running") {
      // Small drift in pressure (±2 PSI)
      const pressureDrift = rng.nextFloat(-2, 2);
      updatedPump.pressure = Math.max(0, Math.min(100, pump.pressure + pressureDrift));
      updatedPump.pressure = Math.round(updatedPump.pressure * 10) / 10;

      // Small drift in flow rate (±5 GPM)
      const flowDrift = rng.nextFloat(-5, 5);
      updatedPump.flowRate = Math.max(0, Math.min(500, pump.flowRate + flowDrift));
      updatedPump.flowRate = Math.round(updatedPump.flowRate * 10) / 10;

      // Occasional status transitions (rare - 2% chance)
      if (rng.next() < 0.02) {
        const transitionRoll = rng.next();
        if (transitionRoll < 0.5) {
          updatedPump.status = "stopped";
          updatedPump.pressure = 0;
          updatedPump.flowRate = 0;
        } else {
          updatedPump.status = "error";
          // Alert state - set extreme values
          if (rng.next() < 0.5) {
            updatedPump.pressure = rng.nextFloat(75, 95);
            updatedPump.flowRate = rng.nextFloat(0, 10);
          } else {
            updatedPump.pressure = rng.nextFloat(0, 25);
            updatedPump.flowRate = rng.nextFloat(0, 5);
          }
        }
      }
    } else if (pump.status === "stopped") {
      // Stopped pumps can occasionally start (5% chance)
      if (rng.next() < 0.05) {
        updatedPump.status = "running";
        updatedPump.pressure = rng.nextFloat(40, 65);
        updatedPump.flowRate = rng.nextFloat(20, 450);
      }
    } else if (pump.status === "error") {
      // Alert pumps can recover (10% chance) or stay in alert
      if (rng.next() < 0.1) {
        updatedPump.status = "running";
        updatedPump.pressure = rng.nextFloat(40, 65);
        updatedPump.flowRate = rng.nextFloat(20, 450);
      } else {
        // Keep alert but maybe adjust values slightly
        const pressureDrift = rng.nextFloat(-3, 3);
        updatedPump.pressure = Math.max(0, Math.min(100, pump.pressure + pressureDrift));
        updatedPump.pressure = Math.round(updatedPump.pressure * 10) / 10;
      }
    }

    return updatedPump;
  });
}

/**
 * Convert DemoPumpData to Pump type for compatibility
 */
export function demoPumpToPump(demoPump: DemoPumpData): Pump {
  return {
    id: demoPump.id,
    name: demoPump.name,
    location: demoPump.location || null,
    latitude: demoPump.latitude,
    longitude: demoPump.longitude,
    api_endpoint: null,
    api_key: null,
    status: demoPump.status,
    created_at: new Date().toISOString(),
    updated_at: demoPump.lastSeen,
    created_by: null,
  };
}
