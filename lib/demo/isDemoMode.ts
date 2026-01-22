/**
 * Demo Mode Detection
 * 
 * Determines if the app should run in demo mode based on:
 * - Environment variable NEXT_PUBLIC_DEMO_MODE
 * - Supabase configuration availability
 * - Supabase connection status
 */

let demoModeCache: boolean | null = null;
let connectionTestPromise: Promise<boolean> | null = null;

/**
 * Check if Supabase environment variables are configured
 */
export const isSupabaseConfigured = (): boolean => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  return !!(url && key && url.trim() !== "" && key.trim() !== "");
};

/**
 * Test Supabase connection (client-side)
 */
export const testSupabaseConnection = async (): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    return false;
  }

  try {
    // Dynamically import to avoid errors if Supabase isn't configured
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    // Try a simple auth check (doesn't require authentication)
    const { error } = await supabase.auth.getSession();
    
    // If we get a connection error, Supabase is not available
    // Session missing is OK - it just means no user is logged in
    if (error && !error.message.includes("Auth session missing")) {
      console.warn("Supabase connection test failed:", error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.warn("Supabase connection test error:", error);
    return false;
  }
};

/**
 * Determine if demo mode should be active
 * 
 * Demo mode is active if:
 * 1. NEXT_PUBLIC_DEMO_MODE is explicitly set to "true"
 * 2. Supabase is not configured
 * 3. Supabase connection test fails
 */
export const isDemoMode = async (): Promise<boolean> => {
  // Check cache first
  if (demoModeCache !== null) {
    return demoModeCache;
  }

  // Check environment variable first (highest priority)
  const envDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  if (envDemoMode) {
    demoModeCache = true;
    return true;
  }

  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    console.log("🔵 Demo Mode: Supabase not configured");
    demoModeCache = true;
    return true;
  }

  // Test connection (only once, reuse promise if already testing)
  if (!connectionTestPromise) {
    connectionTestPromise = testSupabaseConnection();
  }

  const connected = await connectionTestPromise;
  
  if (!connected) {
    console.log("🔵 Demo Mode: Supabase connection failed");
    demoModeCache = true;
    return true;
  }

  console.log("✅ Supabase connected - running in production mode");
  demoModeCache = false;
  return false;
};

/**
 * Synchronous check for demo mode (uses cache)
 * Useful for client components that need immediate check
 * Returns null if not yet determined
 */
export const isDemoModeSync = (): boolean | null => {
  // Check environment variable first
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    return true;
  }

  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return true;
  }

  // Return cache if available
  return demoModeCache;
};

/**
 * Clear demo mode cache (useful for testing or manual mode switching)
 */
export const clearDemoModeCache = (): void => {
  demoModeCache = null;
  connectionTestPromise = null;
};

/**
 * Hook for React components to check demo mode
 */
export const useDemoMode = (): { isDemo: boolean; loading: boolean } => {
  // This will be implemented in a React hook component
  // For now, return synchronous check
  const demoMode = isDemoModeSync();
  return {
    isDemo: demoMode ?? false, // Default to demo mode if unknown
    loading: demoMode === null,
  };
};
