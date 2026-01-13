import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';

import { mutation, query } from './_generated/server';

const generateCode = () => {
  const code = Array.from({ length: 6 }, () => '0123456789abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 36)]).join('');

  return code;
};

/**
 * Join a workspace
 *
 * Trust hierarchy:
 * 1. Domain-based auto-join (if workspace has verified domain and user email matches)
 * 2. Invite link (for external users when domain is verified)
 * 3. Join code (only if domain is NOT verified)
 */
export const join = mutation({
  args: {
    joinCode: v.optional(v.string()),
    inviteCode: v.optional(v.string()),
    workspaceId: v.id('workspaces'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Unauthorized.');

    const user = await ctx.db.get(userId);
    if (!user) throw new Error('User not found.');

    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) throw new Error('Workspace not found.');

    // Check if already a member
    const existingMember = await ctx.db
      .query('members')
      .withIndex('by_workspace_id_user_id', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('userId', userId)
      )
      .unique();

    if (existingMember) throw new Error('Already a member of this workspace.');

    // Check if workspace has domain verification enabled
    const domainVerified = workspace.domainVerified ?? false;

    if (domainVerified) {
      // DOMAIN TRUST PATH
      // Check if user's email domain matches a verified domain
      const userEmail = user.email;
      if (userEmail) {
        const emailDomain = userEmail.toLowerCase().split('@')[1];
        if (emailDomain) {
          const verifiedDomain = await ctx.db
            .query('domains')
            .withIndex('by_workspace_domain', (q) =>
              q.eq('workspaceId', args.workspaceId).eq('domain', emailDomain)
            )
            .filter((q) => q.eq(q.field('status'), 'verified'))
            .first();

          if (verifiedDomain) {
            // Auto-join: email domain matches verified workspace domain
            await ctx.db.insert('members', {
              userId,
              workspaceId: workspace._id,
              role: 'member',
            });
            return workspace._id;
          }
        }
      }

      // Email doesn't match verified domain - require invite link
      if (!args.inviteCode) {
        throw new Error(
          'This workspace requires an invite link to join. ' +
            'Contact a workspace admin to get an invite.'
        );
      }

      // Validate and redeem invite link
      // Note: args.inviteCode is guaranteed to be defined here due to the check above
      const inviteCode = args.inviteCode!;
      const invite = await ctx.db
        .query('inviteLinks')
        .withIndex('by_code', (q) => q.eq('code', inviteCode))
        .first();

      if (!invite) throw new Error('Invalid invite link.');
      if (invite.workspaceId !== args.workspaceId)
        throw new Error('Invalid invite link for this workspace.');
      if (invite.expiresAt < Date.now()) throw new Error('Invite link has expired.');
      if (invite.revokedAt) throw new Error('Invite link has been revoked.');
      if (invite.maxUses && invite.usedCount >= invite.maxUses) {
        throw new Error('Invite link has reached maximum uses.');
      }

      // Increment use count
      await ctx.db.patch(invite._id, { usedCount: invite.usedCount + 1 });

      // Create member
      await ctx.db.insert('members', {
        userId,
        workspaceId: workspace._id,
        role: 'member',
      });

      return workspace._id;
    }

    // NO DOMAIN VERIFICATION - use join code (original behavior)
    const joinCodeEnabled = workspace.joinCodeEnabled ?? true;
    if (!joinCodeEnabled) {
      throw new Error('Join codes are disabled for this workspace.');
    }

    if (!args.joinCode) {
      throw new Error('Join code is required.');
    }

    if (workspace.joinCode !== args.joinCode.toLowerCase()) {
      throw new Error('Invalid join code.');
    }

    await ctx.db.insert('members', {
      userId,
      workspaceId: workspace._id,
      role: 'member',
    });

    return workspace._id;
  },
});

export const newJoinCode = mutation({
  args: {
    workspaceId: v.id('workspaces'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) throw new Error('Unauthorized.');

    const member = await ctx.db
      .query('members')
      .withIndex('by_workspace_id_user_id', (q) => q.eq('workspaceId', args.workspaceId).eq('userId', userId))
      .unique();

    if (!member || member.role !== 'admin') throw new Error('Unauthorized.');

    const joinCode = generateCode();

    await ctx.db.patch(args.workspaceId, {
      joinCode,
    });

    return args.workspaceId;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) throw new Error('Unauthorized.');

    if (args.name.length < 3 || args.name.length > 20) throw new Error('Invalid workspace name.');

    const joinCode = generateCode();

    const workspaceId = await ctx.db.insert('workspaces', {
      name: args.name,
      userId,
      joinCode,
    });

    await ctx.db.insert('members', {
      userId,
      workspaceId,
      role: 'admin',
    });

    await ctx.db.insert('channels', {
      name: 'general',
      workspaceId,
    });

    return workspaceId;
  },
});

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) return [];

    const members = await ctx.db
      .query('members')
      .withIndex('by_user_id', (q) => q.eq('userId', userId))
      .collect();

    const workspaceIds = members.map((member) => member.workspaceId);

    const workspaces = [];

    for (const workspaceId of workspaceIds) {
      const workspace = await ctx.db.get(workspaceId);

      if (workspace) {
        workspaces.push(workspace);
      }
    }

    return workspaces;
  },
});

