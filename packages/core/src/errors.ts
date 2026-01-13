/**
 * KIIAREN Error Types
 *
 * Custom error classes for clear, actionable error messages.
 */

/**
 * Error thrown when attempting to use a managed-only feature in OSS deployment.
 *
 * Managed-only features include:
 * - Audit logs
 * - SSO/SAML
 * - Indexed search
 * - AI agents
 * - Push notifications
 * - KMS / E2E encryption
 *
 * @example
 * ```typescript
 * if (!provider.isManaged) {
 *   throw new ManagedOnlyError('audit_logs');
 * }
 * ```
 */
export class ManagedOnlyError extends Error {
  readonly feature: string;
  readonly isKiiarenError = true;

  constructor(feature: string) {
    super(
      `[KIIAREN] "${feature}" requires managed tier. ` +
        `This feature is not available in self-hosted deployments. ` +
        `See https://kiiaren.com/docs/editioning for feature availability.`
    );
    this.name = 'ManagedOnlyError';
    this.feature = feature;

    // Maintains proper stack trace in V8 environments
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ManagedOnlyError);
    }
  }
}

/**
 * Error thrown when a provider operation is not implemented.
 *
 * Used in self-host provider skeleton to indicate which operations
 * need community contribution.
 *
 * @example
 * ```typescript
 * throw new NotImplementedError('SelfHostProvider', 'workspace.create');
 * ```
 */
export class NotImplementedError extends Error {
  readonly provider: string;
  readonly operation: string;
  readonly isKiiarenError = true;

  constructor(provider: string, operation: string) {
    super(
      `[${provider}] "${operation}" is not yet implemented. ` +
        `Self-host provider is currently a skeleton. ` +
        `Contributions welcome: https://github.com/kiiaren/kiiaren`
    );
    this.name = 'NotImplementedError';
    this.provider = provider;
    this.operation = operation;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NotImplementedError);
    }
  }
}

/**
 * Error thrown when domain verification fails.
 */
export class DomainVerificationError extends Error {
  readonly domain: string;
  readonly reason: 'not_found' | 'invalid_token' | 'dns_error' | 'already_claimed';
  readonly isKiiarenError = true;

  constructor(
    domain: string,
    reason: 'not_found' | 'invalid_token' | 'dns_error' | 'already_claimed',
    details?: string
  ) {
    const messages: Record<typeof reason, string> = {
      not_found: `DNS TXT record not found for _kiiaren-verification.${domain}`,
      invalid_token: `DNS TXT record found but verification token does not match`,
      dns_error: `Failed to query DNS for ${domain}`,
      already_claimed: `Domain ${domain} is already claimed by another workspace`,
    };
    super(`[KIIAREN] Domain verification failed: ${messages[reason]}${details ? `. ${details}` : ''}`);
    this.name = 'DomainVerificationError';
    this.domain = domain;
    this.reason = reason;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DomainVerificationError);
    }
  }
}

/**
 * Error thrown when invite link validation fails.
 */
export class InviteLinkError extends Error {
  readonly code: string;
  readonly reason: 'not_found' | 'expired' | 'revoked' | 'max_uses' | 'already_member';
  readonly isKiiarenError = true;

  constructor(
    code: string,
    reason: 'not_found' | 'expired' | 'revoked' | 'max_uses' | 'already_member'
  ) {
    const messages: Record<typeof reason, string> = {
      not_found: 'Invite link not found',
      expired: 'Invite link has expired',
      revoked: 'Invite link has been revoked',
      max_uses: 'Invite link has reached maximum uses',
      already_member: 'You are already a member of this workspace',
    };
    super(`[KIIAREN] ${messages[reason]}`);
    this.name = 'InviteLinkError';
    this.code = code;
    this.reason = reason;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InviteLinkError);
    }
  }
}

/**
 * Type guard to check if an error is a KIIAREN error
 */
export function isKiiarenError(
  error: unknown
): error is ManagedOnlyError | NotImplementedError | DomainVerificationError | InviteLinkError {
  return (
    error instanceof Error &&
    'isKiiarenError' in error &&
    (error as { isKiiarenError: boolean }).isKiiarenError === true
  );
}
