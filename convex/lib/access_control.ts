/**
 * Access control utilities for workspace-based features
 * Provides reusable helpers for verifying workspace membership
 */

import { getAuthUserId } from '@convex-dev/auth/server';
import type { QueryCtx, MutationCtx } from '../_generated/server';
import type { Id } from '../_generated/dataModel';

type Context = QueryCtx | MutationCtx;

/**
 * Get the current authenticated user ID
 * Throws if not authenticated
 */
export async function requireAuth(ctx: Context): Promise<Id<'users'>> {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error('Unauthorized. Please sign in.');
  }
  return userId;
}

/**
 * Get the current authenticated user ID (returns null if not authenticated)
 */
export async function getAuth(ctx: Context): Promise<Id<'users'> | null> {
  return await getAuthUserId(ctx);
}

/**
 * Verify that the current user is a member of the specified workspace
 * Returns the member record if valid, throws if not a member
 */
export async function requireWorkspaceMember(ctx: Context, workspaceId: Id<'workspaces'>) {
  const userId = await requireAuth(ctx);

  const member = await ctx.db
    .query('members')
    .withIndex('by_workspace_id_user_id', (q) => q.eq('workspaceId', workspaceId).eq('userId', userId))
    .unique();

  if (!member) {
    throw new Error('You are not a member of this workspace.');
  }

  return member;
}

/**
 * Verify that the current user is an admin of the specified workspace
 * Returns the member record if valid, throws if not an admin
 */
export async function requireWorkspaceAdmin(ctx: Context, workspaceId: Id<'workspaces'>) {
  const member = await requireWorkspaceMember(ctx, workspaceId);

  if (member.role !== 'admin') {
    throw new Error('You must be a workspace admin to perform this action.');
  }

  return member;
}

/**
 * Check if the current user is a member of the specified workspace
 * Returns the member record or null (does not throw)
 */
export async function getWorkspaceMember(ctx: Context, workspaceId: Id<'workspaces'>) {
  const userId = await getAuth(ctx);
  if (!userId) return null;

  return await ctx.db
    .query('members')
    .withIndex('by_workspace_id_user_id', (q) => q.eq('workspaceId', workspaceId).eq('userId', userId))
    .unique();
}
