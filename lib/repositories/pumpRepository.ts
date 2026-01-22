import { createClient } from "@/lib/supabase/server";
import type { Pump, PumpReading, PumpAlert, PumpConfig, PumpControl } from "@/types/pump";
import { logger } from "@/lib/logging/logger";
import { DatabaseError } from "@/lib/errors/AppError";

/**
 * Repository pattern for data access
 * Abstracts database operations from business logic
 */
export class PumpRepository {
  /**
   * Get all pumps from database
   */
  async findAll(): Promise<Pump[]> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("pumps")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw new DatabaseError("Failed to fetch pumps", error);
      }

      return data || [];
    } catch (error) {
      logger.error("Error in PumpRepository.findAll", {}, error as Error);
      throw error;
    }
  }

  /**
   * Find a pump by ID
   */
  async findById(id: string): Promise<Pump | null> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("pumps")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // Not found
          return null;
        }
        throw new DatabaseError("Failed to fetch pump", error);
      }

      return data;
    } catch (error) {
      logger.error("Error in PumpRepository.findById", { pumpId: id }, error as Error);
      throw error;
    }
  }

  /**
   * Create a new pump
   */
  async create(pump: Omit<Pump, "id" | "created_at" | "updated_at">): Promise<Pump> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("pumps")
        .insert([pump])
        .select()
        .single();

      if (error) {
        throw new DatabaseError("Failed to create pump", error);
      }

      if (!data) {
        throw new DatabaseError("Pump creation returned no data");
      }

      return data;
    } catch (error) {
      logger.error("Error in PumpRepository.create", {}, error as Error);
      throw error;
    }
  }

  /**
   * Update a pump
   */
  async update(id: string, updates: Partial<Omit<Pump, "id" | "created_at" | "updated_at">>): Promise<Pump> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("pumps")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new DatabaseError("Failed to update pump", error);
      }

      if (!data) {
        throw new DatabaseError("Pump update returned no data");
      }

      return data;
    } catch (error) {
      logger.error("Error in PumpRepository.update", { pumpId: id }, error as Error);
      throw error;
    }
  }

  /**
   * Delete a pump
   */
  async delete(id: string): Promise<void> {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from("pumps").delete().eq("id", id);

      if (error) {
        throw new DatabaseError("Failed to delete pump", error);
      }
    } catch (error) {
      logger.error("Error in PumpRepository.delete", { pumpId: id }, error as Error);
      throw error;
    }
  }

  /**
   * Get latest reading for a pump
   */
  async findLatestReading(pumpId?: string): Promise<PumpReading | null> {
    try {
      const supabase = await createClient();
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
        if (error.code === "PGRST116") {
          return null;
        }
        throw new DatabaseError("Failed to fetch latest reading", error);
      }

      return data;
    } catch (error) {
      logger.error("Error in PumpRepository.findLatestReading", { pumpId }, error as Error);
      throw error;
    }
  }

  /**
   * Get readings in date range
   */
  async findReadingsInRange(
    startDate: Date,
    endDate: Date,
    pumpId?: string
  ): Promise<PumpReading[]> {
    try {
      const supabase = await createClient();
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
        throw new DatabaseError("Failed to fetch readings", error);
      }

      return data || [];
    } catch (error) {
      logger.error("Error in PumpRepository.findReadingsInRange", { pumpId }, error as Error);
      throw error;
    }
  }
}

// Export singleton instance
export const pumpRepository = new PumpRepository();
