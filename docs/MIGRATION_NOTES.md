# KIIAREN Provider Migration Notes

This document describes the backend provider refactor and domain trust implementation.

## Overview

### What Changed

1. **Backend Provider Wiring** - `apps/web` now has a clear provider abstraction layer
2. **Domain Trust Primitives** - Workspace owners can verify domain ownership via DNS TXT
3. **Invite Links** - Admin-issued links replace public join codes when domain is verified
4. **Managed Feature Guards** - Clear `ManagedOnlyError` for unavailable OSS features

### Why It Changed

KIIAREN was behaving like a casual chat app (join-code-only). This refactor adds:
- Enterprise-grade domain verification
- Proper trust boundaries for workspaces
- Clear separation between OSS and managed features

---

## Domain Trust Model

### Concepts

| Concept | Description |
|---------|-------------|
| **Domain** | An email domain (e.g., `acme.com`) claimed by a workspace |
| **Verification** | DNS TXT record proves domain ownership |
| **Auto-Join** | Users with `@domain.com` email auto-join verified workspaces |
| **Invite Link** | Admin-issued link for external users |

### Trust Hierarchy

```
1. Domain Auto-Join (highest trust)
   - User email matches verified workspace domain
   - No admin action required for members

2. Invite Link (medium trust)
   - Admin explicitly creates invite
   - Time-limited, usage-limited, revocable
   - For external contractors, partners

3. Join Code (lowest trust) - DISABLED when domain verified
   - Legacy mechanism
   - Anyone with code can join
   - Suitable for casual/public workspaces only
```

### DNS Verification

To verify `acme.com`:

```
Record Type: TXT
Record Name: _kiiaren-verification.acme.com
Record Value: kiiaren-verification=<token>
```

The token is generated when the domain is added and displayed in the admin UI.

---

## Provider Abstraction

### Architecture

```
apps/web/lib/backend/
├── index.ts           # Central exports
├── use-workspaces.ts  # Provider-aware workspace hooks
├── use-channels.ts    # Provider-aware channel hooks
├── use-messages.ts    # Provider-aware message hooks
├── use-domains.ts     # Domain verification hooks (NEW)
└── use-invites.ts     # Invite link hooks (NEW)
```

### Migration Status

| Feature | Migrated | Location |
|---------|----------|----------|
| Workspace list | Yes | `@/lib/backend` |
| Workspace join | Yes | `@/lib/backend` |
| Channel list | Yes | `@/lib/backend` |
| Channel view | Yes | `@/lib/backend` |
| Message list | Yes | `@/lib/backend` |
| Message send | Yes | `@/lib/backend` |
| Domain verification | Yes | `@/lib/backend` |
| Invite links | Yes | `@/lib/backend` |
| Members | No | `@/features/members/api/` |
| Reactions | No | `@/features/reactions/api/` |
| Conversations | No | `@/features/conversations/api/` |
| Docs | No | `@/features/docs/api/` |
| Boards | No | `@/features/boards/api/` |
| Upload | No | `@/features/upload/api/` |

Non-migrated features continue to work via direct Convex imports.

### Hook Pattern

Provider-aware hooks follow this pattern:

```typescript
export function useGetWorkspaces() {
  const providerId = useProviderId();

  // Fail fast for unimplemented providers
  if (providerId !== 'convex') {
    throw new Error(`[${providerId}] workspaces.get is not implemented.`);
  }

  // Use Convex hooks
  const data = useQuery(api.workspaces.get);
  const isLoading = data === undefined;

  // Transform to provider-agnostic type
  const workspaces: Workspace[] | undefined = data?.map((w) => ({
    id: w._id,
    name: w.name,
    // ... transform fields
  }));

  return { data: workspaces, isLoading };
}
```

---

## Schema Changes

### New Tables

```typescript
// convex/schema.ts

// Domain verification
domains: defineTable({
  workspaceId: v.id('workspaces'),
  domain: v.string(),
  verificationToken: v.string(),
  status: v.union(v.literal('pending'), v.literal('verified'), v.literal('failed')),
  verifiedAt: v.optional(v.number()),
  createdAt: v.number(),
  createdBy: v.id('users'),
})

// Invite links
inviteLinks: defineTable({
  workspaceId: v.id('workspaces'),
  code: v.string(),
  createdBy: v.id('users'),
  createdAt: v.number(),
  expiresAt: v.number(),
  maxUses: v.optional(v.number()),
  usedCount: v.number(),
  scope: v.union(...),
  revokedAt: v.optional(v.number()),
})
```

### Modified Tables

```typescript
// workspaces table - new optional fields
workspaces: defineTable({
  name: v.string(),
  userId: v.id('users'),
  joinCode: v.string(),
  domainVerified: v.optional(v.boolean()),  // NEW
  joinCodeEnabled: v.optional(v.boolean()), // NEW
})
```

Existing workspaces have `undefined` for new fields, which default to:
- `domainVerified` → `false`
- `joinCodeEnabled` → `true`

No data migration required.

---

## New Convex Functions

### Domain Verification

| Function | Type | Description |
|----------|------|-------------|
| `domains.addDomain` | Mutation | Add domain for verification (admin-only) |
| `domains.listDomains` | Query | List workspace domains (admin-only) |
| `domains.removeDomain` | Mutation | Remove domain (admin-only) |
| `domains.checkEmailDomain` | Query | Check if email matches verified domain |
| `domains.getVerificationInstructions` | Query | Get DNS TXT record info |
| `domainActions.verifyDomain` | Action | Perform DNS TXT lookup |

### Invite Links

| Function | Type | Description |
|----------|------|-------------|
| `inviteLinks.create` | Mutation | Create invite link (admin-only) |
| `inviteLinks.getByCode` | Query | Get invite by code (public) |
| `inviteLinks.list` | Query | List workspace invites (admin-only) |
| `inviteLinks.revoke` | Mutation | Revoke invite (admin-only) |
| `inviteLinks.validateForRedemption` | Query | Pre-validate invite |

### Modified Functions

| Function | Change |
|----------|--------|
| `workspaces.join` | Now accepts `inviteCode` arg, implements domain trust hierarchy |

---

## What Is NOT Implemented

### Intentionally Deferred

- Full self-host backend (PostgreSQL + WebSocket)
- UI components for domain management
- UI components for invite link management
- Migration of non-core feature hooks

### Managed-Only Features

These throw `ManagedOnlyError` in OSS:

- Audit log query
- Indexed full-text search
- AI processing
- KMS encryption/decryption

---

## Testing Domain Verification

### Manual Test

1. Add domain in admin panel
2. Note the verification token
3. Add DNS TXT record:
   ```
   _kiiaren-verification.yourdomain.com TXT "kiiaren-verification=<token>"
   ```
4. Wait for DNS propagation (5-15 minutes)
5. Click "Verify" in admin panel

### Programmatic Test

```typescript
// Add domain
const domainId = await mutation(api.domains.addDomain, {
  workspaceId,
  domain: 'test.example.com',
});

// Get verification instructions
const instructions = await query(api.domains.getVerificationInstructions, {
  domainId,
});
console.log(instructions.recordValue);

// After adding DNS record:
const result = await action(api.domainActions.verifyDomain, { domainId });
console.log(result.success);
```

---

## Future Work

1. **UI Components** - Admin panels for domain and invite management
2. **Feature Hook Migration** - Migrate remaining 35 feature hooks to provider abstraction
3. **Self-Host Backend** - Implement PostgreSQL + WebSocket provider
4. **Email Verification** - Optional email-based domain verification fallback
