'use client';

/**
 * Convex Backend Provider Adapter
 *
 * Integrates Convex with the BackendProvider interface.
 *
 * ARCHITECTURE NOTE:
 * Convex uses React hooks (useQuery, useMutation) for reactive data.
 * The BackendProvider interface uses async functions.
 *
 * This adapter provides:
 * 1. ConvexBackendProvider - React component wrapping Convex auth
 * 2. useConvex*() hooks - Direct Convex access (current pattern)
 * 3. BackendProvider interface - For feature gating and future migration
 *
 * Current call sites continue using useQuery/useMutation directly.
 * The BackendProvider interface is available for feature gating (isManaged)
 * and gradual migration.
 */

import { type ReactNode, useMemo, useCallback, useRef } from 'react';
import { ConvexAuthNextjsProvider } from '@convex-dev/auth/nextjs';
import { ConvexReactClient, useConvexAuth, useMutation } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import type {
  BackendProvider,
  AuthProvider,
  EventsProvider,
  PersistenceProvider,
  StorageProvider,
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
} from '@kiiaren/core';
import { api } from '@/../convex/_generated/api';
import { BackendProviderContext } from './context';

// -----------------------------------------------------------------------------
// Convex Client Singleton
// -----------------------------------------------------------------------------

let convexClient: ConvexReactClient | null = null;

function getConvexClient(): ConvexReactClient {
  if (!convexClient) {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) {
      throw new Error('NEXT_PUBLIC_CONVEX_URL is required for Convex provider');
    }
    convexClient = new ConvexReactClient(url);
  }
  return convexClient;
}

// -----------------------------------------------------------------------------
// Error Helpers
// -----------------------------------------------------------------------------

const NOT_IN_REACT = (method: string): never => {
  throw new Error(
    `[ConvexProvider] ${method} must be called within React component tree. ` +
    `Use the corresponding hook instead (e.g., useQuery, useMutation).`
  );
};

// -----------------------------------------------------------------------------
// Convex Provider Implementation
// -----------------------------------------------------------------------------

/**
 * Create the Convex BackendProvider.
 *
 * Note: Most methods throw because Convex operations are hook-based.
 * This provider is primarily for:
 * 1. Feature gating via isManaged
 * 2. Provider identification
 * 3. Future migration path
 *
 * Current code should continue using Convex hooks directly.
 */
