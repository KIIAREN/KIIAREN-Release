/**
 * Domain Verification Mutations
 *
 * Implements domain ownership and verification for workspace trust.
 *
 * Flow:
 * 1. Admin calls addDomain() to claim a domain
 * 2. Admin adds DNS TXT record: _kiiaren-verification.domain.com
 * 3. Admin calls verifyDomain() to complete verification
 * 4. Users with @domain.com email can auto-join the workspace
 */

import { v } from 'convex/values';
import { mutation, query, internalMutation } from './_generated/server';
import { requireWorkspaceAdmin, requireAuth } from './lib/access_control';
import {
  generateVerificationToken,
  MAX_COLLISION_RETRIES,
  TokenCollisionError,
} from './lib/tokens';

/**
 * Normalize domain to lowercase, strip www prefix
 */
function normalizeDomain(domain: string): string {
  return domain.toLowerCase().replace(/^www\./, '').trim();
}

/**
 * Validate domain format
 */
function isValidDomain(domain: string): boolean {
  // Simple regex for domain validation
  const domainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/;
  return domainRegex.test(domain);
}

/**
 * Add a domain for verification
 *
 * Creates a pending domain record with a verification token.
 * Admin-only operation.
 */
export const addDomain = mutation({
  args: {
    workspaceId: v.id('workspaces'),
    domain: v.string(),
  },
  handler: async (ctx, args) => {
    // Require admin
    await requireWorkspaceAdmin(ctx, args.workspaceId);

    // Normalize and validate
    const domain = normalizeDomain(args.domain);
    if (!isValidDomain(domain)) {
      throw new Error(
        `Invalid domain format: "${args.domain}". Please enter a valid domain like "acme.com".`
      );
    }

    // Check if domain is already claimed by ANY workspace
    const existingDomain = await ctx.db
      .query('domains')
      .withIndex('by_domain', (q) => q.eq('domain', domain))
      .first();

    if (existingDomain) {
      if (existingDomain.workspaceId === args.workspaceId) {
        throw new Error(
          `Domain "${domain}" is already added to this workspace.`
        );
      }
      throw new Error(
        `Domain "${domain}" is already claimed by another workspace.`
      );
    }

    const userId = await requireAuth(ctx);

    // Generate unique verification token with collision retry
    let verificationToken: string | null = null;
    for (let attempt = 0; attempt < MAX_COLLISION_RETRIES; attempt++) {
      const candidate = generateVerificationToken();
      const existing = await ctx.db
        .query('domains')
        .withIndex('by_verification_token', (q) => q.eq('verificationToken', candidate))
        .first();
      if (!existing) {
        verificationToken = candidate;
        break;
      }
    }

    if (!verificationToken) {
      throw new TokenCollisionError('verification token');
    }

    // Create pending domain record
    const domainId = await ctx.db.insert('domains', {
      workspaceId: args.workspaceId,
      domain,
      verificationToken,
      status: 'pending',
      createdAt: Date.now(),
      createdBy: userId,
    });

    return domainId;
  },
});

/**
 * Get domain by ID (for verification info display)
 */
export const getById = query({
  args: {
    domainId: v.id('domains'),
  },
  handler: async (ctx, args) => {
    const domain = await ctx.db.get(args.domainId);
    if (!domain) return null;

    // Verify caller is workspace member
    const userId = await requireAuth(ctx);
    const member = await ctx.db
      .query('members')
      .withIndex('by_workspace_id_user_id', (q) =>
        q.eq('workspaceId', domain.workspaceId).eq('userId', userId)
      )
      .unique();

    if (!member) return null;

    return domain;
  },
});

/**
 * List all domains for a workspace
 *
 * Admin-only operation.
 */
export const listDomains = query({
  args: {
    workspaceId: v.id('workspaces'),
  },
  handler: async (ctx, args) => {
    // Require admin
    await requireWorkspaceAdmin(ctx, args.workspaceId);

    const domains = await ctx.db
      .query('domains')
      .withIndex('by_workspace_id', (q) => q.eq('workspaceId', args.workspaceId))
      .collect();

    return domains.map((d) => ({
      id: d._id,
      domain: d.domain,
      status: d.status,
      verificationToken: d.verificationToken,
      verifiedAt: d.verifiedAt,
      createdAt: d.createdAt,
    }));
  },
});

