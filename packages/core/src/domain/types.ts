/**
 * Domain Trust Primitives
 *
 * This module implements the domain verification system that transforms KIIAREN
 * from a casual join-code-only app to an enterprise-grade workspace platform.
 *
 * Key concepts:
 * 1. Domain Ownership - Workspace may claim one or more email domains
 * 2. DNS Verification - Domain ownership proven via TXT record
 * 3. Auto-Membership - Users with @domain.com email auto-join verified workspaces
 * 4. Invite Links - Admin-issued links for external users when domain is verified
 *
 * Trust model:
 * - Domain is an ORGANIZATIONAL trust boundary, not user identity
 * - Only workspace OWNER/ADMIN can add and verify domains
 * - Members do NOT need to configure anything - they auto-join
 * - Join codes are disabled when domain is verified
 */

import type { EntityId } from '../providers/types';

// -----------------------------------------------------------------------------
// Domain Verification
// -----------------------------------------------------------------------------

/**
 * Domain verification status
 *
 * - pending: Domain added, awaiting DNS verification
 * - verified: DNS TXT record confirmed, domain is trusted
 * - failed: Verification attempt failed (can retry)
 */
export type DomainStatus = 'pending' | 'verified' | 'failed';

/**
 * Domain verification record
 *
 * Represents a domain that a workspace claims ownership of.
 * Verification requires adding a DNS TXT record.
 */
export interface Domain {
  id: EntityId;
  workspaceId: EntityId;
  /** The email domain (e.g., "acme.com") - stored lowercase */
  domain: string;
  /** Random token for DNS TXT verification */
  verificationToken: string;
  status: DomainStatus;
  /** Timestamp when verification succeeded */
  verifiedAt?: number;
  createdAt: number;
  /** Admin who initiated the domain claim */
  createdBy: EntityId;
}

/**
 * DNS TXT record format for domain verification
 *
 * To verify ownership of acme.com:
 * 1. Add TXT record at: _kiiaren-verification.acme.com
 * 2. Record value: kiiaren-verification=<token>
 *
 * Example DNS record:
 * _kiiaren-verification.acme.com. 300 IN TXT "kiiaren-verification=abc123xyz"
 */
export const DNS_TXT_PREFIX = 'kiiaren-verification=';
export const DNS_TXT_SUBDOMAIN = '_kiiaren-verification';

/**
 * Result of a DNS verification attempt
 */
export interface DomainVerificationResult {
  success: boolean;
  domain: Domain;
  /** Error message if verification failed */
  error?: string;
  /** DNS records found (for debugging) */
  recordsFound?: string[];
}

// -----------------------------------------------------------------------------
// Invite Links
// -----------------------------------------------------------------------------

/**
 * Invite link for external users
 *
 * When a workspace has a verified domain:
 * - Public join codes are disabled
 * - Members with matching email domain auto-join
 * - External users require admin-issued invite links
 *
 * Invite links are:
 * - Scoped (workspace or channel level)
 * - Time-limited (expiresAt)
 * - Usage-limited (optional maxUses)
 * - Revocable (revokedAt)
 */
export interface InviteLink {
  id: EntityId;
  workspaceId: EntityId;
  /** Unique invite code (URL-safe) */
  code: string;
  /** Admin who created the invite */
  createdBy: EntityId;
  createdAt: number;
  /** When the invite expires (Unix timestamp) */
  expiresAt: number;
  /** Maximum number of uses (undefined = unlimited) */
  maxUses?: number;
  /** Current number of uses */
  usedCount: number;
  /** What the invitee can access */
  scope: InviteLinkScope;
  /** If set, invite is revoked and unusable */
  revokedAt?: number;
}

/**
 * Invite link scope
 *
 * - workspace: Full workspace access (member role)
 * - channel: Access to specific channel only (future feature)
 */
export type InviteLinkScope =
  | InviteLinkScopeWorkspace
  | InviteLinkScopeChannel;

export interface InviteLinkScopeWorkspace {
  type: 'workspace';
}

