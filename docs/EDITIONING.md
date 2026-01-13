# KIIAREN Editioning

This document defines the boundaries between KIIAREN Community (OSS/self-hosted) and KIIAREN Managed Cloud.

## Overview

KIIAREN follows an open-core model:

- **Community Edition**: Open source, self-hostable, core collaboration features
- **Managed Cloud**: Hosted service with enterprise features, SLA, and support

The distinction is architectural, not configurational. Managed features cannot be enabled in Community Edition through flags or settings - they require infrastructure only available in managed deployments.

---

## Community Edition (Self-Hosted)

### Included Features

| Category | Features |
|----------|----------|
| **Collaboration** | Workspaces, Channels, Direct Messages, Threads |
| **Content** | Rich text messages, File uploads, Docs (Notion-like), Boards (Excalidraw) |
| **Reactions** | Emoji reactions on messages |
| **Real-time** | Live updates via WebSocket subscriptions |
| **Auth** | Email/password, Basic OAuth (Google, GitHub) |
| **Domain Trust** | DNS TXT domain verification, email-based auto-join, admin invite links |
| **Search** | In-memory search (docs, boards) - not indexed |
| **Storage** | Local filesystem or S3-compatible storage |

### What You Are Responsible For

| Area | Your Responsibility |
|------|---------------------|
| **Infrastructure** | Provision servers, database, storage |
| **Availability** | Uptime, failover, disaster recovery |
| **Backups** | Database backups, storage backups, restore testing |
| **Security** | Network security, firewall, TLS certificates, vulnerability patching |
| **Scaling** | Horizontal scaling, load balancing, connection pooling |
| **Monitoring** | Metrics, alerts, log aggregation |
| **Updates** | Version upgrades, dependency management |
| **Data** | Data retention, deletion, exports |
| **Compliance** | GDPR, HIPAA, SOC2 - your implementation |

### Requirements

- PostgreSQL 14+
- Node.js 20+
- WebSocket-capable server
- Storage: Local disk or S3-compatible (MinIO, etc.)
- TLS termination (nginx, Caddy, etc.)

### Limitations

Community Edition does not include:

- Indexed full-text search
- Centralized key management (KMS)
- End-to-end encrypted sync
- Audit logging / eDiscovery
- Enterprise SSO (SAML/OIDC federation)
- AI features with persistent memory
- Push notification infrastructure
- SLA guarantees
- Professional support

---

## Managed Cloud

### Additional Features

| Category | Features |
|----------|----------|
| **Security** | Centralized KMS, Key rotation, E2E encrypted sync |
| **Compliance** | Audit logs, eDiscovery exports, Data residency |
| **Enterprise** | SAML SSO, OIDC, SCIM provisioning |
| **Search** | Indexed full-text search across all content |
| **AI** | AI agents with persistent memory, Embeddings |
| **Notifications** | Native push notifications (iOS, Android, Web) |
| **Operations** | Automated backups, Point-in-time restore, Multi-region |
| **Support** | SLA, Incident response, Dedicated support |

### KIIAREN Responsibilities

| Area | Our Responsibility |
|------|---------------------|
| **Infrastructure** | All provisioning, scaling, regions |
| **Availability** | 99.9% SLA (or per contract) |
| **Backups** | Automated daily, 30-day retention |
| **Security** | SOC2 Type II, Penetration testing, Vulnerability management |
| **Scaling** | Automatic scaling based on usage |
| **Monitoring** | 24/7 monitoring, Incident response |
| **Updates** | Zero-downtime deployments |
| **Compliance** | GDPR, SOC2, HIPAA (upon request) |

### Your Responsibilities

| Area | Your Responsibility |
|------|---------------------|
| **Access Control** | User management within your organization |
| **Content** | Content moderation, acceptable use |
| **Integration** | SSO configuration, API integrations |
| **Data Requests** | Responding to legal requests using provided tools |

---

## Feature Boundary Enforcement

Features are separated at the architecture level, not configuration level.

### Why This Matters

1. **No bypass**: Managed features cannot be enabled via environment variables
2. **Clear expectations**: Self-hosters know exactly what they're getting
3. **Maintenance boundary**: OSS code is simpler without conditional feature flags
4. **Security**: Managed features require operational trust not present in self-host

### Technical Implementation

```
┌─────────────────────────────────────────────────────────────────┐
│                        apps/web                                 │
│         (UI components, React hooks, pages)                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      @kiiaren/core                              │
│              (BackendProvider interface)                        │
│                                                                 │
│  ┌──────────────────┐           ┌──────────────────┐           │
│  │  ConvexProvider  │           │ SelfHostProvider │           │
│  │    (Managed)     │           │   (Community)    │           │
│  │   isManaged=true │           │  isManaged=false │           │
│  └──────────────────┘           └──────────────────┘           │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   ExtensionHooks                          │  │
│  │  - audit.log() → no-op in OSS, functional in managed     │  │
│  │  - search.search() → throws in OSS, works in managed     │  │
│  │  - kms.encrypt() → throws in OSS, works in managed       │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Extension Hooks

OSS code can emit events to extension hooks. In Community Edition, these are no-ops or throw clear errors. In Managed Cloud, these hooks have real implementations.

```typescript
// In OSS: no-op (events are discarded)
await hooks.audit.log({ action: 'message.create', ... });

// In OSS: throws with clear error message
await hooks.search.search({ query: 'term' }); // Error: Requires managed tier

// In Managed: functional
const results = await hooks.search.search({ query: 'term' }); // Returns results
```

---

## Responsibility Matrix

| Concern | Community (You) | Managed (KIIAREN) |
|---------|-----------------|-------------------|
| Server provisioning | You | KIIAREN |
| Database management | You | KIIAREN |
| Backup & restore | You | KIIAREN |
| Security patches | You | KIIAREN |
| TLS certificates | You | KIIAREN |
| Scaling decisions | You | KIIAREN |
| Uptime guarantee | None | SLA |
| Incident response | You | KIIAREN |
| Compliance audit | You | KIIAREN |
| Feature requests | Community | Prioritized |
| Bug fixes | Community | Guaranteed |
| Support | Community forum | Dedicated |

---

## Migration Path

### Community → Managed

1. Export data using provided CLI tools
2. Create managed account
3. Import data to managed workspace
4. Update DNS / application config
5. Decommission self-hosted infrastructure

### Managed → Community

1. Export data from managed admin console
2. Set up self-hosted infrastructure
3. Import data using migration scripts
4. Update DNS / application config
5. Accept loss of managed-only features

Data portability is a design goal. You are never locked in.

---

## Decision Guide

### Choose Community Edition If:

- You have infrastructure expertise in-house
- Compliance requires on-premises deployment
- You need complete control over the stack
- Budget is the primary constraint
- Core features are sufficient for your use case

### Choose Managed Cloud If:

- You need enterprise SSO (SAML/OIDC)
- Compliance requires audit logs / eDiscovery
- You need SLA guarantees
- You prefer not to manage infrastructure
- You need indexed search across large datasets
- You need AI features with persistent memory
- You need push notifications
- You want professional support

---

## Pricing Philosophy

Community Edition is genuinely free and open source. There are no artificial limitations to push users toward paid tiers. The managed tier exists because:

1. Enterprise features require infrastructure investment
2. SLA guarantees require operational commitment
3. Professional support requires dedicated staff

The boundary is where responsibility shifts from user to KIIAREN, not where features are artificially gated.