/**
 * Remove a domain
 *
 * Admin-only operation. If this was the only verified domain,
 * re-enables join codes for the workspace.
 */
export const removeDomain = mutation({
  args: {
    domainId: v.id('domains'),
  },
  handler: async (ctx, args) => {
    const domain = await ctx.db.get(args.domainId);
    if (!domain) {
      throw new Error('Domain not found.');
    }

    // Require admin
    await requireWorkspaceAdmin(ctx, domain.workspaceId);

    // Delete the domain
    await ctx.db.delete(args.domainId);

    // Check if any verified domains remain
    const remainingVerified = await ctx.db
      .query('domains')
      .withIndex('by_workspace_id', (q) => q.eq('workspaceId', domain.workspaceId))
      .filter((q) => q.eq(q.field('status'), 'verified'))
      .first();

    // If no verified domains remain, re-enable join codes
    if (!remainingVerified) {
      await ctx.db.patch(domain.workspaceId, {
        domainVerified: false,
        joinCodeEnabled: true,
      });
    }

    return { success: true };
  },
});

/**
 * Update domain verification status (internal)
 *
 * Called by HTTP action after DNS lookup.
 */
export const updateStatus = internalMutation({
  args: {
    domainId: v.id('domains'),
    status: v.union(
      v.literal('pending'),
      v.literal('verified'),
      v.literal('failed')
    ),
    verifiedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const domain = await ctx.db.get(args.domainId);
    if (!domain) {
      throw new Error('Domain not found.');
    }

    // Update domain status
    await ctx.db.patch(args.domainId, {
      status: args.status,
      verifiedAt: args.verifiedAt,
    });

    // If verified, update workspace flags
    if (args.status === 'verified') {
      await ctx.db.patch(domain.workspaceId, {
        domainVerified: true,
        joinCodeEnabled: false,
      });
    }

    return { success: true };
  },
});

/**
 * Check if an email domain matches a verified workspace domain
 *
 * Public operation used during join flow.
 */
export const checkEmailDomain = query({
  args: {
    workspaceId: v.id('workspaces'),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Extract domain from email
    const emailParts = args.email.toLowerCase().split('@');
    if (emailParts.length !== 2) {
      return { matches: false };
    }
    const emailDomain = emailParts[1];

    // Check if domain is verified for this workspace
    const verifiedDomain = await ctx.db
      .query('domains')
      .withIndex('by_workspace_domain', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('domain', emailDomain)
      )
      .filter((q) => q.eq(q.field('status'), 'verified'))
      .first();

    if (verifiedDomain) {
      return { matches: true, domain: verifiedDomain.domain };
    }

    return { matches: false };
  },
});

/**
 * Get verification instructions for a domain
 *
 * Returns the DNS TXT record that needs to be added.
 */
export const getVerificationInstructions = query({
  args: {
    domainId: v.id('domains'),
  },
  handler: async (ctx, args) => {
    const domain = await ctx.db.get(args.domainId);
    if (!domain) {
      throw new Error('Domain not found.');
    }

    // Verify caller is workspace admin
    await requireWorkspaceAdmin(ctx, domain.workspaceId);

    return {
      recordType: 'TXT',
      recordName: `_kiiaren-verification.${domain.domain}`,
      recordValue: `kiiaren-verification=${domain.verificationToken}`,
      instructions: [
        `1. Go to your DNS provider for ${domain.domain}`,
        `2. Add a new TXT record`,
        `3. Set the record name to: _kiiaren-verification`,
        `4. Set the record value to: kiiaren-verification=${domain.verificationToken}`,
        `5. Wait for DNS propagation (usually 5-15 minutes)`,
        `6. Click "Verify" to complete domain verification`,
      ],
    };
  },
});
