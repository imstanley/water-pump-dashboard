import { createClient } from "@/lib/supabase/client";
import { isDemoModeSync } from "@/lib/demo/isDemoMode";
import { generateDemoPumps, demoPumpToPump } from "@/lib/demo/pumpGenerator";
import type { Pump } from "@/types/pump";

const supabase = createClient();

// Cache for demo pumps to ensure consistency
let cachedDemoPumps: Pump[] | null = null;

/**
 * Get all pumps
 */
export const getPumps = async (): Promise<Pump[]> => {
  const isDemo = isDemoModeSync();
  
  if (isDemo) {
    // Generate demo pumps if not cached (deterministic seed ensures consistency)
    if (!cachedDemoPumps) {
      const demoPumps = generateDemoPumps(25, "florida-v1");
      cachedDemoPumps = demoPumps.map(demoPumpToPump);
    }
    return cachedDemoPumps;
  }

  const { data, error } = await supabase
    .from("pumps")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching pumps:", error);
    return [];
  }

  return data || [];
};

/**
 * Get a single pump by ID
 */
export const getPump = async (id: string): Promise<Pump | null> => {
  const isDemo = isDemoModeSync();
  
  if (isDemo) {
    const pumps = await getPumps();
    return pumps.find((p) => p.id === id) || null;
  }

  const { data, error } = await supabase
    .from("pumps")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching pump:", error);
    return null;
  }

  return data;
};

/**
 * Create a new pump
 */
export const createPump = async (pump: Omit<Pump, "id" | "created_at" | "updated_at">): Promise<Pump | null> => {
  const isDemo = isDemoModeSync();
  
  if (isDemo) {
    // In demo mode, just return the pump with generated ID
    return {
      ...pump,
      id: `demo-pump-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("pumps")
    .insert([
      {
        ...pump,
        created_by: user?.id || null,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating pump:", error);
    return null;
  }

  return data;
};

/**
 * Update a pump
 */
export const updatePump = async (
  id: string,
  updates: Partial<Omit<Pump, "id" | "created_at" | "updated_at">>
): Promise<Pump | null> => {
  const isDemo = isDemoModeSync();
  
  if (isDemo) {
    const pumps = await getPumps();
    const pump = pumps.find((p) => p.id === id);
    if (!pump) return null;
    
    return {
      ...pump,
      ...updates,
      updated_at: new Date().toISOString(),
    };
  }

  const { data, error } = await supabase
    .from("pumps")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating pump:", error);
    return null;
  }

  return data;
};

/**
 * Delete a pump
 */
export const deletePump = async (id: string): Promise<boolean> => {
  const isDemo = isDemoModeSync();
  
  if (isDemo) {
    // In demo mode, deletion is simulated
    return true;
  }

  const { error } = await supabase.from("pumps").delete().eq("id", id);

  if (error) {
    console.error("Error deleting pump:", error);
    return false;
  }

  return true;
};
