/**
 * Convex Backend Provider
 *
 * Default managed provider implementation using Convex.
 * This provider wraps the existing Convex integration and exposes it
 * through the BackendProvider interface.
 *
 * USAGE:
 * This is the recommended provider for most deployments. Convex provides:
 * - Managed real-time subscriptions
 * - Automatic scaling
 * - Built-in auth with OAuth support
 * - Integrated blob storage
 *
 * The implementation delegates to the existing convex/ functions via
 * Convex React hooks in the web app. This file defines the provider
 * contract; actual hook usage remains in apps/web.
 */

import type {
  BackendProvider,
  AuthProvider,
  EventsProvider,
  PersistenceProvider,
  StorageProvider,
  ProviderConfig,
  ConvexProviderConfig,
  EntityId,
  Session,
  UserIdentity,
  KernelEvent,
  UnsubscribeFn,
  Workspace,
  Channel,
  Member,
  Message,
  Doc,
  Board,
  PaginatedResult,
  PaginationParams,
} from '../types';

// -----------------------------------------------------------------------------
// Provider Implementation
// -----------------------------------------------------------------------------

/**
 * Create Convex backend provider.
 *
 * Note: The actual Convex client initialization happens in apps/web via
 * the ConvexClientProvider component. This factory creates the provider
 * interface that the app uses.
 */
