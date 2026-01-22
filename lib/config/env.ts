import { z } from "zod";

/**
 * Environment variable validation schema
 */
const envSchema = z.object({
  // Next.js
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // Sentry (optional)
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),

  // API Configuration
  API_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000), // 1 minute
  API_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(60),

  // Feature Flags
  ENABLE_DEMO_MODE: z
    .string()
    .transform((val) => val === "true")
    .pipe(z.boolean())
    .default(false),
});

/**
 * Validated environment variables
 */
export type Env = z.infer<typeof envSchema>;

let validatedEnv: Env | null = null;

/**
 * Get and validate environment variables
 */
export function getEnv(): Env {
  if (validatedEnv) {
    return validatedEnv;
  }

  try {
    validatedEnv = envSchema.parse(process.env);
    return validatedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((e) => e.path.join(".")).join(", ");
      throw new Error(
        `Invalid environment variables: ${missingVars}\n` +
          "Please check your .env file and ensure all required variables are set."
      );
    }
    throw error;
  }
}

/**
 * Get a specific environment variable
 */
export function getEnvVar<K extends keyof Env>(key: K): Env[K] {
  const env = getEnv();
  return env[key];
}
