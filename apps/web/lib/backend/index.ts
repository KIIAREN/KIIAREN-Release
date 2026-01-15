/**
 * Canonical Backend Hook Façade
 *
 * This module provides a unified, provider-agnostic API for all backend operations.
 * It abstracts away provider-specific implementations (Convex, self-host) and exposes
 * a consistent hook-based interface for React components.
 *
 * ## Architecture
 *
 * ```
 * Components → @/lib/backend (this module) → Provider Adapter → Backend Implementation
 * ```
 *
 * ## Usage
 *
 * ```tsx
 * import { useGetWorkspaces, useCreateWorkspace } from '@/lib/backend';
 *
 * function MyComponent() {
 *   const { data: workspaces, isLoading } = useGetWorkspaces();
 *   const { mutate: createWorkspace, isPending } = useCreateWorkspace();
 *
 *   // Works with any provider (Convex, self-host, etc.)
 * }
 * ```
 *
 * ## Provider Support
 *
 * - **Convex** (default): Uses React hooks (useQuery, useMutation) internally
 * - **Self-host** (future): Uses async provider methods with React state management
 *
 * ## Migration Guide
 *
 * **Before (direct Convex):**
 * ```tsx
 * import { useQuery } from 'convex/react';
 * import { api } from '@/../convex/_generated/api';
 *
 * const data = useQuery(api.workspaces.get);
 * ```
 *
 * **After (canonical façade):**
 * ```tsx
 * import { useGetWorkspaces } from '@/lib/backend';
 *
 * const { data, isLoading } = useGetWorkspaces();
 * ```
 *
 * ## Benefits
 *
 * 1. **Provider-agnostic**: Switch between Convex and self-host without code changes
 * 2. **Type-safe**: Full TypeScript support with provider-agnostic types
 * 3. **Consistent API**: Same hook pattern across all features
 * 4. **Future-proof**: Easy to add new providers or features
 *
 * @module @/lib/backend
 */

// Workspace hooks
export {
  useGetWorkspaces,
  useGetWorkspace,
  useGetWorkspaceInfo,
  useCreateWorkspace,
  useJoinWorkspace,
  useUpdateWorkspace,
  useRemoveWorkspace,
  useRegenerateJoinCode,
  useNewJoinCode, // Alias for backward compatibility
} from './use-workspaces';

// Channel hooks
export {
  useGetChannels,
  useGetChannel,
} from './use-channels';

// Message hooks
export {
  useGetMessages,
  useCreateMessage,
} from './use-messages';

// Domain verification hooks
export {
  useAddDomain,
  useVerifyDomain,
  useListDomains,
  useRemoveDomain,
  useGetVerificationInstructions,
} from './use-domains';

// Invite link hooks
export {
  useCreateInviteLink,
  useListInviteLinks,
  useRevokeInviteLink,
  useValidateInviteLink,
} from './use-invites';

// Re-export types for convenience
export type {
  Workspace,
  Channel,
  Message,
  Member,
  Doc,
  Board,
  PaginatedResult,
  PaginationParams,
} from '@kiiaren/core';