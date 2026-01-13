/**
 * KIIAREN Backend Provider Abstraction Layer
 *
 * This module defines the contract that any backend provider must implement
 * to be compatible with KIIAREN. The OSS kernel depends ONLY on these interfaces,
 * not on any specific provider implementation.
 *
 * Providers:
 * - ConvexProvider: Default managed provider (Convex backend)
 * - SelfHostProvider: Community self-host option (Postgres + WebSocket)
 *
 * Architecture:
 * apps/web → @kiiaren/core (interfaces) → Provider Implementation
 */

// -----------------------------------------------------------------------------
// Core Identity Types
// -----------------------------------------------------------------------------

/**
 * Generic identifier type. Each provider maps this to their native ID type.
 * - Convex: Id<TableName>
 * - Self-host: string (UUID v4)
 */
export type EntityId = string;

/**
 * Authenticated user identity
 */
export interface UserIdentity {
  id: EntityId;
  email?: string;
  name?: string;
  image?: string;
  provider: 'password' | 'oauth';
  oauthProvider?: 'google' | 'github';
}

/**
 * Session state
 */
export interface Session {
  userId: EntityId;
  isAuthenticated: boolean;
  expiresAt?: number;
}

// -----------------------------------------------------------------------------
// Event System Types
// -----------------------------------------------------------------------------

/**
 * Domain events emitted by the kernel. Providers must be able to emit and
 * subscribe to these events. Managed tier may extend with additional events.
 */
export type KernelEvent =
  | MessageCreatedEvent
  | MessageUpdatedEvent
  | MessageDeletedEvent
  | ReactionToggledEvent
  | ChannelCreatedEvent
  | ChannelUpdatedEvent
  | MemberJoinedEvent
  | MemberLeftEvent
  | PresenceChangedEvent;

export interface BaseEvent {
  type: string;
  timestamp: number;
  workspaceId: EntityId;
  actorId: EntityId; // User who triggered the event
}

export interface MessageCreatedEvent extends BaseEvent {
  type: 'message.created';
  payload: {
    messageId: EntityId;
    channelId?: EntityId;
    conversationId?: EntityId;
    parentMessageId?: EntityId;
    body: string;
    hasAttachment: boolean;
  };
}

export interface MessageUpdatedEvent extends BaseEvent {
  type: 'message.updated';
  payload: {
    messageId: EntityId;
    body: string;
  };
}

export interface MessageDeletedEvent extends BaseEvent {
  type: 'message.deleted';
  payload: {
    messageId: EntityId;
  };
}

export interface ReactionToggledEvent extends BaseEvent {
  type: 'reaction.toggled';
  payload: {
    messageId: EntityId;
    reaction: string;
    added: boolean;
  };
}

export interface ChannelCreatedEvent extends BaseEvent {
  type: 'channel.created';
  payload: {
    channelId: EntityId;
    name: string;
  };
}

export interface ChannelUpdatedEvent extends BaseEvent {
  type: 'channel.updated';
  payload: {
    channelId: EntityId;
    name: string;
  };
}

export interface MemberJoinedEvent extends BaseEvent {
  type: 'member.joined';
  payload: {
    memberId: EntityId;
    userId: EntityId;
    role: 'admin' | 'member';
  };
}

export interface MemberLeftEvent extends BaseEvent {
  type: 'member.left';
  payload: {
    memberId: EntityId;
    userId: EntityId;
  };
}

export interface PresenceChangedEvent extends BaseEvent {
  type: 'presence.changed';
  payload: {
    userId: EntityId;
    status: 'online' | 'away' | 'offline';
  };
}

// -----------------------------------------------------------------------------
// Subscription Types
// -----------------------------------------------------------------------------

export type UnsubscribeFn = () => void;

export interface Subscription<T> {
  /**
   * Current data (reactive)
   */
  data: T | undefined;
  /**
   * Loading state
   */
  isLoading: boolean;
  /**
   * Error if any
   */
  error: Error | null;
  /**
   * Unsubscribe from updates
   */
  unsubscribe: UnsubscribeFn;
}

