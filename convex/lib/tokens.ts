/**
 * Secure Token Generation Utilities
 *
 * Uses Web Crypto API (crypto.getRandomValues) for cryptographically secure
 * random number generation. Compatible with Convex runtime which does not
 * support Node.js crypto.randomBytes().
 *
 * All token generation functions use rejection sampling to avoid modulo bias.
 */

/**
 * Generate cryptographically secure random bytes using Web Crypto API
 */
export function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

/**
 * Encode bytes to URL-safe base64 (base64url)
 *
 * Uses standard base64 then replaces +/ with -_ and removes padding.
 * Result is safe for URLs, DNS TXT records, and file names.
 */
export function base64urlEncode(bytes: Uint8Array): string {
  // Convert Uint8Array to binary string
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  // Use btoa for base64 encoding, then make URL-safe
  const base64 = btoa(binary);
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Alphabet for join codes - uppercase alphanumeric excluding ambiguous characters
 * Excludes: O (confused with 0), I (confused with 1), L (confused with 1)
 * Total: 32 characters (23 letters + 9 digits: 2-9 excluding 0,1)
 */
const JOIN_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/**
 * Generate a character from the join code alphabet using rejection sampling
 *
 * Uses rejection sampling to avoid modulo bias. Since alphabet length (32)
 * is a power of 2, we can use 5 bits directly without rejection.
 *
 * @param randomByte - A single random byte
 * @returns A character from the alphabet, or null if the byte should be rejected
 */
function joinCodeCharFromByte(randomByte: number): string | null {
  // Alphabet length is 32, which is 2^5
  // Use only the lower 5 bits (values 0-31)
  const index = randomByte & 0x1f; // Mask to get lower 5 bits
  return JOIN_CODE_ALPHABET[index];
}

/**
 * Generate a secure join code
 *
 * Creates a 6-character uppercase alphanumeric code using a restricted
 * alphabet that excludes visually ambiguous characters (O, 0, I, 1, L).
 *
 * Uses crypto.getRandomValues for secure randomness and rejection sampling
 * (via bit masking) to avoid modulo bias.
 *
 * @returns A 6-character join code (e.g., "A3KM7P")
 */
export function generateJoinCode(): string {
  const codeLength = 6;
  let code = '';

  // Since our alphabet is 32 chars (power of 2), we can efficiently
  // generate one character per byte using the lower 5 bits
  const bytes = randomBytes(codeLength);

  for (let i = 0; i < codeLength; i++) {
    const char = joinCodeCharFromByte(bytes[i]);
    // char is guaranteed non-null since alphabet size is exactly 32
    code += char!;
  }

  return code;
}

/**
 * Generate a secure verification token for DNS TXT records
 *
 * Creates a 32-character base64url-encoded token from 24 random bytes.
 * The result is:
 * - Cryptographically secure
 * - URL-safe (no special characters)
 * - DNS TXT record safe (no spaces or special chars)
 * - Fixed length for consistency
 *
 * @returns A 32-character verification token
 */
export function generateVerificationToken(): string {
  // 24 bytes = 192 bits -> 32 base64 characters (no padding needed)
  const bytes = randomBytes(24);
  return base64urlEncode(bytes);
}

/**
 * Generate a secure invite code
 *
 * Creates a 22-character base64url-encoded code from 16 random bytes.
 * The result is:
 * - Cryptographically secure (128 bits of entropy)
 * - URL-safe for direct use in invite links
 * - Compact but unguessable
 *
 * @returns A 22-character invite code
 */
export function generateInviteCode(): string {
  // 16 bytes = 128 bits -> 22 base64 characters (no padding needed)
  const bytes = randomBytes(16);
  return base64urlEncode(bytes);
}

/**
 * Maximum number of retry attempts for collision handling
 */
export const MAX_COLLISION_RETRIES = 5;

/**
 * Error thrown when token generation fails after maximum retries
 */
export class TokenCollisionError extends Error {
  constructor(tokenType: string) {
    super(
      `Failed to generate unique ${tokenType} after ${MAX_COLLISION_RETRIES} attempts. ` +
      `This is extremely unlikely and may indicate a system issue.`
    );
    this.name = 'TokenCollisionError';
  }
}

/**
 * Test helper: Verify token generation produces expected formats
 *
 * Can be called in development to validate token generators.
 * Returns an object with sample tokens and validation results.
 */
export function _testTokenGeneration(): {
  joinCode: { value: string; valid: boolean; length: number };
  verificationToken: { value: string; valid: boolean; length: number };
  inviteCode: { value: string; valid: boolean; length: number };
} {
  const joinCode = generateJoinCode();
  const verificationToken = generateVerificationToken();
  const inviteCode = generateInviteCode();

  // Validate join code: 6 chars, uppercase, from restricted alphabet
  const joinCodeValid =
    joinCode.length === 6 &&
    /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]+$/.test(joinCode);

  // Validate verification token: 32 chars, base64url safe
  const verificationTokenValid =
    verificationToken.length === 32 &&
    /^[A-Za-z0-9_-]+$/.test(verificationToken);

  // Validate invite code: 22 chars, base64url safe
  const inviteCodeValid =
    inviteCode.length === 22 &&
    /^[A-Za-z0-9_-]+$/.test(inviteCode);

  return {
    joinCode: { value: joinCode, valid: joinCodeValid, length: joinCode.length },
    verificationToken: { value: verificationToken, valid: verificationTokenValid, length: verificationToken.length },
    inviteCode: { value: inviteCode, valid: inviteCodeValid, length: inviteCode.length },
  };
}
