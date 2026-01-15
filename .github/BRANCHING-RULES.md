# Branching Rules - KIIAREN-Release

## Overview

This repository follows a simple branching model optimized for self-hosted open-source development.

## Core Branches

### `main` (Protected)

- **Purpose**: Production-ready, always deployable code
- **Protection**: 
  - Requires pull request before merging
  - Requires at least 1 approval
  - Requires status checks to pass
  - No direct pushes allowed
- **Deployment**: Self-hosted deployments

## Branch Naming Convention

### Feature Branches

Format: `feat/<area>-<short-description>`

Examples:
- `feat/backend-flex-config` - Flexible backend configuration system
- `feat/postgres-provider` - PostgreSQL database provider
- `feat/sqlite-provider` - SQLite database provider
- `feat/nats-realtime` - NATS JetStream realtime provider
- `feat/redis-realtime` - Redis PubSub realtime provider
- `feat/pg-fts-search` - PostgreSQL full-text search

### Bug Fix Branches

Format: `fix/<issue-number>-<short-description>` or `fix/<short-description>`

Examples:
- `fix/50-postgres-schema` - Fix PostgreSQL schema migration
- `fix/join-code-error` - Fix join code generation bug
- `fix/auth-redirect-loop` - Fix authentication redirect loop

### Documentation Branches

Format: `docs/<short-description>`

Examples:
- `docs/backend-options` - Document backend configuration options
- `docs/self-host-guide` - Self-hosting setup guide
- `docs/api-reference` - API documentation

### Chore Branches

Format: `chore/<short-description>`

Examples:
- `chore/deps-update` - Update dependencies
- `chore/ci-improvements` - CI/CD improvements
- `chore/linting-rules` - Update linting rules

### Operations Branches

Format: `ops/<short-description>`

Examples:
- `ops/github-actions-cache` - Optimize GitHub Actions caching
- `ops/docker-build` - Docker build improvements

## Workflow

### Creating a Feature Branch

```bash
# 1. Update main
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feat/my-feature

# 3. Make changes, commit
git add .
git commit -m "feat: my feature description"

# 4. Push branch
git push origin feat/my-feature

# 5. Create Pull Request on GitHub
```

### Pull Request Process

1. **Create PR** from feature branch to `main`
2. **Wait for CI checks** to pass (lint, test, build)
3. **Request review** from maintainers
4. **Address feedback** if any
5. **Merge** after approval (squash merge recommended)

### Merging Strategy

- **Squash and merge** - Recommended for feature branches
- **Merge commit** - Use for complex features with multiple logical commits
- **Rebase and merge** - Use sparingly, only for linear history needs

## Branch Protection Rules

The `main` branch is protected with the following rules:

- ✅ Require pull request before merging
- ✅ Require at least 1 approval
- ✅ Require status checks to pass (lint, test, build)
- ✅ Require branches to be up to date before merging
- ✅ Restrict who can push to matching branches
- ❌ Disallow force pushes
- ❌ Disallow deletions

## Syncing with SAAS Repository

When changes need to be synced to KIIAREN-SAAS:

1. Merge PR in Release repository
2. Get commit hash from merged PR
3. In SAAS repository, cherry-pick the commit:
   ```bash
   cd ../KIIAREN-SAAS
   git checkout main
   git pull origin main
   git checkout -b feat/saas-synced-feature
   git cherry-pick <commit-hash>
   git push origin feat/saas-synced-feature
   ```

## Best Practices

1. **Keep branches short-lived** - Merge within days, not weeks
2. **One feature per branch** - Don't mix unrelated changes
3. **Clear commit messages** - Follow conventional commits format
4. **Update documentation** - If adding features, update docs
5. **Test before PR** - Run tests locally before opening PR
6. **Small PRs** - Easier to review and merge

## Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `chore`: Maintenance tasks
- `refactor`: Code refactoring
- `test`: Test changes
- `style`: Code style changes (formatting, etc.)

Example:
```
feat(backend): add PostgreSQL provider

Implement PostgreSQL persistence provider with full CRUD operations
for workspaces, channels, messages, and other entities.

Closes #50
```

## Questions?

If you have questions about branching or need to make exceptions to these rules, please open an issue or contact maintainers.