// -----------------------------------------------------------------------------
// Persistence Types (Domain Models)
// -----------------------------------------------------------------------------

export interface Workspace {
  id: EntityId;
  name: string;
  ownerId: EntityId;
  joinCode: string;
  createdAt: number;
  /** True if any domain is verified for this workspace */
  domainVerified: boolean;
  /** False when domainVerified is true (public join codes disabled) */
  joinCodeEnabled: boolean;
}

export interface Channel {
  id: EntityId;
  workspaceId: EntityId;
  name: string;
  createdAt: number;
}

export interface Member {
  id: EntityId;
  userId: EntityId;
  workspaceId: EntityId;
  role: 'admin' | 'member';
  user?: {
    name?: string;
    image?: string;
  };
}

export interface Message {
  id: EntityId;
  workspaceId: EntityId;
  channelId?: EntityId;
  conversationId?: EntityId;
  parentMessageId?: EntityId;
  memberId: EntityId;
  body: string;
  imageUrl?: string;
  createdAt: number;
  updatedAt?: number;
  member?: Member;
  reactions?: ReactionGroup[];
  threadCount?: number;
  threadTimestamp?: number;
}

export interface ReactionGroup {
  value: string;
  count: number;
  memberIds: EntityId[];
}

export interface Conversation {
  id: EntityId;
  workspaceId: EntityId;
  memberOneId: EntityId;
  memberTwoId: EntityId;
}

export interface Doc {
  id: EntityId;
  workspaceId: EntityId;
  title: string;
  content?: string;
  parentDocumentId?: EntityId;
  coverImageUrl?: string;
  icon?: string;
  isArchived: boolean;
  isPublished: boolean;
  createdBy: EntityId;
  createdAt: number;
  updatedAt: number;
}

export interface Board {
  id: EntityId;
  workspaceId: EntityId;
  title: string;
  excalidrawData?: string;
  thumbnailUrl?: string;
  createdBy: EntityId;
  createdAt: number;
  updatedAt: number;
}

// -----------------------------------------------------------------------------
// Pagination Types
// -----------------------------------------------------------------------------

export interface PaginatedResult<T> {
  items: T[];
  cursor?: string;
  hasMore: boolean;
}

export interface PaginationParams {
  cursor?: string;
  limit?: number;
}

// -----------------------------------------------------------------------------
// Provider Interfaces
// -----------------------------------------------------------------------------

/**
 * Authentication provider interface.
 * Handles user identity, session management, and OAuth flows.
 */
export interface AuthProvider {
  /**
   * Get current session (null if not authenticated)
   */
  getSession(): Promise<Session | null>;

  /**
   * Get current user identity
   */
  getCurrentUser(): Promise<UserIdentity | null>;

  /**
   * Sign in with email/password
   */
  signInWithPassword(email: string, password: string): Promise<void>;

  /**
   * Sign up with email/password
   */
  signUpWithPassword(
    email: string,
    password: string,
    name: string
  ): Promise<void>;

  /**
   * Initiate OAuth flow
   */
  signInWithOAuth(provider: 'google' | 'github'): Promise<void>;

  /**
   * Sign out current session
   */
  signOut(): Promise<void>;

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (session: Session | null) => void): UnsubscribeFn;
}

/**
 * Real-time events provider interface.
 * Handles event subscriptions and real-time updates.
 */
export interface EventsProvider {
  /**
   * Subscribe to kernel events for a workspace
   */
  subscribe(
    workspaceId: EntityId,
    eventTypes: KernelEvent['type'][],
    callback: (event: KernelEvent) => void
  ): UnsubscribeFn;

  /**
   * Emit an event (used internally by mutations)
   */
  emit(event: KernelEvent): Promise<void>;
}

/**
 * Persistence provider interface.
 * Handles CRUD operations for all domain entities.
 */