export const getInfoById = query({
  args: { id: v.id('workspaces') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) return null;

    const member = await ctx.db
      .query('members')
      .withIndex('by_workspace_id_user_id', (q) => q.eq('workspaceId', args.id).eq('userId', userId))
      .unique();

    const workspace = await ctx.db.get(args.id);

    if (!workspace) return null;

    return {
      name: workspace?.name,
      isMember: !!member,
      role: member?.role,
    };
  },
});

export const getById = query({
  args: { id: v.id('workspaces') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) return null;

    const member = await ctx.db
      .query('members')
      .withIndex('by_workspace_id_user_id', (q) => q.eq('workspaceId', args.id).eq('userId', userId))
      .unique();

    if (!member) return null;

    return await ctx.db.get(args.id);
  },
});

export const update = mutation({
  args: {
    id: v.id('workspaces'),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) throw new Error('Unauthorized.');

    const member = await ctx.db
      .query('members')
      .withIndex('by_workspace_id_user_id', (q) => q.eq('workspaceId', args.id).eq('userId', userId))
      .unique();

    if (!member || member.role !== 'admin') throw new Error('Unauthorized.');

    if (args.name.length < 3 || args.name.length > 20) throw new Error('Invalid workspace name.');

    await ctx.db.patch(args.id, {
      name: args.name,
    });

    return args.id;
  },
});

export const remove = mutation({
  args: {
    id: v.id('workspaces'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) throw new Error('Unauthorized.');

    const member = await ctx.db
      .query('members')
      .withIndex('by_workspace_id_user_id', (q) => q.eq('workspaceId', args.id).eq('userId', userId))
      .unique();

    if (!member || member.role !== 'admin') throw new Error('Unauthorized.');

    const [members, channels, conversations, messages, reactions] = await Promise.all([
      ctx.db
        .query('members')
        .withIndex('by_workspace_id', (q) => q.eq('workspaceId', args.id))
        .collect(),
      ctx.db
        .query('channels')
        .withIndex('by_workspace_id', (q) => q.eq('workspaceId', args.id))
        .collect(),
      ctx.db
        .query('conversations')
        .withIndex('by_workspace_id', (q) => q.eq('workspaceId', args.id))
        .collect(),
      ctx.db
        .query('messages')
        .withIndex('by_workspace_id', (q) => q.eq('workspaceId', args.id))
        .collect(),
      ctx.db
        .query('reactions')
        .withIndex('by_workspace_id', (q) => q.eq('workspaceId', args.id))
        .collect(),
    ]);

    for (const member of members) await ctx.db.delete(member._id);
    for (const channel of channels) await ctx.db.delete(channel._id);
    for (const conversation of conversations) await ctx.db.delete(conversation._id);
    for (const message of messages) await ctx.db.delete(message._id);
    for (const reaction of reactions) await ctx.db.delete(reaction._id);

    await ctx.db.delete(args.id);

    return args.id;
  },
});
