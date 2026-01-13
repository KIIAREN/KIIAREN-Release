/**
 * Domain Trust Primitives
 *
 * @module @kiiaren/core/domain
 */

export type {
  // Domain verification
  DomainStatus,
  Domain,
  DomainVerificationResult,
  DomainProvider,
  // Invite links
  InviteLink,
  InviteLinkScope,
  InviteLinkScopeWorkspace,
  InviteLinkScopeChannel,
  CreateInviteLinkInput,
  InviteRedemptionResult,
  InviteProvider,
  // Workspace extension
  WorkspaceDomainFields,
} from './types';

export { DNS_TXT_PREFIX, DNS_TXT_SUBDOMAIN } from './types';
