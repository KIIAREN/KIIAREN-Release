/**
 * @kiiaren/core
 *
 * Core interfaces and types for KIIAREN backend providers.
 *
 * This package defines the contract that decouples apps/web from any
 * specific backend implementation. Use these interfaces to:
 *
 * 1. Build against the abstraction, not the implementation
 * 2. Switch between managed (Convex) and self-hosted providers
 * 3. Understand the architectural boundaries (OSS vs managed)
 *
 * @example
 * ```tsx
 * import {
 *   BackendProvider,
 *   createConvexProvider,
 *   createSelfHostProvider,
 * } from '@kiiaren/core';
 *
 * // Choose provider based on deployment mode
 * const provider: BackendProvider = process.env.KIIAREN_PROVIDER === 'self-host'
 *   ? createSelfHostProvider()
 *   : createConvexProvider();
 *
 * await provider.initialize(config);
 * ```
 */

// Provider interfaces and types
export type {
  // Core types
  EntityId,
  UserIdentity,
  Session,
  UnsubscribeFn,
  // Event system
  KernelEvent,
  BaseEvent,
  MessageCreatedEvent,
  MessageUpdatedEvent,
  MessageDeletedEvent,
  ReactionToggledEvent,
  ChannelCreatedEvent,
  ChannelUpdatedEvent,
  MemberJoinedEvent,
  MemberLeftEvent,
  PresenceChangedEvent,
  // Domain models
  Workspace,
  Channel,
  Member,
  Message,
  ReactionGroup,
  Conversation,
  Doc,
  Board,
  // Pagination
  PaginatedResult,
  PaginationParams,
  Subscription,
  // Provider interfaces
  BackendProvider,
  AuthProvider,
  EventsProvider,
  PersistenceProvider,
  StorageProvider,
  // Config types
  ProviderConfig,
  ConvexProviderConfig,
  SelfHostProviderConfig,
  // Registry
  ProviderFactory,
  ProviderRegistry,
} from './providers/types';

// Managed features
export type {
  ManagedFeature,
  FeatureAvailability,
  FeatureGate,
  // Extension hooks
  ExtensionHooks,
  AuditHook,
  AuditEvent,
  AuditQueryParams,
  SearchHook,
  SearchIndexEvent,
  SearchParams,
  AIHook,
  AIRequest,
  AIMemory,
  NotificationHook,
  PushNotification,
  DeviceToken,
  KMSHook,
  ExtensionEventBus,
  ExtensionEvent,
} from './managed/types';

// Provider factories
export { createConvexProvider } from './providers/convex';
export { createSelfHostProvider } from './providers/self-host';

// Managed feature stubs
export { createOSSStubs } from './managed/types';

// Domain trust primitives
export type {
  DomainStatus,
  Domain,
  DomainVerificationResult,
  DomainProvider,
  InviteLink,
  InviteLinkScope,
  InviteLinkScopeWorkspace,
  InviteLinkScopeChannel,
  CreateInviteLinkInput,
  InviteRedemptionResult,
  InviteProvider,
  WorkspaceDomainFields,
} from './domain/types';
export { DNS_TXT_PREFIX, DNS_TXT_SUBDOMAIN } from './domain/types';

// Error types
export {
  ManagedOnlyError,
  NotImplementedError,
  DomainVerificationError,
  InviteLinkError,
  isKiiarenError,
} from './errors';

// -----------------------------------------------------------------------------
// Provider Context (for React integration)
// -----------------------------------------------------------------------------

/**
 * Provider context configuration for React apps.
 *
 * Usage in apps/web:
 * ```tsx
 * import { KIIARENProvider, useBackendProvider } from '@kiiaren/core/react';
 *
 * // In app layout
 * <KIIARENProvider provider={provider}>
 *   <App />
 * </KIIARENProvider>
 *
 * // In components
 * const { persistence, auth } = useBackendProvider();
 * ```
 */
export interface ProviderContextValue {
  provider: import('./providers/types').BackendProvider;
  isReady: boolean;
  error: Error | null;
}

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

/**
 * Provider identifiers
 */
export const PROVIDER_IDS = {
  CONVEX: 'convex',
  SELF_HOST: 'self-host',
} as const;

/**
 * List of all managed-only features
 */
export const MANAGED_ONLY_FEATURES: import('./managed/types').ManagedFeature[] = [
  'kms',
  'encrypted_sync',
  'indexed_search',
  'audit_logs',
  'ediscovery',
  'sso_saml',
  'ai_agents',
  'push_notifications',
  'sla_monitoring',
  'backup_restore',
  'analytics',
  'admin_console',
];

/**
 * OSS kernel features (always available)
 */
export const OSS_FEATURES = [
  'workspaces',
  'channels',
  'direct_messages',
  'threads',
  'reactions',
  'file_uploads',
  'docs',
  'boards',
  'basic_auth', // email/password, basic OAuth
  'basic_search', // non-indexed, in-memory
  'real_time', // WebSocket/subscription updates
  'domain_verification', // DNS TXT verification for workspace trust
  'invite_links', // Admin-issued invite links for external users
] as const;
