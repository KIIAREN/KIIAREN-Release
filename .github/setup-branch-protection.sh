#!/bin/bash
# Setup branch protection rules for KIIAREN-Release
# Requires: gh CLI and appropriate permissions

set -e

REPO="KIIAREN/KIIAREN-Release"
BRANCH="main"

echo "Setting up branch protection for $REPO:$BRANCH..."

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "Error: GitHub CLI (gh) is not installed"
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "Error: Not authenticated with GitHub CLI"
    echo "Run: gh auth login"
    exit 1
fi

# Create branch protection rule
gh api repos/$REPO/branches/$BRANCH/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["lint","test","build"]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true,"require_code_owner_reviews":false}' \
  --field restrictions=null \
  --field required_linear_history=false \
  --field allow_force_pushes=false \
  --field allow_deletions=false \
  --field block_creations=false \
  --field required_conversation_resolution=true \
  --field lock_branch=false \
  --field allow_fork_syncing=false

echo "✅ Branch protection rules applied successfully!"
echo ""
echo "Protection rules:"
echo "  - Require pull request before merging"
echo "  - Require at least 1 approval"
echo "  - Require status checks: lint, test, build"
echo "  - Require branches to be up to date"
echo "  - Disallow force pushes"
echo "  - Disallow deletions"