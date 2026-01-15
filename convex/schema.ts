import { authTables } from '@convex-dev/auth/server';
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

const schema = defineSchema({
  ...authTables,
  workspaces: defineTable({
    name: v.string(),
    userId: v.id('users'),
    joinCode: v.string(),
    // Domain trust fields (optional for backwards compatibility)
    domainVerified: v.optional(v.boolean()),
    joinCodeEnabled: v.optional(v.boolean()),
  }),
  // Domain verification table
  domains: defineTable({
    workspaceId: v.id('workspaces'),
    domain: v.string(), // e.g., "acme.com" - stored lowercase
    verificationToken: v.string(),
    status: v.union(
      v.literal('pending'),
      v.literal('verified'),
      v.literal('failed')
    ),
    verifiedAt: v.optional(v.number()),
    createdAt: v.number(),
    createdBy: v.id('users'),
  })
    .index('by_workspace_id', ['workspaceId'])
    .index('by_domain', ['domain'])
    .index('by_workspace_domain', ['workspaceId', 'domain'])
    .index('by_verification_token', ['verificationToken']),
  // Invite links for external users (when domain is verified)
  inviteLinks: defineTable({
    workspaceId: v.id('workspaces'),
    code: v.string(), // Unique URL-safe code
    createdBy: v.id('users'),
    createdAt: v.number(),
    expiresAt: v.number(),
    maxUses: v.optional(v.number()),
    usedCount: v.number(),
    scope: v.union(
      v.object({ type: v.literal('workspace') }),
      v.object({ type: v.literal('channel'), channelId: v.id('channels') })
    ),
    revokedAt: v.optional(v.number()),
  })
    .index('by_workspace_id', ['workspaceId'])
    .index('by_code', ['code']),
  members: defineTable({
    userId: v.id('users'),
    workspaceId: v.id('workspaces'),
    role: v.union(v.literal('admin'), v.literal('member')),
  })
    .index('by_user_id', ['userId'])
    .index('by_workspace_id', ['workspaceId'])
    .index('by_workspace_id_user_id', ['workspaceId', 'userId']),
  channels: defineTable({
    name: v.string(),
    workspaceId: v.id('workspaces'),
  }).index('by_workspace_id', ['workspaceId']),
  conversations: defineTable({
    workspaceId: v.id('workspaces'),
    memberOneId: v.id('members'),
    memberTwoId: v.id('members'),
  }).index('by_workspace_id', ['workspaceId']),
  messages: defineTable({
    body: v.string(),
    image: v.optional(v.id('_storage')),
    memberId: v.id('members'),
    workspaceId: v.id('workspaces'),
    channelId: v.optional(v.id('channels')),
    parentMessageId: v.optional(v.id('messages')),
    conversationId: v.optional(v.id('conversations')),
    updatedAt: v.optional(v.number()),
  })
    .index('by_workspace_id', ['workspaceId'])
    .index('by_member_id', ['memberId'])
    .index('by_channel_id', ['channelId'])
    .index('by_conversation_id', ['conversationId'])
    .index('by_parent_message_id', ['parentMessageId'])
    .index('by_channel_id_parent_message_id_conversation_id', ['channelId', 'parentMessageId', 'conversationId']),
  reactions: defineTable({
    workspaceId: v.id('workspaces'),
    messageId: v.id('messages'),
    memberId: v.id('members'),
    value: v.string(),
  })
    .index('by_workspace_id', ['workspaceId'])
    .index('by_message_id', ['messageId'])
    .index('by_member_id', ['memberId']),
  docs: defineTable({
    title: v.string(),
    workspaceId: v.id('workspaces'),
    parentDocumentId: v.optional(v.id('docs')),
    content: v.optional(v.string()),
    coverImage: v.optional(v.id('_storage')),
    icon: v.optional(v.string()),
    isArchived: v.boolean(),
    isPublished: v.boolean(),
    createdBy: v.id('users'),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_workspace_id', ['workspaceId'])
    .index('by_workspace_id_parent', ['workspaceId', 'parentDocumentId'])
    .index('by_created_by', ['createdBy']),
  boards: defineTable({
    title: v.string(),
    workspaceId: v.id('workspaces'),
    excalidrawData: v.optional(v.string()),
    thumbnail: v.optional(v.id('_storage')),
    createdBy: v.id('users'),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_workspace_id', ['workspaceId'])
    .index('by_created_by', ['createdBy']),
});

export default schema;
