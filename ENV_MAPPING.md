# Environment Variables Mapping

This document maps environment variables to their usage across the KIIAREN platform.

## Single Source of Truth

**Location:** `/home/fentz/Documents/KIIAREN/.env` (root of monorepo)

All apps read from this single file. No per-app `.env` files are used.

## Variable Mapping

| Variable | Used By | Purpose | Required |
|----------|---------|---------|----------|
| `NEXT_TELEMETRY_DISABLED` | apps/web | Disable Next.js telemetry | Optional |
| `CONVEX_DEPLOYMENT` | convex CLI, apps/web | Convex deployment identifier | **Required** |
| `NEXT_PUBLIC_CONVEX_URL` | apps/web (client), convex | Public Convex API endpoint | **Required** |
| `SITE_URL` | @convex-dev/auth | OAuth callback base URL | **Required** |
| `AUTH_GOOGLE_CLIENT_ID` | @convex-dev/auth | Google OAuth client ID | Optional |
| `AUTH_GOOGLE_CLIENT_SECRET` | @convex-dev/auth | Google OAuth secret | Optional |
| `AUTH_GITHUB_ID` | @convex-dev/auth | GitHub OAuth client ID | Optional |
| `AUTH_GITHUB_SECRET` | @convex-dev/auth | GitHub OAuth secret | Optional |

## Feature-Specific Configuration

### Slack Clone (Chat)
- Uses: All Convex variables
- No additional vars required

### Docs (Notion-like)
- Uses: All Convex variables
- Storage: Convex `_storage` (no external service)
- No additional vars required

### Whiteboard (Excalidraw)
- Uses: All Convex variables
- Storage: Convex tables (JSON blob)
- No additional vars required

## Validation

Environment variables are validated using Zod schema in:
- **Location:** `packages/shared/src/config/env.ts`
- **Import:** `import { getEnv } from '@kiiaren/shared/config'`

## Migration Notes

**Removed variables** (no longer used):
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (replaced by @convex-dev/auth)
- `CLERK_SECRET_KEY` (replaced by @convex-dev/auth)
- `EDGE_STORE_ACCESS_KEY` (replaced by Convex _storage)
- `EDGE_STORE_SECRET_KEY` (replaced by Convex _storage)

**No variables added** for docs/whiteboard features — they reuse existing Convex infrastructure.
