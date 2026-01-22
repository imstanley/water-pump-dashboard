import type { Pump, PumpReading, PumpConfig, PumpControl } from "@/types/pump";
import { getPumps, getPump, createPump, updatePump, deletePump } from "@/lib/api/pumps";
import {
  getLatestReading,
  getReadingsInRange,
  getPumpMetrics,
  getPumpConfig,
  updatePumpConfig,
  sendPumpCommand,
} from "@/lib/api/pumpApi";
import type {
  CreatePumpInput,
  UpdatePumpInput,
} from "@/lib/validations/pumpSchemas";
import type {
  CreatePumpConfigInput,
  UpdatePumpConfigInput,
  SendPumpCommandInput,
} from "@/lib/validations/configSchemas";
import { logger } from "@/lib/logging/logger";

/**
 * Service layer for pump operations
 * Separates business logic from API/data access
 */
export class PumpService {
  /**
   * Get all pumps
   */
  async getAllPumps(): Promise<Pump[]> {
    try {
      return await getPumps();
    } catch (error) {
      logger.error("Error in PumpService.getAllPumps", {}, error as Error);
      throw error;
    }
  }

  /**
   * Get a single pump by ID
   */
  async getPumpById(id: string): Promise<Pump | null> {
    try {
      return await getPump(id);
    } catch (error) {
      logger.error("Error in PumpService.getPumpById", { pumpId: id }, error as Error);
      throw error;
    }
  }

  /**
   * Create a new pump
   */
  async createPump(data: CreatePumpInput, userId: string): Promise<Pump> {
    try {
      const pump = await createPump({
        ...data,
        created_by: userId,
      } as Parameters<typeof createPump>[0]);

      if (!pump) {
        throw new Error("Failed to create pump");
      }

      logger.info("Pump created via service", {
        pumpId: pump.id,
        userId,
      });

      return pump;
    } catch (error) {
      logger.error("Error in PumpService.createPump", { userId }, error as Error);
      throw error;
    }
  }

  /**
   * Update a pump
   */
  async updatePump(id: string, data: UpdatePumpInput): Promise<Pump> {
    try {
      const pump = await updatePump(id, data);

      if (!pump) {
        throw new Error(`Pump with ID ${id} not found`);
      }

      logger.info("Pump updated via service", {
        pumpId: id,
      });

      return pump;
    } catch (error) {
      logger.error("Error in PumpService.updatePump", { pumpId: id }, error as Error);
      throw error;
    }
  }

  /**
   * Delete a pump
   */
  async deletePump(id: string): Promise<void> {
    try {
      const success = await deletePump(id);

      if (!success) {
        throw new Error(`Failed to delete pump with ID ${id}`);
      }

      logger.info("Pump deleted via service", {
        pumpId: id,
      });
    } catch (error) {
      logger.error("Error in PumpService.deletePump", { pumpId: id }, error as Error);
      throw error;
    }
  }

  /**
   * Get latest reading for a pump
   */
  async getLatestReading(pumpId?: string): Promise<PumpReading | null> {
    try {
      return await getLatestReading(pumpId);
    } catch (error) {
      logger.error("Error in PumpService.getLatestReading", { pumpId }, error as Error);
      throw error;
    }
  }

  /**
   * Get readings in a date range
   */
  async getReadingsInRange(
    startDate: Date,
    endDate: Date,
    pumpId?: string
  ): Promise<PumpReading[]> {
    try {
      return await getReadingsInRange(startDate, endDate, pumpId);
    } catch (error) {
      logger.error("Error in PumpService.getReadingsInRange", { pumpId }, error as Error);
      throw error;
    }
  }

  /**
   * Get pump metrics
   */
  async getPumpMetrics(pumpId?: string) {
    try {
      return await getPumpMetrics(pumpId);
    } catch (error) {
      logger.error("Error in PumpService.getPumpMetrics", { pumpId }, error as Error);
      throw error;
    }
  }

  /**
   * Get pump configuration
   */
  async getPumpConfig(pumpId?: string): Promise<PumpConfig | null> {
    try {
      return await getPumpConfig(pumpId);
    } catch (error) {
      logger.error("Error in PumpService.getPumpConfig", { pumpId }, error as Error);
      throw error;
    }
  }

  /**
   * Update pump configuration
   */
  async updatePumpConfig(
    data: UpdatePumpConfigInput,
    pumpId: string,
    userId: string
  ): Promise<PumpConfig> {
    try {
      // Convert null values to undefined for type compatibility
      const cleanedData = {
        ...data,
        alert_thresholds: data.alert_thresholds ? {
          pressure_min: data.alert_thresholds.pressure_min ?? undefined,
          pressure_max: data.alert_thresholds.pressure_max ?? undefined,
          flow_rate_min: data.alert_thresholds.flow_rate_min ?? undefined,
          flow_rate_max: data.alert_thresholds.flow_rate_max ?? undefined,
          temperature_max: data.alert_thresholds.temperature_max ?? undefined,
        } : undefined,
        api_endpoint: data.api_endpoint ?? undefined,
        api_key: data.api_key ?? undefined,
      };
      const config = await updatePumpConfig(cleanedData, pumpId);

      if (!config) {
        throw new Error(`Failed to update config for pump ${pumpId}`);
      }

      logger.info("Pump config updated via service", {
        pumpId,
        userId,
      });

      return config;
    } catch (error) {
      logger.error("Error in PumpService.updatePumpConfig", { pumpId, userId }, error as Error);
      throw error;
    }
  }

  /**
   * Send a control command to a pump
   */
  async sendPumpCommand(
    commandType: SendPumpCommandInput["command_type"],
    commandValue: string | null,
    pumpId: string,
    userId: string
  ): Promise<PumpControl> {
    try {
      const control = await sendPumpCommand(commandType, commandValue ?? undefined);

      if (!control) {
        throw new Error(`Failed to send command to pump ${pumpId}`);
      }

      logger.info("Pump command sent via service", {
        pumpId,
        commandType,
        userId,
      });

      return control;
    } catch (error) {
      logger.error("Error in PumpService.sendPumpCommand", { pumpId, userId }, error as Error);
      throw error;
    }
  }
}

// Export singleton instance
export const pumpService = new PumpService();
