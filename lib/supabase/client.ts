import { createBrowserClient } from "@supabase/ssr";
import { isSupabaseConfigured } from "@/lib/demo/isDemoMode";

export const createClient = () => {
  // Check if Supabase is configured before creating client
  if (!isSupabaseConfigured()) {
    // Return a mock client object that won't crash the app
    // Real API calls will be handled by demo mode fallback
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: null } }),
        signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: "Demo mode: Authentication disabled" } }),
        signUp: async () => ({ data: { user: null, session: null }, error: { message: "Demo mode: Authentication disabled" } }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({
          order: () => ({
            limit: () => ({
              single: async () => ({ data: null, error: { message: "Demo mode" } }),
            }),
          }),
          eq: () => ({
            single: async () => ({ data: null, error: { message: "Demo mode" } }),
          }),
        }),
        insert: () => ({
          select: () => ({
            single: async () => ({ data: null, error: { message: "Demo mode" } }),
          }),
        }),
        update: () => ({
          eq: () => ({
            select: () => ({
              single: async () => ({ data: null, error: { message: "Demo mode" } }),
            }),
          }),
        }),
      }),
      channel: () => ({
        on: () => ({
          subscribe: () => ({}),
        }),
      }),
      removeChannel: () => {},
    } as any;
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};
