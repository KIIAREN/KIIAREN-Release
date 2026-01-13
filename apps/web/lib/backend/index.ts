/**
 * Backend Hooks
 *
 * Provider-aware hooks for core KIIAREN operations.
 * These hooks use @kiiaren/core interfaces and support
 * provider switching via NEXT_PUBLIC_KIIAREN_PROVIDER.
 *
 * Currently implemented: Convex provider
 * Future: Self-host provider
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
  useNewJoinCode,
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
