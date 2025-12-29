/**
 * Docs (Notion-like documents) CRUD operations
 * Supports hierarchical organization with parent/child relationships
 */

import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import type { Id } from './_generated/dataModel';
import { requireAuth, requireWorkspaceMember } from './lib/access_control';

/**
 * List all documents in a workspace (non-archived, top-level only)
 */
export const list = query({
  args: {
    workspaceId: v.id('workspaces'),
    parentDocumentId: v.optional(v.id('docs')),
  },
  handler: async (ctx, args) => {
    await requireWorkspaceMember(ctx, args.workspaceId);

    const docs = await ctx.db
      .query('docs')
      .withIndex('by_workspace_id_parent', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('parentDocumentId', args.parentDocumentId),
      )
      .filter((q) => q.eq(q.field('isArchived'), false))
      .order('desc')
      .collect();

    return docs;
  },
});

/**
 * List archived documents in a workspace
 */
export const listArchived = query({
  args: {
    workspaceId: v.id('workspaces'),
  },
  handler: async (ctx, args) => {
    await requireWorkspaceMember(ctx, args.workspaceId);

    const docs = await ctx.db
      .query('docs')
      .withIndex('by_workspace_id', (q) => q.eq('workspaceId', args.workspaceId))
      .filter((q) => q.eq(q.field('isArchived'), true))
      .order('desc')
      .collect();

    return docs;
  },
});

/**
 * Get a single document by ID
 */
export const getById = query({
  args: {
    id: v.id('docs'),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    if (!doc) return null;

    await requireWorkspaceMember(ctx, doc.workspaceId);

    return doc;
  },
});

/**
 * Create a new document
 */
export const create = mutation({
  args: {
    title: v.string(),
    workspaceId: v.id('workspaces'),
    parentDocumentId: v.optional(v.id('docs')),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    await requireWorkspaceMember(ctx, args.workspaceId);

    // Verify parent document exists and is in same workspace
    if (args.parentDocumentId) {
      const parentDoc = await ctx.db.get(args.parentDocumentId);
      if (!parentDoc || parentDoc.workspaceId !== args.workspaceId) {
        throw new Error('Invalid parent document.');
      }
    }

    const now = Date.now();

    const docId = await ctx.db.insert('docs', {
      title: args.title,
      workspaceId: args.workspaceId,
      parentDocumentId: args.parentDocumentId,
      content: undefined,
      coverImage: undefined,
      icon: undefined,
      isArchived: false,
      isPublished: false,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    });

    return docId;
  },
});

/**
 * Update document content or metadata
 */
export const update = mutation({
  args: {
    id: v.id('docs'),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    coverImage: v.optional(v.union(v.id('_storage'), v.null())),
    icon: v.optional(v.union(v.string(), v.null())),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const doc = await ctx.db.get(args.id);
    if (!doc) throw new Error('Document not found.');

    await requireWorkspaceMember(ctx, doc.workspaceId);

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) updates.title = args.title;
    if (args.content !== undefined) updates.content = args.content;
    if (args.coverImage !== undefined) updates.coverImage = args.coverImage;
    if (args.icon !== undefined) updates.icon = args.icon;
    if (args.isPublished !== undefined) updates.isPublished = args.isPublished;

    await ctx.db.patch(args.id, updates);

    return args.id;
  },
});

/**
 * Archive a document (soft delete)
 */
export const archive = mutation({
  args: {
    id: v.id('docs'),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const doc = await ctx.db.get(args.id);
    if (!doc) throw new Error('Document not found.');

    await requireWorkspaceMember(ctx, doc.workspaceId);

    // Archive all child documents recursively
    const archiveChildren = async (parentId: Id<'docs'>) => {
      const children = await ctx.db
        .query('docs')
        .withIndex('by_workspace_id_parent', (q) =>
          q.eq('workspaceId', doc.workspaceId).eq('parentDocumentId', parentId as Id<'docs'>),
        )
        .collect();

      for (const child of children) {
        await ctx.db.patch(child._id, {
          isArchived: true,
          updatedAt: Date.now(),
        });
        await archiveChildren(child._id as Id<'docs'>);
      }
    };

    await ctx.db.patch(args.id, {
      isArchived: true,
      updatedAt: Date.now(),
    });

    await archiveChildren(args.id);

    return args.id;
  },
});

/**
 * Restore an archived document
 */
export const restore = mutation({
  args: {
    id: v.id('docs'),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const doc = await ctx.db.get(args.id);
    if (!doc) throw new Error('Document not found.');

    await requireWorkspaceMember(ctx, doc.workspaceId);

    // If parent is archived, restore to top level
    let parentDocumentId = doc.parentDocumentId;
    if (parentDocumentId) {
      const parent = await ctx.db.get(parentDocumentId);
      if (parent?.isArchived) {
        parentDocumentId = undefined;
      }
    }

    await ctx.db.patch(args.id, {
      isArchived: false,
      parentDocumentId,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

/**
 * Permanently delete a document and all its children
 */
export const remove = mutation({
  args: {
    id: v.id('docs'),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const doc = await ctx.db.get(args.id);
    if (!doc) throw new Error('Document not found.');

    await requireWorkspaceMember(ctx, doc.workspaceId);

    // Delete all child documents recursively
    const deleteChildren = async (parentId: Id<'docs'>) => {
      const children = await ctx.db
        .query('docs')
        .withIndex('by_workspace_id_parent', (q) =>
          q.eq('workspaceId', doc.workspaceId).eq('parentDocumentId', parentId as Id<'docs'>),
        )
        .collect();

      for (const child of children) {
        await deleteChildren(child._id as Id<'docs'>);
        await ctx.db.delete(child._id);
      }
    };

    await deleteChildren(args.id);
    await ctx.db.delete(args.id);

    return args.id;
  },
});

/**
 * Search documents by title
 */
export const search = query({
  args: {
    workspaceId: v.id('workspaces'),
    query: v.string(),
  },
  handler: async (ctx, args) => {
    await requireWorkspaceMember(ctx, args.workspaceId);

    const docs = await ctx.db
      .query('docs')
      .withIndex('by_workspace_id', (q) => q.eq('workspaceId', args.workspaceId))
      .filter((q) => q.eq(q.field('isArchived'), false))
      .collect();

    const searchQuery = args.query.toLowerCase();
    const filtered = docs.filter((doc) => doc.title.toLowerCase().includes(searchQuery));

    return filtered;
  },
});
