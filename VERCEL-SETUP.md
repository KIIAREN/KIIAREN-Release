# Vercel Setup Instructions

## Current Status

- **Vercel Project:** `kiiaren` (ID: `prj_06oPzPlQO3zb4eZo0cMxbzqWeNnJ`)
- **Team:** Fentzzz (`team_45JhtixCcObnnvA3QYZN6dHh`)
- **Domains:** kiiaren.com, auth.kiiaren.com, api.kiiaren.com, etc.

## Required Action: Update GitHub Repository Connection

The Vercel project needs to be connected to the correct repository:

### Current (Incorrect)
- May be connected to: `KIIAREN/KIIAREN-Release` (self-hosted repo)

### Target (Correct)
- Should be connected to: `fentz26/KIIAREN-SAAS` (production SaaS repo)

## Steps to Update

1. **Go to Vercel Project Settings**
   - Visit: https://vercel.com/fentzzz/kiiaren/settings/git
   - Or navigate: Vercel Dashboard → kiiaren project → Settings → Git

2. **Disconnect Current Repository** (if connected to wrong repo)
   - Click "Disconnect" next to the current repository

3. **Connect New Repository**
   - Click "Connect Git Repository"
   - Search for: `fentz26/KIIAREN-SAAS`
   - Select the repository
   - Choose branch: `main` (or your production branch)

4. **Verify Configuration**
   - Root Directory: `apps/web` (if monorepo)
   - Framework Preset: Next.js
   - Build Command: `npm run build` (or `cd apps/web && npm run build`)
   - Output Directory: `.next` (default for Next.js)

5. **Environment Variables**
   Ensure these are set in Vercel:
   - `CONVEX_DEPLOYMENT` = `prod:notable-mouse-667` (production deployment)
   - `NEXT_PUBLIC_CONVEX_URL` = Production Convex URL
   - `SITE_URL` = `https://auth.kiiaren.com`
   - OAuth credentials (Google, GitHub) if needed

6. **Test Deployment**
   - Push a commit to `fentz26/KIIAREN-SAAS/main`
   - Verify Vercel automatically deploys
   - Check deployment logs for any issues

## Verification Checklist

- [ ] Vercel project connected to `fentz26/KIIAREN-SAAS`
- [ ] Production branch (`main`) is selected
- [ ] Environment variables are set correctly
- [ ] Domains are configured (kiiaren.com, auth.kiiaren.com, etc.)
- [ ] Test deployment succeeds
- [ ] Production site (https://kiiaren.com) loads correctly

## Important Notes

- **KIIAREN-Release** should NOT be connected to Vercel
- **KIIAREN-SAAS** is the only repository that should deploy to Vercel
- Production domains should only point to KIIAREN-SAAS deployments