/**
 * Managed-Only Features Definition
 *
 * This module defines features that are architecturally restricted to the
 * managed tier. These cannot be enabled via configuration in OSS - they
 * require infrastructure and services only available in managed deployments.
 *
 * DESIGN PRINCIPLE:
 * Features are managed-only when they require:
 * 1. Infrastructure not self-hostable (proprietary services, scale)
 * 2. Security guarantees requiring operational trust
 * 3. Compliance requirements needing formal verification
 * 4. Data processing that creates liability
 */

import type { EntityId, KernelEvent } from '../providers/types';

// -----------------------------------------------------------------------------
// Feature Gate Types
// -----------------------------------------------------------------------------

/**
 * Managed-only feature identifiers.
 * OSS code can reference these, but implementations are no-ops or throw.
 */
export type ManagedFeature =
  | 'kms' // Key Management Service
  | 'encrypted_sync' // Cross-device E2E encrypted sync
  | 'indexed_search' // Long-term indexed full-text search
  | 'audit_logs' // Compliance audit logging
  | 'ediscovery' // Legal discovery exports
  | 'sso_saml' // Enterprise SSO (SAML/OIDC)
  | 'ai_agents' // AI agents with persistent memory
  | 'push_notifications' // Native push notification infrastructure
  | 'sla_monitoring' // SLA tracking and incident management
  | 'backup_restore' // Automated backup and point-in-time restore
  | 'analytics' // Usage analytics and reporting
  | 'admin_console'; // Multi-tenant admin console

/**
 * Feature availability check result
 */
export interface FeatureAvailability {
  available: boolean;
  reason?: string;
  requiresManaged: boolean;
  documentationUrl?: string;
}

/**
 * Feature gate - architectural enforcement of managed boundaries
 */
export interface FeatureGate {
  /**
   * Check if a feature is available in current deployment
   */
  isAvailable(feature: ManagedFeature): FeatureAvailability;

  /**
   * Assert feature availability, throw if not available
   */
  requireFeature(feature: ManagedFeature): void;

  /**
   * List all available features
   */
  listAvailable(): ManagedFeature[];

  /**
   * List all managed-only features (not available in OSS)
   */
  listManagedOnly(): ManagedFeature[];
}

// -----------------------------------------------------------------------------
// Extension Hook Types (OSS can emit, Managed can handle)
// -----------------------------------------------------------------------------

/**
 * Extension hooks allow OSS to emit events that managed tier can process.
 * OSS implementations are no-ops; managed tier provides real handlers.
 *
 * This is the architectural boundary: OSS emits, managed handles.
 */

/**
 * Audit hook - OSS emits security-relevant events
 */
export interface AuditHook {
  /**
   * Log an auditable action (no-op in OSS)
   */
  log(event: AuditEvent): Promise<void>;

  /**
   * Query audit logs (throws in OSS)
   */
  query(params: AuditQueryParams): Promise<never>;
}

export interface AuditEvent {
  action: string;
  actorId: EntityId;
  resourceType: string;
  resourceId: EntityId;
  workspaceId: EntityId;
  metadata?: Record<string, unknown>;
  timestamp: number;
}

export interface AuditQueryParams {
  workspaceId: EntityId;
  startDate: Date;
  endDate: Date;
  actorId?: EntityId;
  action?: string;
  limit?: number;
}

/**
 * Search hook - OSS emits indexable content
 */
export interface SearchHook {
  /**
   * Index content (no-op in OSS)
   */
  index(event: SearchIndexEvent): Promise<void>;

  /**
   * Search indexed content (throws in OSS)
   */
  search(params: SearchParams): Promise<never>;
}

export interface SearchIndexEvent {
  documentType: 'message' | 'doc' | 'board';
  documentId: EntityId;
  workspaceId: EntityId;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface SearchParams {
  workspaceId: EntityId;
  query: string;
  types?: ('message' | 'doc' | 'board')[];
  limit?: number;
}

/**
 * AI hook - OSS emits context for AI processing
 */
export interface AIHook {
  /**
   * Process AI request (throws in OSS)
   */
  process(request: AIRequest): Promise<never>;

  /**
   * Store AI memory (no-op in OSS)
   */
  storeMemory(memory: AIMemory): Promise<void>;
}

export interface AIRequest {
  type: 'completion' | 'embedding' | 'agent';
  workspaceId: EntityId;
  context: string;
  systemPrompt?: string;
}

export interface AIMemory {
  agentId: EntityId;
  workspaceId: EntityId;
  key: string;
  value: string;
  expiresAt?: number;
}

/**
 * Notification hook - OSS emits notification requests
 */
export interface NotificationHook {
  /**
   * Send push notification (no-op in OSS)
   */
  sendPush(notification: PushNotification): Promise<void>;

  /**
   * Register device token (no-op in OSS)
   */
  registerDevice(token: DeviceToken): Promise<void>;
}

export interface PushNotification {
  userId: EntityId;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export interface DeviceToken {
  userId: EntityId;
  platform: 'ios' | 'android' | 'web';
  token: string;
}

/**
 * KMS hook - OSS emits encryption requests
 */
export interface KMSHook {
  /**
   * Encrypt data with managed key (throws in OSS)
   */
  encrypt(data: string, keyId?: string): Promise<never>;

