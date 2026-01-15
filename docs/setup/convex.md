# Convex Backend Setup Guide

## 🔴 CRITICAL ISSUE: Tables Not Appearing in Dashboard

### Root Cause

Your `convex/schema.ts` file is **valid and complete** with 7 custom tables + auth tables, but the schema has **never been deployed** to your Convex backend.

**Evidence:**
- ✅ Schema file exists and is correctly structured
- ✅ All function table references match schema definitions
- ✅ Convex deployment configured: `prod:your-deployment-name` (use your own deployment)
- ❌ **No authentication set up** (no `~/.convex/` directory)
- ❌ **Schema never pushed** (no `convex.json` or `.convex/` directory)

### Tables Defined (Not Yet Deployed)

| Table | Purpose | Status |
|-------|---------|--------|
| **workspaces** | Workspace containers | 📝 Defined, not deployed |
| **members** | Workspace membership | 📝 Defined, not deployed |
| **channels** | Chat channels | 📝 Defined, not deployed |
| **conversations** | Direct messages | 📝 Defined, not deployed |
| **messages** | Chat messages | 📝 Defined, not deployed |
| **reactions** | Message reactions | 📝 Defined, not deployed |
| **docs** | Notion-like documents | 📝 Defined, not deployed |
| **boards** | Excalidraw whiteboards | 📝 Defined, not deployed |
| **Auth tables** | users, sessions, accounts, etc. | 📝 Defined, not deployed |

---

## 🚀 DEPLOYMENT STEPS (Required to Fix)

### Step 1: Authenticate with Convex CLI

```bash
npx convex dev
```

**What this does:**
1. Prompts you to log in to Convex (opens browser)
2. Saves authentication token to `~/.convex/`
3. Creates `convex.json` in project root
4. **Pushes schema to backend** (creates all tables)
5. Starts development server

**What you'll see:**
```
Welcome to developing with Convex, let's get you logged in.
✔ Saved credentials to ~/.convex/
```

### Step 2: Verify Tables in Dashboard

1. Go to [Convex Dashboard](https://dashboard.convex.dev/)
2. Select your Convex project (create one if needed)
3. Click **Data** tab
4. You should now see **12 tables**:
   - workspaces
   - members
   - channels
   - conversations
   - messages
   - reactions
   - docs
   - boards
   - users
   - authSessions
   - authAccounts
   - authVerificationCodes
   - authVerifiers

### Step 3: Test Data Creation

**Test Chat:**
```bash
# Keep npx convex dev running in terminal
# In another terminal or browser:
npm run dev
# Visit http://localhost:3000
# Create workspace → Create channel → Send message
```

**Test Docs:**
```bash
# In app: Navigate to Documents
# Click "New Document"
# Add content and save
```

**Test Whiteboards:**
```bash
# In app: Navigate to Whiteboards
# Click "New Board"
# Draw something
```

### Step 4: Verify in Convex Dashboard

After creating test data:
1. Refresh Convex Dashboard → Data tab
2. Click on each table (e.g., `messages`, `docs`, `boards`)
3. You should see rows of data

---

## 🔧 Alternative: Deploy to Production

If you want to deploy directly to production without running dev server:

### Option A: Using Convex CLI (Recommended)

```bash
# Authenticate first
npx convex dev --once

# Then deploy to production
npx convex deploy --prod
```

### Option B: Using Deploy Key (CI/CD)

1. Go to Convex Dashboard → Settings → Deploy Keys
2. Create a new deploy key
3. Add to your environment:
   ```bash
   export CONVEX_DEPLOY_KEY="your-deploy-key-here"
   ```
4. Deploy:
   ```bash
   npx convex deploy
   ```

---

## 📋 Verification Checklist

After running `npx convex dev`:

- [ ] `~/.convex/` directory exists (authentication saved)
- [ ] `convex.json` file created in project root
- [ ] `.convex/` directory created in project (deployment state)
- [ ] Convex Dashboard shows 12+ tables in Data tab
- [ ] Can create workspaces in app
- [ ] Can send chat messages
- [ ] Can create documents
- [ ] Can create whiteboards
- [ ] Data appears in Convex Dashboard tables

---

## 🐛 Troubleshooting

### "MissingAccessToken: An access token is required"

**Solution:** Run `npx convex dev` to authenticate.

### Tables still not appearing after `npx convex dev`

**Check:**
1. Did the dev command complete successfully?
2. Look for schema validation errors in terminal output
3. Verify you're looking at the correct deployment in dashboard
4. Try refreshing the dashboard browser tab

### Schema validation errors during deployment

**Symptoms:**
```
✖ Schema validation failed
```

**Solution:**
1. Check `convex/schema.ts` for syntax errors
2. Ensure all imports are correct
3. Run `npm run build` to check for TypeScript errors

### Wrong deployment showing in dashboard

**Check `.env`:**
```bash
grep CONVEX_DEPLOYMENT .env
# Should show: prod:your-deployment-name
```

If different, update `.env` with correct deployment ID.

---

## 📊 Expected Dashboard State After Deployment

### Before Deployment (Current State)
```
Data tab: "No tables found"
Functions tab: Empty or outdated
```

### After Deployment (Fixed State)
```
Data tab:
  ✅ workspaces (0 rows)
  ✅ members (0 rows)
  ✅ channels (0 rows)
  ✅ conversations (0 rows)
  ✅ messages (0 rows)
  ✅ reactions (0 rows)
  ✅ docs (0 rows)
  ✅ boards (0 rows)
  ✅ users (0 rows)
  ✅ authSessions (0 rows)
  ✅ authAccounts (0 rows)
  ✅ authVerificationCodes (0 rows)
  ✅ authVerifiers (0 rows)

Functions tab:
  ✅ auth.signIn
  ✅ auth.signOut
  ✅ workspaces.create
  ✅ channels.create
  ✅ messages.create
  ✅ docs.create
  ✅ boards.create
  ... (30+ functions deployed)
```

---

## 🎯 Quick Command Reference

```bash
# First-time setup (REQUIRED)
npx convex dev

# Deploy to production
npx convex deploy

# Regenerate types after schema changes
npx convex codegen

# View deployment info
npx convex env

# Clear local deployment cache
rm -rf .convex/
```

---

## ⚠️ Important Notes

1. **Never manually create tables in Convex Dashboard**
   - Always use `schema.ts` as single source of truth
   - Tables are auto-created from schema on deployment

2. **Always run `npx convex dev` after schema changes**
   - Schema changes require redeployment
   - Types in `_generated/` auto-update

3. **Production deployments**
   - Use `npx convex deploy` for production
   - Or set up CI/CD with deploy keys

4. **Environment variables**
   - `CONVEX_DEPLOYMENT` - Which deployment to use
   - `NEXT_PUBLIC_CONVEX_URL` - Public API endpoint
   - Both must match your Convex project

---

## 🔗 Additional Resources

- [Convex Schema Documentation](https://docs.convex.dev/database/schemas)
- [Convex Deployment Guide](https://docs.convex.dev/production/hosting/vercel)
- [Convex Dashboard](https://dashboard.convex.dev/)

---

## ✅ Success Confirmation

Once deployment succeeds, you'll see:

**Terminal:**
```
✔ Deployment complete!
✔ Functions deployed: 30
✔ Schema pushed: 13 tables
✔ Running at https://your-deployment-name.convex.cloud
```

**Dashboard:**
- All 13 tables visible in Data tab
- All functions visible in Functions tab
- Logs showing schema validation success

**App:**
- Can create workspaces
- Can send messages
- Can create docs/boards
- Data persists across refreshes