export interface InviteLinkScopeChannel {
  type: 'channel';
  channelId: EntityId;
}

/**
 * Input for creating an invite link
 */
export interface CreateInviteLinkInput {
  workspaceId: EntityId;
  /** Hours until expiry (default: 24) */
  expiresInHours?: number;
  scope: InviteLinkScope;
  /** Maximum uses (undefined = unlimited) */
  maxUses?: number;
}

/**
 * Result of invite link redemption
 */
export interface InviteRedemptionResult {
  success: boolean;
  workspaceId: EntityId;
  /** Channel ID if scope was 'channel' */
  channelId?: EntityId;
  /** Error message if redemption failed */
  error?: string;
}

// -----------------------------------------------------------------------------
// Provider Interfaces
// -----------------------------------------------------------------------------

/**
 * Domain provider interface
 *
 * Implements domain verification and management operations.
 * All operations require admin role except checkEmailDomain.
 */
export interface DomainProvider {
  /**
   * Add a domain for verification (admin-only)
   *
   * Creates a pending domain record with a verification token.
   * The admin must then add a DNS TXT record to prove ownership.
   *
   * @throws {Error} If not admin
   * @throws {Error} If domain already claimed by any workspace
   */
  addDomain(workspaceId: EntityId, domain: string): Promise<Domain>;

  /**
   * Attempt to verify domain via DNS TXT lookup (admin-only)
   *
   * Queries DNS for:
   * _kiiaren-verification.{domain} TXT "kiiaren-verification={token}"
   *
   * On success:
   * - Updates domain status to 'verified'
   * - Sets workspace.domainVerified = true
   * - Sets workspace.joinCodeEnabled = false
   *
   * @throws {Error} If domain not found
   * @throws {Error} If not admin
   */
  verifyDomain(domainId: EntityId): Promise<DomainVerificationResult>;

  /**
   * List all domains for a workspace (admin-only)
   */
  listDomains(workspaceId: EntityId): Promise<Domain[]>;

  /**
   * Remove a domain (admin-only)
   *
   * If this was the only verified domain, re-enables join codes.
   */
  removeDomain(domainId: EntityId): Promise<void>;

  /**
   * Check if an email is eligible for auto-join
   *
   * Used during join flow to determine if user can auto-join.
   * Public operation (no admin check).
   *
   * @returns The verified domain if email matches, null otherwise
   */
  checkEmailDomain(workspaceId: EntityId, email: string): Promise<Domain | null>;
}

/**
 * Invite provider interface
 *
 * Implements invite link creation and redemption.
 * Create/list/revoke require admin role.
 */
export interface InviteProvider {
  /**
   * Create an invite link (admin-only)
   */
  createInviteLink(input: CreateInviteLinkInput): Promise<InviteLink>;

  /**
   * Get invite link by code (public)
   *
   * Returns null if not found, expired, or revoked.
   */
  getInviteLinkByCode(code: string): Promise<InviteLink | null>;

  /**
   * Redeem an invite link (authenticated)
   *
   * Validates:
   * - Link exists
   * - Link not expired
   * - Link not revoked
   * - Link not at max uses
   * - User not already a member
   *
   * On success:
   * - Increments usedCount
   * - Creates member record
   */
  redeemInviteLink(code: string): Promise<InviteRedemptionResult>;

  /**
   * List invite links for a workspace (admin-only)
   */
  listInviteLinks(workspaceId: EntityId): Promise<InviteLink[]>;

  /**
   * Revoke an invite link (admin-only)
   */
  revokeInviteLink(inviteLinkId: EntityId): Promise<void>;
}

// -----------------------------------------------------------------------------
// Extended Workspace Type
// -----------------------------------------------------------------------------

/**
 * Domain-aware workspace fields
 *
 * These extend the base Workspace type when domain verification is enabled.
 */
export interface WorkspaceDomainFields {
  /** True if any domain is verified */
  domainVerified: boolean;
  /** False when domainVerified is true (join codes disabled) */
  joinCodeEnabled: boolean;
}
