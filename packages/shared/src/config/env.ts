import { z } from 'zod';

/**
 * Environment configuration schema for KIIAREN platform
 * Single source of truth for all apps in the monorepo
 */

// Server-side environment variables (private)
const serverSchema = z.object({
  // Convex deployment configuration
  CONVEX_DEPLOYMENT: z.string().min(1, 'CONVEX_DEPLOYMENT is required'),

  // OAuth credentials (optional but recommended)
  AUTH_GOOGLE_CLIENT_ID: z.string().optional(),
  AUTH_GOOGLE_CLIENT_SECRET: z.string().optional(),
  AUTH_GITHUB_ID: z.string().optional(),
  AUTH_GITHUB_SECRET: z.string().optional(),

  // Site URL for auth callbacks
  CONVEX_SITE_URL: z.string().url('CONVEX_SITE_URL must be a valid URL'),

  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
});

// Client-side environment variables (public, prefixed with NEXT_PUBLIC_)
const clientSchema = z.object({
  // Convex public URL
  NEXT_PUBLIC_CONVEX_URL: z.string().url('NEXT_PUBLIC_CONVEX_URL must be a valid URL'),

  // Telemetry
  NEXT_TELEMETRY_DISABLED: z
    .string()
    .optional()
    .transform((val) => val === '1'),
});

// Combined schema for validation
const envSchema = serverSchema.merge(clientSchema);

// Parse and validate environment variables
function parseEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
}

// Validated environment variables (memoized)
let cachedEnv: z.infer<typeof envSchema> | null = null;

export function getEnv() {
  if (!cachedEnv) {
    cachedEnv = parseEnv();
  }
  return cachedEnv;
}

// Type-safe environment access
export type Env = z.infer<typeof envSchema>;

// Helper to get client-side env (safe to use in browser)
export function getClientEnv() {
  return {
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL!,
    NEXT_TELEMETRY_DISABLED: process.env.NEXT_TELEMETRY_DISABLED === '1',
  };
}

// Re-export for convenience
export { z };
