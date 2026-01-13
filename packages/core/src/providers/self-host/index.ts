/**
 * Self-Host Backend Provider (Community Edition)
 *
 * Placeholder implementation for self-hosted deployments using:
 * - PostgreSQL for persistence
 * - WebSocket server for real-time events
 * - Local filesystem or S3-compatible storage
 *
 * STATUS: SKELETON ONLY
 * This provider is not yet implemented. It serves as:
 * 1. Documentation of the self-host architecture
 * 2. Type contract for future implementation
 * 3. Clear boundary between OSS and managed features
 *
 * LIMITATIONS (inherent to self-host):
 * - No managed KMS (bring your own encryption)
 * - No centralized audit logging
 * - No indexed search infrastructure
 * - No push notification service
 * - No AI agent infrastructure
 * - No SLA guarantees
 * - User responsible for backups, scaling, security
 */

import type {
  BackendProvider,
  AuthProvider,
  EventsProvider,
  PersistenceProvider,
  StorageProvider,
  ProviderConfig,
  SelfHostProviderConfig,
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
// Implementation Status
// -----------------------------------------------------------------------------

/**
 * Throws NotImplementedError for all unimplemented methods.
 * IMPORTANT: Always use `return NOT_IMPLEMENTED(...)` to ensure TypeScript
 * understands the function never completes normally.
 */
const NOT_IMPLEMENTED = (method: string): never => {
  throw new Error(
    `[SelfHostProvider] ${method} is not yet implemented. ` +
      `Self-host provider is currently a skeleton. ` +
      `Contributions welcome: https://github.com/kiiaren/kiiaren`
  );
};

// -----------------------------------------------------------------------------
// Provider Implementation
// -----------------------------------------------------------------------------

/**
 * Create self-host backend provider.
 *
 * Architecture overview:
 * - PostgreSQL: All persistence (workspaces, channels, messages, etc.)
 * - WebSocket: Real-time event distribution
 * - Local/S3: File storage
 * - JWT: Session management
 *
 * Required infrastructure:
 * - PostgreSQL 14+
 * - Node.js WebSocket server (or compatible)
 * - Storage: Local disk or S3-compatible (MinIO, etc.)
 */
export function createSelfHostProvider(): BackendProvider {
  let config: SelfHostProviderConfig | null = null;
  let initialized = false;

  // Placeholder database connection
  // In real implementation: pg.Pool from 'pg'
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let db: unknown = null;

  // Placeholder WebSocket connection
  // In real implementation: WebSocket client
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let ws: unknown = null;

  const auth: AuthProvider = {
    async getSession(): Promise<Session | null> {
      return NOT_IMPLEMENTED('auth.getSession');
      // Implementation notes:
      // - Check JWT from cookie/header
      // - Validate signature
      // - Check expiration
      // - Return session or null
    },

    async getCurrentUser(): Promise<UserIdentity | null> {
      return NOT_IMPLEMENTED('auth.getCurrentUser');
      // Implementation notes:
      // - Get session
      // - Query users table by session.userId
      // - Return UserIdentity or null
    },

    async signInWithPassword(email: string, password: string): Promise<void> {
      return NOT_IMPLEMENTED('auth.signInWithPassword');
      // Implementation notes:
      // - Query users table by email
      // - Verify password hash (argon2/bcrypt)
      // - Create session
      // - Set JWT cookie
    },

    async signUpWithPassword(
      email: string,
      password: string,
      name: string
    ): Promise<void> {
      return NOT_IMPLEMENTED('auth.signUpWithPassword');
      // Implementation notes:
      // - Validate email format
      // - Check email not already registered
      // - Hash password
      // - Insert user record
      // - Create session
    },

    async signInWithOAuth(provider: 'google' | 'github'): Promise<void> {
      return NOT_IMPLEMENTED('auth.signInWithOAuth');
      // Implementation notes:
      // - Redirect to OAuth provider
      // - Handle callback
      // - Create/update user record
      // - Create session
    },

    async signOut(): Promise<void> {
      return NOT_IMPLEMENTED('auth.signOut');
      // Implementation notes:
      // - Invalidate session in database
      // - Clear JWT cookie
    },

    onAuthStateChange(
      callback: (session: Session | null) => void
    ): UnsubscribeFn {
      return NOT_IMPLEMENTED('auth.onAuthStateChange');
      // Implementation notes:
      // - Subscribe to WebSocket auth channel
      // - Call callback on auth events
      // - Return unsubscribe function
    },
  };

  const events: EventsProvider = {
    subscribe(
      workspaceId: EntityId,
      eventTypes: KernelEvent['type'][],
      callback: (event: KernelEvent) => void
    ): UnsubscribeFn {
      return NOT_IMPLEMENTED('events.subscribe');
      // Implementation notes:
      // - Connect to WebSocket if not connected
      // - Subscribe to workspace channel
      // - Filter by event types
      // - Call callback on matching events
      // - Return unsubscribe function
    },

    async emit(event: KernelEvent): Promise<void> {
      return NOT_IMPLEMENTED('events.emit');
      // Implementation notes:
      // - Validate event structure
      // - Publish to WebSocket server
      // - Server broadcasts to workspace subscribers
    },
  };

  const persistence: PersistenceProvider = {
    workspace: {
      async create(name: string): Promise<EntityId> {
        return NOT_IMPLEMENTED('persistence.workspace.create');
        // SQL: INSERT INTO workspaces (id, name, owner_id, join_code, created_at)
        //      VALUES ($1, $2, $3, $4, NOW())
      },

      async get(id: EntityId): Promise<Workspace | null> {
        return NOT_IMPLEMENTED('persistence.workspace.get');
        // SQL: SELECT * FROM workspaces WHERE id = $1
      },

      async update(
        id: EntityId,
        data: Partial<Pick<Workspace, 'name'>>
      ): Promise<void> {
        return NOT_IMPLEMENTED('persistence.workspace.update');
        // SQL: UPDATE workspaces SET name = $2 WHERE id = $1
      },

      async remove(id: EntityId): Promise<void> {
        return NOT_IMPLEMENTED('persistence.workspace.remove');
        // SQL: DELETE FROM workspaces WHERE id = $1
        // Cascade: members, channels, messages, docs, boards
      },

      async getByUserId(userId: EntityId): Promise<Workspace[]> {
        return NOT_IMPLEMENTED('persistence.workspace.getByUserId');
        // SQL: SELECT w.* FROM workspaces w
        //      JOIN members m ON m.workspace_id = w.id
        //      WHERE m.user_id = $1
      },

      async join(joinCode: string): Promise<EntityId> {
        return NOT_IMPLEMENTED('persistence.workspace.join');
        // SQL: SELECT id FROM workspaces WHERE join_code = $1
        // Then: INSERT INTO members (workspace_id, user_id, role)
      },

      async regenerateJoinCode(id: EntityId): Promise<string> {
        return NOT_IMPLEMENTED('persistence.workspace.regenerateJoinCode');
        // SQL: UPDATE workspaces SET join_code = $2 WHERE id = $1
      },
    },

    channel: {
      async create(workspaceId: EntityId, name: string): Promise<EntityId> {
        return NOT_IMPLEMENTED('persistence.channel.create');
        // SQL: INSERT INTO channels (id, workspace_id, name, created_at)
      },

      async get(workspaceId: EntityId): Promise<Channel[]> {
        return NOT_IMPLEMENTED('persistence.channel.get');
        // SQL: SELECT * FROM channels WHERE workspace_id = $1 ORDER BY name
      },

      async getById(id: EntityId): Promise<Channel | null> {
        return NOT_IMPLEMENTED('persistence.channel.getById');
        // SQL: SELECT * FROM channels WHERE id = $1
      },

      async update(id: EntityId, name: string): Promise<void> {
        return NOT_IMPLEMENTED('persistence.channel.update');
        // SQL: UPDATE channels SET name = $2 WHERE id = $1
      },

      async remove(id: EntityId): Promise<void> {
        return NOT_IMPLEMENTED('persistence.channel.remove');
        // SQL: DELETE FROM channels WHERE id = $1
        // Cascade: messages in channel
      },
    },

    member: {
      async get(workspaceId: EntityId): Promise<Member[]> {
        return NOT_IMPLEMENTED('persistence.member.get');
        // SQL: SELECT m.*, u.name, u.image FROM members m
        //      JOIN users u ON u.id = m.user_id
        //      WHERE m.workspace_id = $1
      },

      async getById(id: EntityId): Promise<Member | null> {
        return NOT_IMPLEMENTED('persistence.member.getById');
        // SQL: SELECT m.*, u.name, u.image FROM members m
        //      JOIN users u ON u.id = m.user_id
        //      WHERE m.id = $1
      },

      async getCurrent(workspaceId: EntityId): Promise<Member | null> {
        return NOT_IMPLEMENTED('persistence.member.getCurrent');
        // SQL: SELECT m.*, u.name, u.image FROM members m
        //      JOIN users u ON u.id = m.user_id
        //      WHERE m.workspace_id = $1 AND m.user_id = $current_user_id
      },

      async updateRole(id: EntityId, role: 'admin' | 'member'): Promise<void> {
        return NOT_IMPLEMENTED('persistence.member.updateRole');
        // SQL: UPDATE members SET role = $2 WHERE id = $1
      },

      async remove(id: EntityId): Promise<void> {
        return NOT_IMPLEMENTED('persistence.member.remove');
        // SQL: DELETE FROM members WHERE id = $1
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
        return NOT_IMPLEMENTED('persistence.message.create');
        // SQL: INSERT INTO messages (id, workspace_id, channel_id, ...)
      },

      async get(
        params: {
          channelId?: EntityId;
          conversationId?: EntityId;
          parentMessageId?: EntityId;
        },
        pagination?: PaginationParams
      ): Promise<PaginatedResult<Message>> {
        return NOT_IMPLEMENTED('persistence.message.get');
        // SQL: SELECT m.*, ... FROM messages m
        //      WHERE ... ORDER BY created_at DESC
        //      LIMIT $limit OFFSET $cursor
      },

      async getById(id: EntityId): Promise<Message | null> {
        return NOT_IMPLEMENTED('persistence.message.getById');
        // SQL: SELECT m.*, ... FROM messages m WHERE m.id = $1
      },

      async update(id: EntityId, body: string): Promise<void> {
        return NOT_IMPLEMENTED('persistence.message.update');
        // SQL: UPDATE messages SET body = $2, updated_at = NOW() WHERE id = $1
      },

      async remove(id: EntityId): Promise<void> {
        return NOT_IMPLEMENTED('persistence.message.remove');
        // SQL: DELETE FROM messages WHERE id = $1
      },
    },

    reaction: {
      async toggle(messageId: EntityId, value: string): Promise<void> {
        return NOT_IMPLEMENTED('persistence.reaction.toggle');
        // SQL: Check if exists, then INSERT or DELETE
      },
    },

    conversation: {
      async createOrGet(
        workspaceId: EntityId,
        memberOneId: EntityId,
        memberTwoId: EntityId
      ): Promise<EntityId> {
        return NOT_IMPLEMENTED('persistence.conversation.createOrGet');
        // SQL: SELECT id FROM conversations
        //      WHERE workspace_id = $1 AND
        //      ((member_one_id = $2 AND member_two_id = $3) OR
        //       (member_one_id = $3 AND member_two_id = $2))
        // If not found: INSERT INTO conversations
      },
    },

    doc: {
      async create(
        workspaceId: EntityId,
        title: string,
        parentDocumentId?: EntityId
      ): Promise<EntityId> {
        return NOT_IMPLEMENTED('persistence.doc.create');
        // SQL: INSERT INTO docs (id, workspace_id, title, parent_document_id, ...)
      },

      async get(
        workspaceId: EntityId,
        parentDocumentId?: EntityId
      ): Promise<Doc[]> {
        return NOT_IMPLEMENTED('persistence.doc.get');
        // SQL: SELECT * FROM docs WHERE workspace_id = $1
        //      AND parent_document_id IS NOT DISTINCT FROM $2
        //      AND is_archived = false
      },

      async getById(id: EntityId): Promise<Doc | null> {
        return NOT_IMPLEMENTED('persistence.doc.getById');
        // SQL: SELECT * FROM docs WHERE id = $1
      },

      async update(
        id: EntityId,
        data: Partial<Pick<Doc, 'title' | 'content' | 'icon' | 'isPublished'>>
      ): Promise<void> {
        return NOT_IMPLEMENTED('persistence.doc.update');
        // SQL: UPDATE docs SET ... WHERE id = $1
      },

      async archive(id: EntityId): Promise<void> {
        return NOT_IMPLEMENTED('persistence.doc.archive');
        // SQL: UPDATE docs SET is_archived = true WHERE id = $1
        // Recursive: UPDATE docs SET is_archived = true WHERE parent_document_id = $1
      },

      async restore(id: EntityId): Promise<void> {
        return NOT_IMPLEMENTED('persistence.doc.restore');
        // SQL: UPDATE docs SET is_archived = false WHERE id = $1
      },

      async remove(id: EntityId): Promise<void> {
        return NOT_IMPLEMENTED('persistence.doc.remove');
        // SQL: DELETE FROM docs WHERE id = $1
        // Recursive: Handle children
      },

      async search(workspaceId: EntityId, query: string): Promise<Doc[]> {
        return NOT_IMPLEMENTED('persistence.doc.search');
        // SQL: SELECT * FROM docs WHERE workspace_id = $1
        //      AND (title ILIKE $2 OR content ILIKE $2)
        // Note: Basic LIKE search only. Indexed search requires managed tier.
      },
    },

    board: {
      async create(workspaceId: EntityId, title: string): Promise<EntityId> {
        return NOT_IMPLEMENTED('persistence.board.create');
        // SQL: INSERT INTO boards (id, workspace_id, title, ...)
      },

      async get(workspaceId: EntityId): Promise<Board[]> {
        return NOT_IMPLEMENTED('persistence.board.get');
        // SQL: SELECT * FROM boards WHERE workspace_id = $1
      },

      async getById(id: EntityId): Promise<Board | null> {
        return NOT_IMPLEMENTED('persistence.board.getById');
        // SQL: SELECT * FROM boards WHERE id = $1
      },

      async update(
        id: EntityId,
        data: Partial<Pick<Board, 'title' | 'excalidrawData'>>
      ): Promise<void> {
        return NOT_IMPLEMENTED('persistence.board.update');
        // SQL: UPDATE boards SET ... WHERE id = $1
      },

      async remove(id: EntityId): Promise<void> {
        return NOT_IMPLEMENTED('persistence.board.remove');
        // SQL: DELETE FROM boards WHERE id = $1
      },
    },

    domain: {
      async add(workspaceId: EntityId, domain: string): Promise<EntityId> {
        return NOT_IMPLEMENTED('persistence.domain.add');
        // SQL: INSERT INTO domains (id, workspace_id, domain, verification_token, status, ...)
      },

      async verify(
        domainId: EntityId
      ): Promise<{ success: boolean; error?: string }> {
        return NOT_IMPLEMENTED('persistence.domain.verify');
        // DNS TXT lookup and status update
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
        return NOT_IMPLEMENTED('persistence.domain.list');
        // SQL: SELECT * FROM domains WHERE workspace_id = $1
      },

      async remove(domainId: EntityId): Promise<void> {
        return NOT_IMPLEMENTED('persistence.domain.remove');
        // SQL: DELETE FROM domains WHERE id = $1
      },

      async checkEmail(
        workspaceId: EntityId,
        email: string
      ): Promise<{ matches: boolean; domain?: string }> {
        return NOT_IMPLEMENTED('persistence.domain.checkEmail');
        // SQL: SELECT * FROM domains WHERE workspace_id = $1 AND domain = $email_domain AND status = 'verified'
      },
    },

    invite: {
      async create(
        workspaceId: EntityId,
        expiresInHours: number,
        scope: 'workspace' | { type: 'channel'; channelId: EntityId },
        maxUses?: number
      ): Promise<EntityId> {
        return NOT_IMPLEMENTED('persistence.invite.create');
        // SQL: INSERT INTO invite_links (id, workspace_id, code, expires_at, ...)
      },

      async getByCode(code: string): Promise<{
        id: EntityId;
        workspaceId: EntityId;
        expiresAt: number;
        scope: 'workspace' | { type: 'channel'; channelId: EntityId };
      } | null> {
        return NOT_IMPLEMENTED('persistence.invite.getByCode');
        // SQL: SELECT * FROM invite_links WHERE code = $1 AND expires_at > NOW() AND revoked_at IS NULL
      },

      async redeem(code: string): Promise<EntityId> {
        return NOT_IMPLEMENTED('persistence.invite.redeem');
        // Transaction: Validate invite, increment used_count, create member
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
        return NOT_IMPLEMENTED('persistence.invite.list');
        // SQL: SELECT * FROM invite_links WHERE workspace_id = $1
      },

      async revoke(inviteLinkId: EntityId): Promise<void> {
        return NOT_IMPLEMENTED('persistence.invite.revoke');
        // SQL: UPDATE invite_links SET revoked_at = NOW() WHERE id = $1
      },
    },
  };

  const storage: StorageProvider = {
    async generateUploadUrl(): Promise<string> {
      return NOT_IMPLEMENTED('storage.generateUploadUrl');
      // Implementation depends on storageProvider config:
      // - s3: Generate presigned PUT URL
      // - local: Return internal upload endpoint
    },

    async getUrl(storageId: EntityId): Promise<string | null> {
      return NOT_IMPLEMENTED('storage.getUrl');
      // Implementation depends on storageProvider config:
      // - s3: Generate presigned GET URL
      // - local: Return static file URL
    },

    async remove(storageId: EntityId): Promise<void> {
      return NOT_IMPLEMENTED('storage.remove');
      // Implementation depends on storageProvider config:
      // - s3: Delete object
      // - local: Delete file from disk
    },
  };

  const provider: BackendProvider = {
    id: 'self-host',
    name: 'Self-Hosted (Community)',
    isManaged: false, // Self-host is NOT managed

    auth,
    events,
    persistence,
    storage,

    async initialize(cfg: ProviderConfig): Promise<void> {
      config = cfg as SelfHostProviderConfig;

      // Validate required config
      if (!config.databaseUrl) {
        throw new Error('Self-host provider requires databaseUrl in config');
      }
      if (!config.websocketUrl) {
        throw new Error('Self-host provider requires websocketUrl in config');
      }
      if (!config.storageProvider) {
        throw new Error('Self-host provider requires storageProvider in config');
      }

      // In real implementation:
      // 1. Connect to PostgreSQL
      // 2. Run migrations if needed
      // 3. Connect to WebSocket server
      // 4. Initialize storage client

      initialized = true;
      console.log('[SelfHostProvider] Initialized (skeleton)');
    },

    async destroy(): Promise<void> {
      // In real implementation:
      // 1. Close database connection pool
      // 2. Close WebSocket connection
      // 3. Cleanup storage client

      initialized = false;
      config = null;
      db = null;
      ws = null;
    },
  };

  return provider;
}

// -----------------------------------------------------------------------------
// Database Schema (PostgreSQL)
// -----------------------------------------------------------------------------

/**
 * PostgreSQL Schema for Self-Hosted KIIAREN
 *
 * Run these migrations to set up the database:
 *
 * ```sql
 * -- Enable UUID extension
 * CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
 *
 * -- Users table
 * CREATE TABLE users (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   email VARCHAR(255) UNIQUE NOT NULL,
 *   name VARCHAR(255),
 *   image TEXT,
 *   password_hash TEXT,
 *   oauth_provider VARCHAR(50),
 *   oauth_id VARCHAR(255),
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 *
 * -- Sessions table
 * CREATE TABLE sessions (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 *   token TEXT NOT NULL UNIQUE,
 *   expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 *
 * -- Workspaces table
 * CREATE TABLE workspaces (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   name VARCHAR(255) NOT NULL,
 *   owner_id UUID NOT NULL REFERENCES users(id),
 *   join_code VARCHAR(6) NOT NULL UNIQUE,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 *
 * -- Members table
 * CREATE TABLE members (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 *   workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
 *   role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *   UNIQUE(user_id, workspace_id)
 * );
 *
 * -- Channels table
 * CREATE TABLE channels (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
 *   name VARCHAR(255) NOT NULL,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 *
 * -- Conversations table
 * CREATE TABLE conversations (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
 *   member_one_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
 *   member_two_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *   UNIQUE(workspace_id, member_one_id, member_two_id)
 * );
 *
 * -- Messages table
 * CREATE TABLE messages (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
 *   channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
 *   conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
 *   parent_message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
 *   member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
 *   body TEXT NOT NULL,
 *   image_id UUID,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *   updated_at TIMESTAMP WITH TIME ZONE
 * );
 *
 * -- Reactions table
 * CREATE TABLE reactions (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
 *   message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
 *   member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
 *   value VARCHAR(50) NOT NULL,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *   UNIQUE(message_id, member_id, value)
 * );
 *
 * -- Docs table
 * CREATE TABLE docs (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
 *   parent_document_id UUID REFERENCES docs(id) ON DELETE CASCADE,
 *   title VARCHAR(255) NOT NULL,
 *   content TEXT,
 *   cover_image_id UUID,
 *   icon VARCHAR(50),
 *   is_archived BOOLEAN DEFAULT FALSE,
 *   is_published BOOLEAN DEFAULT FALSE,
 *   created_by UUID NOT NULL REFERENCES users(id),
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 *
 * -- Boards table
 * CREATE TABLE boards (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
 *   title VARCHAR(255) NOT NULL,
 *   excalidraw_data TEXT,
 *   thumbnail_id UUID,
 *   created_by UUID NOT NULL REFERENCES users(id),
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 *
 * -- Storage table (for local storage provider)
 * CREATE TABLE storage (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   filename VARCHAR(255) NOT NULL,
 *   mime_type VARCHAR(100) NOT NULL,
 *   size_bytes BIGINT NOT NULL,
 *   path TEXT NOT NULL,
 *   uploaded_by UUID REFERENCES users(id),
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 *
 * -- Indexes
 * CREATE INDEX idx_members_workspace ON members(workspace_id);
 * CREATE INDEX idx_members_user ON members(user_id);
 * CREATE INDEX idx_channels_workspace ON channels(workspace_id);
 * CREATE INDEX idx_messages_channel ON messages(channel_id);
 * CREATE INDEX idx_messages_conversation ON messages(conversation_id);
 * CREATE INDEX idx_messages_parent ON messages(parent_message_id);
 * CREATE INDEX idx_reactions_message ON reactions(message_id);
 * CREATE INDEX idx_docs_workspace ON docs(workspace_id);
 * CREATE INDEX idx_docs_parent ON docs(parent_document_id);
 * CREATE INDEX idx_boards_workspace ON boards(workspace_id);
 * ```
 */

export default createSelfHostProvider;