export interface PersistenceProvider {
  // Workspaces
  workspace: {
    create(name: string): Promise<EntityId>;
    get(id: EntityId): Promise<Workspace | null>;
    update(id: EntityId, data: Partial<Pick<Workspace, 'name'>>): Promise<void>;
    remove(id: EntityId): Promise<void>;
    getByUserId(userId: EntityId): Promise<Workspace[]>;
    join(joinCode: string): Promise<EntityId>;
    regenerateJoinCode(id: EntityId): Promise<string>;
  };

  // Channels
  channel: {
    create(workspaceId: EntityId, name: string): Promise<EntityId>;
    get(workspaceId: EntityId): Promise<Channel[]>;
    getById(id: EntityId): Promise<Channel | null>;
    update(id: EntityId, name: string): Promise<void>;
    remove(id: EntityId): Promise<void>;
  };

  // Members
  member: {
    get(workspaceId: EntityId): Promise<Member[]>;
    getById(id: EntityId): Promise<Member | null>;
    getCurrent(workspaceId: EntityId): Promise<Member | null>;
    updateRole(id: EntityId, role: 'admin' | 'member'): Promise<void>;
    remove(id: EntityId): Promise<void>;
  };

  // Messages
  message: {
    create(data: {
      workspaceId: EntityId;
      channelId?: EntityId;
      conversationId?: EntityId;
      parentMessageId?: EntityId;
      body: string;
      imageId?: EntityId;
    }): Promise<EntityId>;
    get(
      params: {
        channelId?: EntityId;
        conversationId?: EntityId;
        parentMessageId?: EntityId;
      },
      pagination?: PaginationParams
    ): Promise<PaginatedResult<Message>>;
    getById(id: EntityId): Promise<Message | null>;
    update(id: EntityId, body: string): Promise<void>;
    remove(id: EntityId): Promise<void>;
  };

  // Reactions
  reaction: {
    toggle(messageId: EntityId, value: string): Promise<void>;
  };

  // Conversations
  conversation: {
    createOrGet(
      workspaceId: EntityId,
      memberOneId: EntityId,
      memberTwoId: EntityId
    ): Promise<EntityId>;
  };

  // Docs
  doc: {
    create(
      workspaceId: EntityId,
      title: string,
      parentDocumentId?: EntityId
    ): Promise<EntityId>;
    get(workspaceId: EntityId, parentDocumentId?: EntityId): Promise<Doc[]>;
    getById(id: EntityId): Promise<Doc | null>;
    update(
      id: EntityId,
      data: Partial<Pick<Doc, 'title' | 'content' | 'icon' | 'isPublished'>>
    ): Promise<void>;
    archive(id: EntityId): Promise<void>;
    restore(id: EntityId): Promise<void>;
    remove(id: EntityId): Promise<void>;
    search(workspaceId: EntityId, query: string): Promise<Doc[]>;
  };

  // Boards
  board: {
    create(workspaceId: EntityId, title: string): Promise<EntityId>;
    get(workspaceId: EntityId): Promise<Board[]>;
    getById(id: EntityId): Promise<Board | null>;
    update(
      id: EntityId,
      data: Partial<Pick<Board, 'title' | 'excalidrawData'>>
    ): Promise<void>;
    remove(id: EntityId): Promise<void>;
  };

  // Domain verification
  domain: {
    /**
     * Add a domain for verification (admin-only)
     * Creates a pending domain with verification token.
     */
    add(workspaceId: EntityId, domain: string): Promise<EntityId>;
    /**
     * Attempt DNS TXT verification (admin-only)
     */
    verify(domainId: EntityId): Promise<{ success: boolean; error?: string }>;
    /**
     * List all domains for workspace (admin-only)
     */
    list(workspaceId: EntityId): Promise<
      Array<{
        id: EntityId;
        domain: string;
        status: 'pending' | 'verified' | 'failed';
        verificationToken: string;
        verifiedAt?: number;
        createdAt: number;
      }>
    >;
    /**
     * Remove a domain (admin-only)
     */
    remove(domainId: EntityId): Promise<void>;
    /**
     * Check if email matches verified domain (public)
     */
    checkEmail(
      workspaceId: EntityId,
      email: string
    ): Promise<{ matches: boolean; domain?: string }>;
  };

