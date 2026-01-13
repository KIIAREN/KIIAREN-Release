# KIIAREN Engineering & Product Audit

**Date:** October 26, 2023
**Reviewer:** Jules AI (System Architect)
**Scope:** Product architecture, backend abstraction, security model, enterprise readiness.

---

## 1) Critical Gaps (Blocking Issues)

1.  **Backend Abstraction Bypass (Vendor Lock-in)**
    *   **Finding:** The `apps/web` frontend completely bypasses the `@kiiaren/core` provider abstraction layer. Feature hooks (e.g., `useGetMessages`) import directly from `convex/react` and `convex/_generated/api`.
    *   **Impact:** The "Provider Abstraction" described in `ARCHITECTURE.md` is currently a fiction. Switching to the self-hosted provider or any other backend is impossible without a complete rewrite of the frontend data layer.
    *   **Verdict:** Architecture Violation.

2.  **Missing Domain Trust Model**
    *   **Finding:** There is zero logic for domain verification, ownership, or enforcement. Workspaces are currently loose collections of users joined via a simple 6-character code (`joinCode`).
    *   **Impact:** The platform cannot function as an "Enterprise Workspace". There is no way to trust that "user@company.com" actually belongs to "company.com" or to enforce organizational boundaries.
    *   **Verdict:** Product/Security Mismatch.

3.  **No Extension Hook Enforcement**
    *   **Finding:** The `convex/` mutations (backend logic) do not trigger the `ExtensionHooks` defined in `packages/core`.
    *   **Impact:** Managed features (Audit Logs, Search, KMS) are architecturally "gated" but functionally unreachable. Even if a user pays for the Managed tier, the events required to power those features are never emitted.
    *   **Verdict:** Feature Gap.

## 2) High-Risk Ambiguities

1.  **"Self-Host" Definition Mismatch**
    *   **Finding:** Documentation describes Self-Host as "Skeleton only" (implying the structure exists but is empty). Reality is that the *connection* to the structure is broken (see Critical Gap #1).
    *   **Risk:** Users attempting to contribute to the self-host provider will fail immediately because the frontend cannot talk to it. This risks community alienation.

2.  **Workspace vs. Organization Identity**
    *   **Finding:** The system uses "Workspace" as the top-level entity, but enterprise requirements often imply an "Organization" that owns multiple workspaces or claims a domain.
    *   **Risk:** If a "Workspace" claims a domain (e.g., "acme.com"), what happens when a second workspace tries to claim it? The current data model does not account for Organization-level domain ownership separate from Workspace instantiation.

## 3) Missing Primitives

1.  **`Domain` Entity**
    *   Must exist to store verified domains (e.g., `kiiaren.com`), verification tokens (DNS TXT), and verification status.
    *   Must link to a Workspace (or Organization).

2.  **`Organization` Layer (Optional but Recommended)**
    *   A container for the "Billable Entity" and "Domain Owner" separate from the "Collaboration Context" (Workspace). Currently, Workspace is overloaded to do both.

3.  **`Member` Lifecycle States**
    *   Missing `invited`, `provisioned` (via SCIM), or `deactivated` states. Currently, membership is binary (exists or not).

4.  **`BackendProvider` Hook Implementation**
    *   The actual React hooks that bridge `apps/web` to `@kiiaren/core` are missing.

## 4) Unnecessary Complexity

1.  **Unused Abstraction Code**
    *   Files in `apps/web/lib/provider` (like `convex-adapter.tsx`) exist but are dead code. They create a false sense of architectural maturity.
    *   **Recommendation:** Keep them, but mark them clearly as "Target Architecture" to avoid confusion during development.

## 5) Recommended Next Steps

**Priority 1: Fix the Trust Model (Domain Logic)**
*   **What:** Create `Domain` schema, DNS verification logic (TXT records), and "Auto-join by Domain" flow.
*   **Why:** Without this, KIIAREN is just a chat app, not a workspace platform.
*   **Minimal Implementation:**
    *   Add `domains` table (domain, workspaceId, verificationToken, verifiedAt).
    *   Add `verifyDomain` mutation (checks DNS).
    *   Update `join` flow: Allow email matching verified domain to skip `joinCode`.

**Priority 2: Wire the Abstraction**
*   **What:** Refactor *one* vertical (e.g., `auth` or `workspaces`) to use `BackendProvider` instead of direct Convex imports.
*   **Why:** To prove the architecture works and unblock Self-Host contributors.
*   **Minimal Implementation:**
    *   Update `useAuth` to use `useBackend().auth`.
    *   Verify it works with `ConvexProvider`.

**Priority 3: Connect Extension Hooks**
*   **What:** Insert `hooks.audit.log()` calls into critical Convex mutations (`message.create`, `member.add`).
*   **Why:** To make the "Managed vs OSS" boundary real.
*   **Minimal Implementation:**
    *   Inject `ExtensionHooks` into Convex mutations (or use a middleware pattern).
    *   Emit 1-2 key events (Message Created, Member Joined).

**Priority 4: Clarify "Organization" Scope**
*   **What:** Decide if `Workspace` = `Organization`.
*   **Why:** To prevent future data migration pain.
*   **Minimal Implementation:**
    *   Add `isOrganizationRoot` flag to Workspace, or document strict 1:1 mapping.

## 6) Non-Goals

1.  **Full Self-Host Implementation**
    *   Do not build the Postgres/WebSocket backend now. It is waste until the frontend abstraction (Priority 2) is complete.
2.  **UI Polish**
    *   Do not spend time on UI/CSS until the underlying trust model is secure.
3.  **Social Features**
    *   Explicitly reject any "Public Profile" or "Cross-Workspace Direct Messaging" features. This violates the security model.
