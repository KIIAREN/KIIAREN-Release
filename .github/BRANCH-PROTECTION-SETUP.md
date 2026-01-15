# Branch Protection Setup Guide

This guide explains how to set up branch protection rules for KIIAREN-Release.

## Option 1: Using GitHub Web UI (Recommended)

1. Go to your repository: `https://github.com/KIIAREN/KIIAREN-Release`
2. Navigate to **Settings** → **Branches**
3. Click **Add rule** or edit existing rule for `main`
4. Configure the following:

### Branch Protection Settings

**Branch name pattern:** `main`

**Protect matching branches:**
- ✅ Require a pull request before merging
  - ✅ Require approvals: **1**
  - ✅ Dismiss stale pull request approvals when new commits are pushed
  - ✅ Require review from Code Owners: (optional)
- ✅ Require status checks to pass before merging
  - ✅ Require branches to be up to date before merging
  - ✅ Status checks: `lint`, `test`, `build`
- ✅ Require conversation resolution before merging
- ✅ Restrict who can push to matching branches: (leave empty or add specific users)
- ❌ Do not allow force pushes
- ❌ Do not allow deletions

5. Click **Create** or **Save changes**

## Option 2: Using GitHub CLI Script

Run the provided script:

```bash
cd /home/fentz/Documents/KIIAREN/KIIAREN-Release
./.github/setup-branch-protection.sh
```

**Prerequisites:**
- GitHub CLI (`gh`) installed
- Authenticated with `gh auth login`
- Appropriate repository permissions

## Option 3: Using GitHub API Directly

```bash
gh api repos/KIIAREN/KIIAREN-Release/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["lint","test","build"]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null \
  --field allow_force_pushes=false \
  --field allow_deletions=false \
  --field required_conversation_resolution=true
```

## Verification

After setup, verify protection is active:

1. Try to push directly to `main` (should fail)
2. Create a test branch and PR
3. Verify that PR requires approval and status checks

## Status Checks

Make sure your CI/CD workflows create these status checks:
- `lint` - Linting checks
- `test` - Test suite
- `build` - Build verification

These should be defined in `.github/workflows/ci.yml` or similar.

## Troubleshooting

**Issue:** Status checks not showing up
- **Solution:** Ensure CI workflows run on pull requests and create status checks

**Issue:** Can't push to main even with protection
- **Solution:** This is expected! Use pull requests instead

**Issue:** Script fails with permission error
- **Solution:** Ensure you have admin access to the repository