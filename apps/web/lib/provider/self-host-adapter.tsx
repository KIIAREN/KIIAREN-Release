'use client';

/**
 * Self-Host Backend Provider Adapter (SKELETON)
 *
 * This adapter is a placeholder for self-hosted deployments using
 * PostgreSQL + WebSocket. It is NOT implemented.
 *
 * STATUS: Compiles but throws on all operations.
 *
 * To implement self-hosting:
 * 1. Implement PostgreSQL persistence layer
 * 2. Implement WebSocket real-time layer
 * 3. Implement local/S3 storage layer
 * 4. Replace the NOT_IMPLEMENTED errors with real implementations
 */

import { type ReactNode, useMemo } from 'react';
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
} from '@kiiaren/core';
import { BackendProviderContext } from './context';

// -----------------------------------------------------------------------------
// Error Helper
// -----------------------------------------------------------------------------

const NOT_IMPLEMENTED = (method: string): never => {
  throw new Error(
    `[SelfHostProvider] ${method} is not implemented. ` +
    `Self-host provider is a skeleton. See docs/EDITIONING.md for status.`
  );
};

// -----------------------------------------------------------------------------
// Self-Host Provider Implementation
// -----------------------------------------------------------------------------

function createSelfHostBackendProvider(): BackendProvider {
  const auth: AuthProvider = {
    async getSession(): Promise<Session | null> { return NOT_IMPLEMENTED('auth.getSession'); },
    async getCurrentUser(): Promise<UserIdentity | null> { return NOT_IMPLEMENTED('auth.getCurrentUser'); },
    async signInWithPassword(): Promise<void> { return NOT_IMPLEMENTED('auth.signInWithPassword'); },
    async signUpWithPassword(): Promise<void> { return NOT_IMPLEMENTED('auth.signUpWithPassword'); },
    async signInWithOAuth(): Promise<void> { return NOT_IMPLEMENTED('auth.signInWithOAuth'); },
    async signOut(): Promise<void> { return NOT_IMPLEMENTED('auth.signOut'); },
    onAuthStateChange(): UnsubscribeFn { return NOT_IMPLEMENTED('auth.onAuthStateChange'); },
  };

  const events: EventsProvider = {
    subscribe(): UnsubscribeFn { return NOT_IMPLEMENTED('events.subscribe'); },
    async emit(): Promise<void> { return NOT_IMPLEMENTED('events.emit'); },
  };

  const persistence: PersistenceProvider = {
    workspace: {
      async create(): Promise<EntityId> { return NOT_IMPLEMENTED('workspace.create'); },
      async get(): Promise<Workspace | null> { return NOT_IMPLEMENTED('workspace.get'); },
      async update(): Promise<void> { return NOT_IMPLEMENTED('workspace.update'); },
      async remove(): Promise<void> { return NOT_IMPLEMENTED('workspace.remove'); },
      async getByUserId(): Promise<Workspace[]> { return NOT_IMPLEMENTED('workspace.getByUserId'); },
      async join(): Promise<EntityId> { return NOT_IMPLEMENTED('workspace.join'); },
      async regenerateJoinCode(): Promise<string> { return NOT_IMPLEMENTED('workspace.regenerateJoinCode'); },
    },
    channel: {
      async create(): Promise<EntityId> { return NOT_IMPLEMENTED('channel.create'); },
      async get(): Promise<Channel[]> { return NOT_IMPLEMENTED('channel.get'); },
      async getById(): Promise<Channel | null> { return NOT_IMPLEMENTED('channel.getById'); },
      async update(): Promise<void> { return NOT_IMPLEMENTED('channel.update'); },
      async remove(): Promise<void> { return NOT_IMPLEMENTED('channel.remove'); },
    },
    member: {
      async get(): Promise<Member[]> { return NOT_IMPLEMENTED('member.get'); },
      async getById(): Promise<Member | null> { return NOT_IMPLEMENTED('member.getById'); },
      async getCurrent(): Promise<Member | null> { return NOT_IMPLEMENTED('member.getCurrent'); },
      async updateRole(): Promise<void> { return NOT_IMPLEMENTED('member.updateRole'); },
      async remove(): Promise<void> { return NOT_IMPLEMENTED('member.remove'); },
    },
    message: {
      async create(): Promise<EntityId> { return NOT_IMPLEMENTED('message.create'); },
      async get(): Promise<PaginatedResult<Message>> { return NOT_IMPLEMENTED('message.get'); },
      async getById(): Promise<Message | null> { return NOT_IMPLEMENTED('message.getById'); },
      async update(): Promise<void> { return NOT_IMPLEMENTED('message.update'); },
      async remove(): Promise<void> { return NOT_IMPLEMENTED('message.remove'); },
    },
    reaction: {
      async toggle(): Promise<void> { return NOT_IMPLEMENTED('reaction.toggle'); },
    },
    conversation: {
      async createOrGet(): Promise<EntityId> { return NOT_IMPLEMENTED('conversation.createOrGet'); },
    },
    doc: {
      async create(): Promise<EntityId> { return NOT_IMPLEMENTED('doc.create'); },
      async get(): Promise<Doc[]> { return NOT_IMPLEMENTED('doc.get'); },
      async getById(): Promise<Doc | null> { return NOT_IMPLEMENTED('doc.getById'); },
      async update(): Promise<void> { return NOT_IMPLEMENTED('doc.update'); },
      async archive(): Promise<void> { return NOT_IMPLEMENTED('doc.archive'); },
      async restore(): Promise<void> { return NOT_IMPLEMENTED('doc.restore'); },
      async remove(): Promise<void> { return NOT_IMPLEMENTED('doc.remove'); },
      async search(): Promise<Doc[]> { return NOT_IMPLEMENTED('doc.search'); },
    },
    board: {
      async create(): Promise<EntityId> { return NOT_IMPLEMENTED('board.create'); },
      async get(): Promise<Board[]> { return NOT_IMPLEMENTED('board.get'); },
      async getById(): Promise<Board | null> { return NOT_IMPLEMENTED('board.getById'); },
      async update(): Promise<void> { return NOT_IMPLEMENTED('board.update'); },
      async remove(): Promise<void> { return NOT_IMPLEMENTED('board.remove'); },
    },
    domain: {
      async add(): Promise<EntityId> { return NOT_IMPLEMENTED('domain.add'); },
      async verify(): Promise<{ success: boolean; error?: string }> { return NOT_IMPLEMENTED('domain.verify'); },
      async list(): Promise<Array<{ id: EntityId; domain: string; status: 'pending' | 'verified' | 'failed'; verificationToken: string; verifiedAt?: number; createdAt: number }>> { return NOT_IMPLEMENTED('domain.list'); },
      async remove(): Promise<void> { return NOT_IMPLEMENTED('domain.remove'); },
      async checkEmail(): Promise<{ matches: boolean; domain?: string }> { return NOT_IMPLEMENTED('domain.checkEmail'); },
    },
    invite: {
      async create(): Promise<EntityId> { return NOT_IMPLEMENTED('invite.create'); },
      async getByCode(): Promise<{ id: EntityId; workspaceId: EntityId; expiresAt: number; scope: 'workspace' | { type: 'channel'; channelId: EntityId } } | null> { return NOT_IMPLEMENTED('invite.getByCode'); },
      async redeem(): Promise<EntityId> { return NOT_IMPLEMENTED('invite.redeem'); },
      async list(): Promise<Array<{ id: EntityId; code: string; expiresAt: number; maxUses?: number; usedCount: number; scope: 'workspace' | { type: 'channel'; channelId: EntityId }; revokedAt?: number; createdAt: number }>> { return NOT_IMPLEMENTED('invite.list'); },
      async revoke(): Promise<void> { return NOT_IMPLEMENTED('invite.revoke'); },
    },
  };

  const storage: StorageProvider = {
    async generateUploadUrl(): Promise<string> { return NOT_IMPLEMENTED('storage.generateUploadUrl'); },
    async getUrl(): Promise<string | null> { return NOT_IMPLEMENTED('storage.getUrl'); },
    async remove(): Promise<void> { return NOT_IMPLEMENTED('storage.remove'); },
  };

  return {
    id: 'self-host',
    name: 'Self-Hosted (Community)',
    isManaged: false, // Self-host is NOT managed

    auth,
    events,
    persistence,
    storage,

    async initialize(): Promise<void> {
      console.warn(
        '[SelfHostProvider] Self-host provider is not implemented. ' +
        'The application will not function. Use Convex provider instead.'
      );
    },
    async destroy(): Promise<void> {
      // No cleanup needed for skeleton
    },
  };
}

// -----------------------------------------------------------------------------
// Self-Host Backend Provider Component
// -----------------------------------------------------------------------------

interface SelfHostBackendProviderProps {
  children: ReactNode;
}

/**
 * Self-host backend provider component.
 *
 * WARNING: This is a skeleton implementation.
 * Using this provider will result in runtime errors for all operations.
 */
export function SelfHostBackendProvider({ children }: SelfHostBackendProviderProps) {
  const provider = useMemo(() => createSelfHostBackendProvider(), []);

  // Show warning in development
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      '[KIIAREN] Self-host provider selected but not implemented. ' +
      'Set NEXT_PUBLIC_KIIAREN_PROVIDER=convex to use Convex.'
    );
  }

  return (
    <BackendProviderContext
      provider={provider}
      isReady={false}
      error={new Error('Self-host provider is not implemented')}
    >
      {children}
    </BackendProviderContext>
  );
}
