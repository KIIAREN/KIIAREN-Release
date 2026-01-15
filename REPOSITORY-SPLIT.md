# Repository Split: KIIAREN-Release vs KIIAREN-SAAS

This document clarifies the split between the two KIIAREN repositories.

## KIIAREN-Release (This Repository)

**Purpose:** Open-source, self-hosted edition

- **Repository:** `KIIAREN/KIIAREN-Release`
- **License:** Open source (see LICENSE file)
- **Deployment:** Self-hosted only (no Vercel deployment)
- **Target Users:** Contributors, organizations requiring self-hosting, compliance needs
- **Backend:** Supports Convex (for development) and PostgreSQL + WebSocket (self-host, skeleton)

**Key Points:**
- ✅ Open source codebase
- ✅ Self-hosting documentation
- ✅ Community contributions welcome
- ❌ No production SaaS deployment
- ❌ No references to `kiiaren.com` production URLs
- ❌ No Vercel deployment configuration

## KIIAREN-SAAS (Private Repository)

**Purpose:** Managed SaaS deployment

- **Repository:** `fentz26/KIIAREN-SAAS` (private)
- **License:** Commercial/Proprietary
- **Deployment:** Vercel (https://kiiaren.com)
- **Target Users:** End users of the SaaS platform
- **Backend:** Convex managed backend

**Key Points:**
- ✅ Production SaaS deployment
- ✅ Vercel deployment configuration
- ✅ Production environment variables
- ✅ Managed infrastructure
- ❌ Private repository (not open source)

## Environment Variables

### KIIAREN-Release (Self-Host)
- `CONVEX_DEPLOYMENT` - User's own Convex deployment (for development/testing)
- `NEXT_PUBLIC_CONVEX_URL` - User's own Convex URL
- `SITE_URL` - User's own deployment URL

### KIIAREN-SAAS (Production)
- `CONVEX_DEPLOYMENT` - Production deployment (`prod:notable-mouse-667`)
- `NEXT_PUBLIC_CONVEX_URL` - Production Convex URL
- `SITE_URL` - `https://auth.kiiaren.com` (production)

## Code Differences

### KIIAREN-Release
- No production domain references (`kiiaren.com`, `auth.kiiaren.com`, etc.)
- No production deployment checks
- Self-host focused documentation
- Open source license

### KIIAREN-SAAS
- Production domain routing in `middleware.ts`
- Production deployment checks in `convex/auth.ts`
- Vercel deployment configuration
- Commercial license

## Migration Notes

If you're contributing to KIIAREN-Release:
- Do NOT add production/SaaS specific code
- Do NOT reference `kiiaren.com` domains
- Do NOT add Vercel deployment configs
- Focus on self-hosted deployment paths

If you're working on KIIAREN-SAAS:
- Production-specific code belongs here
- Vercel deployment configuration
- Production environment variables