  // Invite links
  invite: {
    /**
     * Create an invite link (admin-only)
     */
    create(
      workspaceId: EntityId,
      expiresInHours: number,
      scope: 'workspace' | { type: 'channel'; channelId: EntityId },
      maxUses?: number
    ): Promise<EntityId>;
    /**
     * Get invite by code (public)
     */
    getByCode(code: string): Promise<{
      id: EntityId;
      workspaceId: EntityId;
      expiresAt: number;
      scope: 'workspace' | { type: 'channel'; channelId: EntityId };
    } | null>;
    /**
     * Redeem invite link (authenticated)
     */
    redeem(code: string): Promise<EntityId>; // Returns workspace/channel ID
    /**
     * List invite links (admin-only)
     */
    list(workspaceId: EntityId): Promise<
      Array<{
        id: EntityId;
        code: string;
        expiresAt: number;
        maxUses?: number;
        usedCount: number;
        scope: 'workspace' | { type: 'channel'; channelId: EntityId };
        revokedAt?: number;
        createdAt: number;
      }>
    >;
    /**
     * Revoke invite link (admin-only)
     */
    revoke(inviteLinkId: EntityId): Promise<void>;
  };
}

/**
 * Storage provider interface.
 * Handles file uploads and blob storage.
 */
export interface StorageProvider {
  /**
   * Generate a presigned upload URL
   */
  generateUploadUrl(): Promise<string>;

  /**
   * Get a download URL for a stored file
   */
  getUrl(storageId: EntityId): Promise<string | null>;

  /**
   * Delete a stored file
   */
  remove(storageId: EntityId): Promise<void>;
}

// -----------------------------------------------------------------------------
// Composite Provider Interface
// -----------------------------------------------------------------------------

/**
 * Complete backend provider interface.
 * Combines all sub-providers into a single contract.
 */
export interface BackendProvider {
  /**
   * Provider identifier
   */
  readonly id: 'convex' | 'self-host' | string;

  /**
   * Provider display name
   */
  readonly name: string;

  /**
   * Whether this is a managed provider (enables managed-only features)
   */
  readonly isManaged: boolean;

  /**
   * Authentication provider
   */
  auth: AuthProvider;

  /**
   * Real-time events provider
   */
  events: EventsProvider;

  /**
   * Persistence provider
   */
  persistence: PersistenceProvider;

  /**
   * Storage provider
   */
  storage: StorageProvider;

  /**
   * Initialize the provider (called once at app startup)
   */
  initialize(config: ProviderConfig): Promise<void>;

  /**
   * Cleanup resources (called on app shutdown)
   */
  destroy(): Promise<void>;
}

/**
 * Provider configuration
 */
export interface ProviderConfig {
  /**
   * Provider-specific configuration
   */
  [key: string]: unknown;
}

/**
 * Convex-specific configuration
 */
export interface ConvexProviderConfig extends ProviderConfig {
  url: string;
}

/**
 * Self-host-specific configuration
 */
export interface SelfHostProviderConfig extends ProviderConfig {
  databaseUrl: string;
  websocketUrl: string;
  storageProvider: 's3' | 'local';
  storageConfig: {
    bucket?: string;
    region?: string;
    localPath?: string;
  };
}

// -----------------------------------------------------------------------------
// Provider Registry
// -----------------------------------------------------------------------------

/**
 * Provider factory function type
 */
export type ProviderFactory = (config: ProviderConfig) => BackendProvider;

/**
 * Registry for available providers
 */
export interface ProviderRegistry {
  register(id: string, factory: ProviderFactory): void;
  get(id: string): ProviderFactory | undefined;
  list(): string[];
}