export function createConvexProvider(): BackendProvider {
  let config: ConvexProviderConfig | null = null;

  // Placeholder - actual implementation delegates to Convex React hooks
  // These will be populated when integrated with apps/web

  const auth: AuthProvider = {
    async getSession(): Promise<Session | null> {
      // Delegates to useConvexAuth() in React context
      throw new Error('Call within ConvexAuthProvider context');
    },

    async getCurrentUser(): Promise<UserIdentity | null> {
      // Delegates to api.users.current query
      throw new Error('Call within ConvexProvider context');
    },

    async signInWithPassword(email: string, password: string): Promise<void> {
      // Delegates to signIn('password', { email, password, flow: 'signIn' })
      throw new Error('Call within ConvexAuthProvider context');
    },

    async signUpWithPassword(
      email: string,
      password: string,
      name: string
    ): Promise<void> {
      // Delegates to signIn('password', { email, password, name, flow: 'signUp' })
      throw new Error('Call within ConvexAuthProvider context');
    },

    async signInWithOAuth(provider: 'google' | 'github'): Promise<void> {
      // Delegates to signIn(provider)
      throw new Error('Call within ConvexAuthProvider context');
    },

    async signOut(): Promise<void> {
      // Delegates to signOut() from @convex-dev/auth
      throw new Error('Call within ConvexAuthProvider context');
    },

    onAuthStateChange(
      callback: (session: Session | null) => void
    ): UnsubscribeFn {
      // Delegates to Convex auth state subscription
      throw new Error('Call within ConvexAuthProvider context');
    },
  };

  const events: EventsProvider = {
    subscribe(
      workspaceId: EntityId,
      eventTypes: KernelEvent['type'][],
      callback: (event: KernelEvent) => void
    ): UnsubscribeFn {
      // Convex handles real-time via query subscriptions
      // Events are derived from query updates, not explicit pub/sub
      // This is handled by useQuery() hooks automatically
      return () => {};
    },

    async emit(event: KernelEvent): Promise<void> {
      // Events are implicit in Convex - mutations trigger query updates
      // No explicit emit needed
    },
  };

  const persistence: PersistenceProvider = {
    workspace: {
      async create(name: string): Promise<EntityId> {
        // Delegates to api.workspaces.create
        throw new Error('Call within ConvexProvider context');
      },

      async get(id: EntityId): Promise<Workspace | null> {
        // Delegates to api.workspaces.get
        throw new Error('Call within ConvexProvider context');
      },

      async update(
        id: EntityId,
        data: Partial<Pick<Workspace, 'name'>>
      ): Promise<void> {
        // Delegates to api.workspaces.update
        throw new Error('Call within ConvexProvider context');
      },

      async remove(id: EntityId): Promise<void> {
        // Delegates to api.workspaces.remove
        throw new Error('Call within ConvexProvider context');
      },

      async getByUserId(userId: EntityId): Promise<Workspace[]> {
        // Delegates to api.workspaces.get
        throw new Error('Call within ConvexProvider context');
      },

      async join(joinCode: string): Promise<EntityId> {
        // Delegates to api.workspaces.join
        throw new Error('Call within ConvexProvider context');
      },

      async regenerateJoinCode(id: EntityId): Promise<string> {
        // Delegates to api.workspaces.newJoinCode
        throw new Error('Call within ConvexProvider context');
      },
    },

    channel: {
      async create(workspaceId: EntityId, name: string): Promise<EntityId> {
        // Delegates to api.channels.create
        throw new Error('Call within ConvexProvider context');
      },

      async get(workspaceId: EntityId): Promise<Channel[]> {
        // Delegates to api.channels.get
        throw new Error('Call within ConvexProvider context');
      },

      async getById(id: EntityId): Promise<Channel | null> {
        // Delegates to api.channels.getById
        throw new Error('Call within ConvexProvider context');
      },

      async update(id: EntityId, name: string): Promise<void> {
        // Delegates to api.channels.update
        throw new Error('Call within ConvexProvider context');
      },

      async remove(id: EntityId): Promise<void> {
        // Delegates to api.channels.remove
        throw new Error('Call within ConvexProvider context');
      },
    },

    member: {
      async get(workspaceId: EntityId): Promise<Member[]> {
        // Delegates to api.members.get
        throw new Error('Call within ConvexProvider context');
      },

      async getById(id: EntityId): Promise<Member | null> {
        // Delegates to api.members.getById
        throw new Error('Call within ConvexProvider context');
      },

      async getCurrent(workspaceId: EntityId): Promise<Member | null> {
        // Delegates to api.members.current
        throw new Error('Call within ConvexProvider context');
      },

      async updateRole(id: EntityId, role: 'admin' | 'member'): Promise<void> {
        // Delegates to api.members.update
        throw new Error('Call within ConvexProvider context');
      },

      async remove(id: EntityId): Promise<void> {
        // Delegates to api.members.remove
        throw new Error('Call within ConvexProvider context');
      },
    },

    message: {
      async create(data: {
        workspaceId: EntityId;
        channelId?: EntityId;
        conversationId?: EntityId;
        parentMessageId?: EntityId;
        body: string;
        imageId?: EntityId;
      }): Promise<EntityId> {
        // Delegates to api.messages.create
        throw new Error('Call within ConvexProvider context');
      },

      async get(
        params: {
          channelId?: EntityId;
          conversationId?: EntityId;
          parentMessageId?: EntityId;
        },
        pagination?: PaginationParams
      ): Promise<PaginatedResult<Message>> {
        // Delegates to api.messages.get (paginated query)
        throw new Error('Call within ConvexProvider context');
      },

      async getById(id: EntityId): Promise<Message | null> {
        // Delegates to api.messages.getById
        throw new Error('Call within ConvexProvider context');
      },

      async update(id: EntityId, body: string): Promise<void> {
        // Delegates to api.messages.update
        throw new Error('Call within ConvexProvider context');
      },

      async remove(id: EntityId): Promise<void> {
        // Delegates to api.messages.remove
        throw new Error('Call within ConvexProvider context');
      },
    },

    reaction: {
      async toggle(messageId: EntityId, value: string): Promise<void> {
        // Delegates to api.reactions.toggle
        throw new Error('Call within ConvexProvider context');
      },
    },

    conversation: {
      async createOrGet(
        workspaceId: EntityId,
        memberOneId: EntityId,
        memberTwoId: EntityId
      ): Promise<EntityId> {
        // Delegates to api.conversations.createOrGet
        throw new Error('Call within ConvexProvider context');
      },
    },

    doc: {
      async create(
        workspaceId: EntityId,
        title: string,
        parentDocumentId?: EntityId
      ): Promise<EntityId> {
        // Delegates to api.docs.create
        throw new Error('Call within ConvexProvider context');
      },

      async get(
        workspaceId: EntityId,
        parentDocumentId?: EntityId
      ): Promise<Doc[]> {
        // Delegates to api.docs.get
        throw new Error('Call within ConvexProvider context');
      },

      async getById(id: EntityId): Promise<Doc | null> {
        // Delegates to api.docs.getById
        throw new Error('Call within ConvexProvider context');
      },

      async update(
        id: EntityId,
        data: Partial<Pick<Doc, 'title' | 'content' | 'icon' | 'isPublished'>>
      ): Promise<void> {
        // Delegates to api.docs.update
        throw new Error('Call within ConvexProvider context');
      },

      async archive(id: EntityId): Promise<void> {
        // Delegates to api.docs.archive
        throw new Error('Call within ConvexProvider context');
      },

      async restore(id: EntityId): Promise<void> {
        // Delegates to api.docs.restore
        throw new Error('Call within ConvexProvider context');
      },

      async remove(id: EntityId): Promise<void> {
        // Delegates to api.docs.remove
        throw new Error('Call within ConvexProvider context');
      },

      async search(workspaceId: EntityId, query: string): Promise<Doc[]> {
        // Delegates to api.docs.search
        throw new Error('Call within ConvexProvider context');
      },
    },

    board: {
      async create(workspaceId: EntityId, title: string): Promise<EntityId> {
        // Delegates to api.boards.create
        throw new Error('Call within ConvexProvider context');
      },

      async get(workspaceId: EntityId): Promise<Board[]> {
        // Delegates to api.boards.get
        throw new Error('Call within ConvexProvider context');
      },

      async getById(id: EntityId): Promise<Board | null> {
        // Delegates to api.boards.getById
        throw new Error('Call within ConvexProvider context');
      },

      async update(
        id: EntityId,
        data: Partial<Pick<Board, 'title' | 'excalidrawData'>>
      ): Promise<void> {
        // Delegates to api.boards.update
        throw new Error('Call within ConvexProvider context');
      },

      async remove(id: EntityId): Promise<void> {
        // Delegates to api.boards.remove
        throw new Error('Call within ConvexProvider context');
      },
    },

    domain: {
      async add(workspaceId: EntityId, domain: string): Promise<EntityId> {
        // Delegates to api.domains.addDomain
        throw new Error('Call within ConvexProvider context');
      },

      async verify(
        domainId: EntityId
      ): Promise<{ success: boolean; error?: string }> {
        // Delegates to api.domainActions.verifyDomain
        throw new Error('Call within ConvexProvider context');
      },

      async list(workspaceId: EntityId): Promise<
        Array<{
          id: EntityId;
          domain: string;
          status: 'pending' | 'verified' | 'failed';
          verificationToken: string;
          verifiedAt?: number;
          createdAt: number;
        }>
      > {
        // Delegates to api.domains.listDomains
        throw new Error('Call within ConvexProvider context');
      },

      async remove(domainId: EntityId): Promise<void> {
        // Delegates to api.domains.removeDomain
        throw new Error('Call within ConvexProvider context');
      },

      async checkEmail(
        workspaceId: EntityId,
        email: string
      ): Promise<{ matches: boolean; domain?: string }> {
        // Delegates to api.domains.checkEmailDomain
        throw new Error('Call within ConvexProvider context');
      },
    },

    invite: {
      async create(
        workspaceId: EntityId,
        expiresInHours: number,
        scope: 'workspace' | { type: 'channel'; channelId: EntityId },
        maxUses?: number
      ): Promise<EntityId> {
        // Delegates to api.inviteLinks.create
        throw new Error('Call within ConvexProvider context');
      },

      async getByCode(code: string): Promise<{
        id: EntityId;
        workspaceId: EntityId;
        expiresAt: number;
        scope: 'workspace' | { type: 'channel'; channelId: EntityId };
      } | null> {
        // Delegates to api.inviteLinks.getByCode
        throw new Error('Call within ConvexProvider context');
      },

      async redeem(code: string): Promise<EntityId> {
        // Delegates to api.workspaces.join with inviteCode
        throw new Error('Call within ConvexProvider context');
      },

      async list(workspaceId: EntityId): Promise<
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
      > {
        // Delegates to api.inviteLinks.list
        throw new Error('Call within ConvexProvider context');
      },

      async revoke(inviteLinkId: EntityId): Promise<void> {
        // Delegates to api.inviteLinks.revoke
        throw new Error('Call within ConvexProvider context');
      },
    },
  };

  const storage: StorageProvider = {
    async generateUploadUrl(): Promise<string> {
      // Delegates to api.upload.generateUploadUrl
      throw new Error('Call within ConvexProvider context');
    },

    async getUrl(storageId: EntityId): Promise<string | null> {
      // Delegates to ctx.storage.getUrl in Convex functions
      throw new Error('Call within ConvexProvider context');
    },

    async remove(storageId: EntityId): Promise<void> {
      // Delegates to ctx.storage.delete in Convex functions
      throw new Error('Call within ConvexProvider context');
    },
  };

  const provider: BackendProvider = {
    id: 'convex',
    name: 'Convex (Managed)',
    isManaged: true, // Convex deployments are managed

    auth,
    events,
    persistence,
    storage,

    async initialize(cfg: ProviderConfig): Promise<void> {
      config = cfg as ConvexProviderConfig;
      // Actual initialization happens in ConvexClientProvider component
      // This validates config
      if (!config.url) {
        throw new Error('Convex provider requires url in config');
      }
    },

    async destroy(): Promise<void> {
      // Cleanup handled by React component unmount
      config = null;
    },
  };

  return provider;
}

// -----------------------------------------------------------------------------
// React Integration Notes
// -----------------------------------------------------------------------------

/**
 * INTEGRATION PATTERN:
 *
 * The ConvexProvider is integrated into apps/web via React context:
 *
 * 1. ConvexClientProvider wraps the app with Convex clients
 * 2. KIIARENProvider provides the BackendProvider interface
 * 3. Feature hooks (useCreateMessage, etc.) use the provider interface
 *
 * Example migration path:
 *
 * BEFORE (direct Convex):
 * ```tsx
 * import { useMutation } from 'convex/react';
 * import { api } from '../../convex/_generated/api';
 *
 * const mutation = useMutation(api.messages.create);
 * ```
 *
 * AFTER (via provider):
 * ```tsx
 * import { useBackendProvider } from '@kiiaren/core';
 *
 * const { persistence } = useBackendProvider();
 * const createMessage = persistence.message.create;
 * ```
 *
 * The migration can be gradual - existing hooks continue to work while
 * new code uses the provider interface.
 */

export default createConvexProvider;
