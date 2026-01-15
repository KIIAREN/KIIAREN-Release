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
 * Standard base64 alphabet
 */
const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/**
 * Pure-JS base64 encoder for Uint8Array
 *
 * Used as fallback when Buffer/btoa are unavailable (e.g., some server runtimes).
 * Processes 3 bytes at a time into 4 base64 characters.
 */
function base64EncodeBytes(bytes: Uint8Array): string {
  let result = '';
  const len = bytes.length;

  // Process 3 bytes at a time
  for (let i = 0; i < len; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < len ? bytes[i + 1] : 0;
    const b2 = i + 2 < len ? bytes[i + 2] : 0;

    // Combine 3 bytes into 24 bits, then split into 4 6-bit indices
    result += BASE64_CHARS[(b0 >> 2) & 0x3f];
    result += BASE64_CHARS[((b0 << 4) | (b1 >> 4)) & 0x3f];
    result += i + 1 < len ? BASE64_CHARS[((b1 << 2) | (b2 >> 6)) & 0x3f] : '=';
    result += i + 2 < len ? BASE64_CHARS[b2 & 0x3f] : '=';
  }

  return result;
}

/**
 * Encode bytes to URL-safe base64 (base64url)
 *
 * Uses Buffer.toString('base64') if available (Node.js), otherwise falls back
 * to a pure-JS implementation. This ensures compatibility across runtimes
 * (Convex, Node.js, browsers, edge workers) where btoa may not exist.
 *
 * Output lengths (no padding): 16 bytes -> 22 chars, 24 bytes -> 32 chars
 */
export function base64urlEncode(bytes: Uint8Array): string {
  let base64: string;

  // Prefer Buffer if available (Node.js environments)
  if (typeof Buffer !== 'undefined') {
    base64 = Buffer.from(bytes).toString('base64');
  } else {
    // Pure-JS fallback for runtimes without Buffer/btoa
    base64 = base64EncodeBytes(bytes);
  }

  // Convert to URL-safe base64: replace +/ with -_, strip padding
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Alphabet for join codes - uppercase alphanumeric excluding ambiguous characters
 * Excludes: O (confused with 0), I (confused with 1), L (confused with 1)
 * Total: 32 characters (23 letters + 9 digits: 0, 2-9)
 * Note: 0 is included since O is excluded, making them distinguishable
 */
const JOIN_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ023456789';

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
    /^[ABCDEFGHJKMNPQRSTUVWXYZ023456789]+$/.test(joinCode);

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
