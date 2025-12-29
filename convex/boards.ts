/**
 * Boards (Excalidraw whiteboards) CRUD operations
 * Stores Excalidraw scene data as JSON strings
 */

import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { requireAuth, requireWorkspaceMember } from './lib/access-control';

/**
 * List all boards in a workspace
 */
export const list = query({
  args: {
    workspaceId: v.id('workspaces'),
  },
  handler: async (ctx, args) => {
    await requireWorkspaceMember(ctx, args.workspaceId);

    const boards = await ctx.db
      .query('boards')
      .withIndex('by_workspace_id', (q) => q.eq('workspaceId', args.workspaceId))
      .order('desc')
      .collect();

    return boards;
  },
});

/**
 * Get a single board by ID
 */
export const getById = query({
  args: {
    id: v.id('boards'),
  },
  handler: async (ctx, args) => {
    const board = await ctx.db.get(args.id);
    if (!board) return null;

    await requireWorkspaceMember(ctx, board.workspaceId);

    return board;
  },
});

/**
 * Create a new board
 */
export const create = mutation({
  args: {
    title: v.string(),
    workspaceId: v.id('workspaces'),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    await requireWorkspaceMember(ctx, args.workspaceId);

    const now = Date.now();

    const boardId = await ctx.db.insert('boards', {
      title: args.title,
      workspaceId: args.workspaceId,
      excalidrawData: undefined,
      thumbnail: undefined,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    });

    return boardId;
  },
});

/**
 * Update board data (autosave with debounce on client)
 */
export const update = mutation({
  args: {
    id: v.id('boards'),
    title: v.optional(v.string()),
    excalidrawData: v.optional(v.string()),
    thumbnail: v.optional(v.union(v.id('_storage'), v.null())),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const board = await ctx.db.get(args.id);
    if (!board) throw new Error('Board not found.');

    await requireWorkspaceMember(ctx, board.workspaceId);

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) updates.title = args.title;
    if (args.excalidrawData !== undefined) updates.excalidrawData = args.excalidrawData;
    if (args.thumbnail !== undefined) updates.thumbnail = args.thumbnail;

    await ctx.db.patch(args.id, updates);

    return args.id;
  },
});

/**
 * Delete a board permanently
 */
export const remove = mutation({
  args: {
    id: v.id('boards'),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const board = await ctx.db.get(args.id);
    if (!board) throw new Error('Board not found.');

    await requireWorkspaceMember(ctx, board.workspaceId);

    await ctx.db.delete(args.id);

    return args.id;
  },
});

/**
 * Search boards by title
 */
export const search = query({
  args: {
    workspaceId: v.id('workspaces'),
    query: v.string(),
  },
  handler: async (ctx, args) => {
    await requireWorkspaceMember(ctx, args.workspaceId);

    const boards = await ctx.db
      .query('boards')
      .withIndex('by_workspace_id', (q) => q.eq('workspaceId', args.workspaceId))
      .collect();

    const searchQuery = args.query.toLowerCase();
    const filtered = boards.filter((board) => board.title.toLowerCase().includes(searchQuery));

    return filtered;
  },
});
