/**
 * Environment configuration for apps/web
 *
 * This module provides type-safe access to environment variables
 * validated by the shared config package.
 *
 * Note: Since Next.js automatically loads .env files from the project root
 * when running from the monorepo root (via npm workspaces), we don't need
 * explicit dotenv configuration. Just ensure you run commands from the root:
 *
 *   npm run dev              (from monorepo root)
 *   npm run dev --workspace=@kiiaren/web
 */

import { getEnv, getClientEnv } from '@kiiaren/shared/config';

/**
 * Get validated server-side environment variables
 * Only use in server components, API routes, or getServerSideProps
 */
export const env = getEnv();

/**
 * Get client-side safe environment variables
 * Safe to use in client components
 */
export const clientEnv = getClientEnv();

/**
 * Convex URL - commonly needed in both server and client
 */
export const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;