  /**
   * Decrypt data with managed key (throws in OSS)
   */
  decrypt(ciphertext: string, keyId?: string): Promise<never>;

  /**
   * Rotate encryption key (throws in OSS)
   */
  rotateKey(keyId: string): Promise<never>;
}

// -----------------------------------------------------------------------------
// Composite Extension Interface
// -----------------------------------------------------------------------------

/**
 * All extension hooks bundled together.
 * OSS provides stub implementations; managed provides real ones.
 */
export interface ExtensionHooks {
  audit: AuditHook;
  search: SearchHook;
  ai: AIHook;
  notification: NotificationHook;
  kms: KMSHook;
}

/**
 * Event bus for extension hooks.
 * Allows managed tier to subscribe to OSS events.
 */
export interface ExtensionEventBus {
  /**
   * Emit event to extension handlers
   */
  emit(event: ExtensionEvent): Promise<void>;

  /**
   * Subscribe to extension events (managed tier only)
   */
  subscribe(
    eventType: ExtensionEvent['type'],
    handler: (event: ExtensionEvent) => Promise<void>
  ): () => void;
}

export type ExtensionEvent =
  | { type: 'audit'; payload: AuditEvent }
  | { type: 'search.index'; payload: SearchIndexEvent }
  | { type: 'ai.memory'; payload: AIMemory }
  | { type: 'notification.push'; payload: PushNotification }
  | { type: 'notification.device'; payload: DeviceToken };

// -----------------------------------------------------------------------------
// OSS Stub Factory
// -----------------------------------------------------------------------------

import { ManagedOnlyError } from '../errors';

/**
 * Creates stub implementations for managed-only features in OSS.
 *
 * Behavior patterns:
 * - Blocking operations: THROW with clear ManagedOnlyError
 * - Emit operations: NO-OP (allows OSS kernel to function)
 *
 * THIS IS INTENTIONAL:
 * - OSS should not silently fail on operations that require infrastructure
 * - But OSS should gracefully degrade when emitting events to non-existent handlers
 *
 * @returns ExtensionHooks with OSS-appropriate implementations
 */
export function createOSSStubs(): ExtensionHooks {
  return {
    /**
     * AUDIT HOOKS
     * - log(): NO-OP - OSS can emit audit events, managed tier persists them
     * - query(): THROWS - Audit query requires indexed storage (managed-only)
     *
     * This hook is managed-only and intentionally unavailable in OSS.
     */
    audit: {
      log: async () => {
        // NO-OP: OSS emits audit events but they aren't persisted
        // Managed tier intercepts these and stores them
      },
      query: () => {
        throw new ManagedOnlyError('audit_logs');
      },
    },

    /**
     * SEARCH HOOKS
     * - index(): NO-OP - OSS can emit index events, managed tier indexes them
     * - search(): THROWS - Full-text search requires infrastructure (managed-only)
     *
     * This hook is managed-only and intentionally unavailable in OSS.
     */
    search: {
      index: async () => {
        // NO-OP: OSS emits index events but they aren't processed
        // Managed tier intercepts these and indexes documents
      },
      search: () => {
        throw new ManagedOnlyError('indexed_search');
      },
    },

    /**
     * AI HOOKS
     * - process(): THROWS - AI processing requires compute infrastructure (managed-only)
     * - storeMemory(): NO-OP - OSS can emit memory events, managed tier stores them
     *
     * This hook is managed-only and intentionally unavailable in OSS.
     */
    ai: {
      process: () => {
        throw new ManagedOnlyError('ai_agents');
      },
      storeMemory: async () => {
        // NO-OP: OSS emits memory events but they aren't stored
        // Managed tier intercepts these and persists AI memory
      },
    },

    /**
     * NOTIFICATION HOOKS
     * - sendPush(): NO-OP - OSS can request push, managed tier delivers
     * - registerDevice(): NO-OP - OSS can register, managed tier stores
     *
     * This hook is managed-only and intentionally unavailable in OSS.
     */
    notification: {
      sendPush: async () => {
        // NO-OP: OSS can request push notifications but they aren't delivered
        // Managed tier intercepts these and delivers via APNS/FCM
      },
      registerDevice: async () => {
        // NO-OP: OSS can register devices but tokens aren't stored
        // Managed tier stores device tokens for push delivery
      },
    },

    /**
     * KMS HOOKS
     * - encrypt(): THROWS - Encryption requires managed KMS (managed-only)
     * - decrypt(): THROWS - Decryption requires managed KMS (managed-only)
     * - rotateKey(): THROWS - Key rotation requires managed KMS (managed-only)
     *
     * This hook is managed-only and intentionally unavailable in OSS.
     * For self-hosted encryption, implement your own key management.
     */
    kms: {
      encrypt: () => {
        throw new ManagedOnlyError('kms');
      },
      decrypt: () => {
        throw new ManagedOnlyError('kms');
      },
      rotateKey: () => {
        throw new ManagedOnlyError('kms');
      },
    },
  };
}