function createConvexBackendProvider(): BackendProvider {
  const auth: AuthProvider = {
    async getSession(): Promise<Session | null> {
      return NOT_IN_REACT('auth.getSession');
    },
    async getCurrentUser(): Promise<UserIdentity | null> {
      return NOT_IN_REACT('auth.getCurrentUser');
    },
    async signInWithPassword(): Promise<void> {
      return NOT_IN_REACT('auth.signInWithPassword');
    },
    async signUpWithPassword(): Promise<void> {
      return NOT_IN_REACT('auth.signUpWithPassword');
    },
    async signInWithOAuth(): Promise<void> {
      return NOT_IN_REACT('auth.signInWithOAuth');
    },
    async signOut(): Promise<void> {
      return NOT_IN_REACT('auth.signOut');
    },
    onAuthStateChange(): UnsubscribeFn {
      return NOT_IN_REACT('auth.onAuthStateChange');
    },
  };

  const events: EventsProvider = {
    subscribe(): UnsubscribeFn {
      // Convex handles real-time via query subscriptions automatically
      // No explicit subscribe needed - useQuery() is reactive
      return () => {};
    },
    async emit(): Promise<void> {
      // Events are implicit in Convex - mutations trigger query updates
    },
  };

  const persistence: PersistenceProvider = {
    workspace: {
      async create(): Promise<EntityId> { return NOT_IN_REACT('workspace.create'); },
      async get(): Promise<Workspace | null> { return NOT_IN_REACT('workspace.get'); },
      async update(): Promise<void> { return NOT_IN_REACT('workspace.update'); },
      async remove(): Promise<void> { return NOT_IN_REACT('workspace.remove'); },
      async getByUserId(): Promise<Workspace[]> { return NOT_IN_REACT('workspace.getByUserId'); },
      async join(): Promise<EntityId> { return NOT_IN_REACT('workspace.join'); },
      async regenerateJoinCode(): Promise<string> { return NOT_IN_REACT('workspace.regenerateJoinCode'); },
    },
    channel: {
      async create(): Promise<EntityId> { return NOT_IN_REACT('channel.create'); },
      async get(): Promise<Channel[]> { return NOT_IN_REACT('channel.get'); },
      async getById(): Promise<Channel | null> { return NOT_IN_REACT('channel.getById'); },
      async update(): Promise<void> { return NOT_IN_REACT('channel.update'); },
      async remove(): Promise<void> { return NOT_IN_REACT('channel.remove'); },
    },
    member: {
      async get(): Promise<Member[]> { return NOT_IN_REACT('member.get'); },
      async getById(): Promise<Member | null> { return NOT_IN_REACT('member.getById'); },
      async getCurrent(): Promise<Member | null> { return NOT_IN_REACT('member.getCurrent'); },
      async updateRole(): Promise<void> { return NOT_IN_REACT('member.updateRole'); },
      async remove(): Promise<void> { return NOT_IN_REACT('member.remove'); },
    },
    message: {
      async create(): Promise<EntityId> { return NOT_IN_REACT('message.create'); },
      async get(): Promise<PaginatedResult<Message>> { return NOT_IN_REACT('message.get'); },
      async getById(): Promise<Message | null> { return NOT_IN_REACT('message.getById'); },
      async update(): Promise<void> { return NOT_IN_REACT('message.update'); },
      async remove(): Promise<void> { return NOT_IN_REACT('message.remove'); },
    },
    reaction: {
      async toggle(): Promise<void> { return NOT_IN_REACT('reaction.toggle'); },
    },
    conversation: {
      async createOrGet(): Promise<EntityId> { return NOT_IN_REACT('conversation.createOrGet'); },
    },
    doc: {
      async create(): Promise<EntityId> { return NOT_IN_REACT('doc.create'); },
      async get(): Promise<Doc[]> { return NOT_IN_REACT('doc.get'); },
      async getById(): Promise<Doc | null> { return NOT_IN_REACT('doc.getById'); },
      async update(): Promise<void> { return NOT_IN_REACT('doc.update'); },
      async archive(): Promise<void> { return NOT_IN_REACT('doc.archive'); },
      async restore(): Promise<void> { return NOT_IN_REACT('doc.restore'); },
      async remove(): Promise<void> { return NOT_IN_REACT('doc.remove'); },
      async search(): Promise<Doc[]> { return NOT_IN_REACT('doc.search'); },
    },
    board: {
      async create(): Promise<EntityId> { return NOT_IN_REACT('board.create'); },
      async get(): Promise<Board[]> { return NOT_IN_REACT('board.get'); },
      async getById(): Promise<Board | null> { return NOT_IN_REACT('board.getById'); },
      async update(): Promise<void> { return NOT_IN_REACT('board.update'); },
      async remove(): Promise<void> { return NOT_IN_REACT('board.remove'); },
    },
    domain: {
      async add(): Promise<EntityId> { return NOT_IN_REACT('domain.add'); },
      async verify(): Promise<{ success: boolean; error?: string }> { return NOT_IN_REACT('domain.verify'); },
      async list(): Promise<Array<{ id: EntityId; domain: string; status: 'pending' | 'verified' | 'failed'; verificationToken: string; verifiedAt?: number; createdAt: number }>> { return NOT_IN_REACT('domain.list'); },
      async remove(): Promise<void> { return NOT_IN_REACT('domain.remove'); },
      async checkEmail(): Promise<{ matches: boolean; domain?: string }> { return NOT_IN_REACT('domain.checkEmail'); },
    },
    invite: {
      async create(): Promise<EntityId> { return NOT_IN_REACT('invite.create'); },
      async getByCode(): Promise<{ id: EntityId; workspaceId: EntityId; expiresAt: number; scope: 'workspace' | { type: 'channel'; channelId: EntityId } } | null> { return NOT_IN_REACT('invite.getByCode'); },
      async redeem(): Promise<EntityId> { return NOT_IN_REACT('invite.redeem'); },
      async list(): Promise<Array<{ id: EntityId; code: string; expiresAt: number; maxUses?: number; usedCount: number; scope: 'workspace' | { type: 'channel'; channelId: EntityId }; revokedAt?: number; createdAt: number }>> { return NOT_IN_REACT('invite.list'); },
      async revoke(): Promise<void> { return NOT_IN_REACT('invite.revoke'); },
    },
  };

  const storage: StorageProvider = {
    async generateUploadUrl(): Promise<string> { return NOT_IN_REACT('storage.generateUploadUrl'); },
    async getUrl(): Promise<string | null> { return NOT_IN_REACT('storage.getUrl'); },
    async remove(): Promise<void> { return NOT_IN_REACT('storage.remove'); },
  };

  return {
    id: 'convex',
    name: 'Convex (Managed)',
    isManaged: true,

    auth,
    events,
    persistence,
    storage,

    async initialize(): Promise<void> {
      // Client is initialized via getConvexClient()
    },
    async destroy(): Promise<void> {
      // Cleanup handled by React unmount
    },
  };
}

// -----------------------------------------------------------------------------
// Convex Backend Provider Component
// -----------------------------------------------------------------------------

interface ConvexBackendProviderProps {
  children: ReactNode;
}

/**
 * Convex backend provider component.
 *
 * Wraps the app with:
 * 1. ConvexAuthNextjsProvider (Convex auth + client)
 * 2. BackendProviderContext (provider interface)
 *
 * Usage in layout.tsx:
 * ```tsx
 * <ConvexBackendProvider>
 *   {children}
 * </ConvexBackendProvider>
 * ```
 */
export function ConvexBackendProvider({ children }: ConvexBackendProviderProps) {
  const client = getConvexClient();
  const provider = useMemo(() => createConvexBackendProvider(), []);

  return (
    <ConvexAuthNextjsProvider client={client}>
      <BackendProviderContext provider={provider} isReady={true} error={null}>
        {children}
      </BackendProviderContext>
    </ConvexAuthNextjsProvider>
  );
}

// -----------------------------------------------------------------------------
// Convex-Specific Hooks (for existing code)
// -----------------------------------------------------------------------------

/**
 * Get current auth state from Convex.
 *
 * This is a re-export for convenience - existing code can continue
 * using useConvexAuth() from convex/react directly.
 */
export { useConvexAuth };

/**
 * Hook for auth actions (signIn, signOut).
 */
export function useConvexAuthActions() {
  return useAuthActions();
}

/**
 * Hook for generating upload URLs.
 * Wraps the Convex mutation in a callback.
 */
export function useGenerateUploadUrl() {
  const generateUploadUrl = useMutation(api.upload.generateUploadUrl);

  const generate = useCallback(async (): Promise<string> => {
    return await generateUploadUrl();
  }, [generateUploadUrl]);

  return { generateUploadUrl: generate };
}

// -----------------------------------------------------------------------------
// Export Convex Client (for direct access if needed)
// -----------------------------------------------------------------------------

export { getConvexClient };
