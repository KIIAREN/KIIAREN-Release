/**
 * Invite Link Mutations
 *
 * Admin-issued invite links for external users when workspace has domain verification.
 *
 * Features:
 * - Time-limited (expiresAt)
 * - Usage-limited (optional maxUses)
 * - Revocable
 * - Scoped (workspace or channel)
 */

import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { requireWorkspaceAdmin, requireAuth } from './lib/access_control';
import {
  generateInviteCode,
  MAX_COLLISION_RETRIES,
  TokenCollisionError,
} from './lib/tokens';

/**
 * Create an invite link
 *
 * Admin-only operation.
 */
export const create = mutation({
  args: {
    workspaceId: v.id('workspaces'),
    expiresInHours: v.number(),
    scope: v.union(
      v.object({ type: v.literal('workspace') }),
      v.object({ type: v.literal('channel'), channelId: v.id('channels') })
    ),
    maxUses: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Require admin
    await requireWorkspaceAdmin(ctx, args.workspaceId);

    // Validate expiry
    if (args.expiresInHours < 1 || args.expiresInHours > 720) {
      // 1 hour to 30 days
      throw new Error('Expiry must be between 1 and 720 hours (30 days).');
    }

    // Validate max uses
    if (args.maxUses !== undefined && args.maxUses < 1) {
      throw new Error('Max uses must be at least 1.');
    }

    // If scope is channel, verify channel belongs to workspace
    if (args.scope.type === 'channel') {
      const channel = await ctx.db.get(args.scope.channelId);
      if (!channel || channel.workspaceId !== args.workspaceId) {
        throw new Error('Channel not found in this workspace.');
      }
    }

    const userId = await requireAuth(ctx);

    // Generate unique code with collision retry
    let code: string | null = null;
    for (let attempt = 0; attempt < MAX_COLLISION_RETRIES; attempt++) {
      const candidate = generateInviteCode();
      const existing = await ctx.db
        .query('inviteLinks')
        .withIndex('by_code', (q) => q.eq('code', candidate))
        .first();
      if (!existing) {
        code = candidate;
        break;
      }
    }

    if (!code) {
      throw new TokenCollisionError('invite code');
    }

    const now = Date.now();
    const expiresAt = now + args.expiresInHours * 60 * 60 * 1000;

    const inviteLinkId = await ctx.db.insert('inviteLinks', {
      workspaceId: args.workspaceId,
      code,
      createdBy: userId,
      createdAt: now,
      expiresAt,
      maxUses: args.maxUses,
      usedCount: 0,
      scope: args.scope,
    });

    return { id: inviteLinkId, code };
  },
});

/**
 * Get invite link by code (public)
 *
 * Returns null if not found, expired, or revoked.
 */
export const getByCode = query({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const invite = await ctx.db
      .query('inviteLinks')
      .withIndex('by_code', (q) => q.eq('code', args.code))
      .first();

    if (!invite) return null;

    // Check if expired
    if (invite.expiresAt < Date.now()) return null;

    // Check if revoked
    if (invite.revokedAt) return null;

    // Check if at max uses
    if (invite.maxUses && invite.usedCount >= invite.maxUses) return null;

    // Get workspace name for display
    const workspace = await ctx.db.get(invite.workspaceId);
    if (!workspace) return null;

    return {
      id: invite._id,
      workspaceId: invite.workspaceId,
      workspaceName: workspace.name,
      expiresAt: invite.expiresAt,
      scope: invite.scope,
    };
  },
});

/**
 * List all invite links for a workspace
 *
 * Admin-only operation.
 */
export const list = query({
  args: {
    workspaceId: v.id('workspaces'),
  },
  handler: async (ctx, args) => {
    // Require admin
    await requireWorkspaceAdmin(ctx, args.workspaceId);

    const invites = await ctx.db
      .query('inviteLinks')
      .withIndex('by_workspace_id', (q) => q.eq('workspaceId', args.workspaceId))
      .collect();

    // Get creator names
    const invitesWithCreators = await Promise.all(
      invites.map(async (invite) => {
        const creator = await ctx.db.get(invite.createdBy);
        return {
          id: invite._id,
          code: invite.code,
          createdBy: {
            id: invite.createdBy,
            name: creator?.name ?? 'Unknown',
          },
          createdAt: invite.createdAt,
          expiresAt: invite.expiresAt,
          maxUses: invite.maxUses,
          usedCount: invite.usedCount,
          scope: invite.scope,
          revokedAt: invite.revokedAt,
          // Computed status
          status: invite.revokedAt
            ? 'revoked'
            : invite.expiresAt < Date.now()
              ? 'expired'
              : invite.maxUses && invite.usedCount >= invite.maxUses
                ? 'exhausted'
                : 'active',
        };
      })
    );

    return invitesWithCreators;
  },
});

/**
 * Revoke an invite link
 *
 * Admin-only operation.
 */
export const revoke = mutation({
  args: {
    inviteLinkId: v.id('inviteLinks'),
  },
  handler: async (ctx, args) => {
    const invite = await ctx.db.get(args.inviteLinkId);
    if (!invite) {
      throw new Error('Invite link not found.');
    }

    // Require admin of the workspace
    await requireWorkspaceAdmin(ctx, invite.workspaceId);

    // Already revoked
    if (invite.revokedAt) {
      throw new Error('Invite link is already revoked.');
    }

    await ctx.db.patch(args.inviteLinkId, {
      revokedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Redeem an invite link
 *
 * Authenticated operation. Creates member record.
 * Note: Actual redemption logic is in workspaces.join mutation.
 * This query is for pre-validation only.
 */
export const validateForRedemption = query({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const invite = await ctx.db
      .query('inviteLinks')
      .withIndex('by_code', (q) => q.eq('code', args.code))
      .first();

    if (!invite) {
      return { valid: false, error: 'Invite link not found.' };
    }

    if (invite.expiresAt < Date.now()) {
      return { valid: false, error: 'Invite link has expired.' };
    }

    if (invite.revokedAt) {
      return { valid: false, error: 'Invite link has been revoked.' };
    }

    if (invite.maxUses && invite.usedCount >= invite.maxUses) {
      return { valid: false, error: 'Invite link has reached maximum uses.' };
    }

    const workspace = await ctx.db.get(invite.workspaceId);
    if (!workspace) {
      return { valid: false, error: 'Workspace not found.' };
    }

    return {
      valid: true,
      workspaceId: invite.workspaceId,
      workspaceName: workspace.name,
      scope: invite.scope,
    };
  },
});
