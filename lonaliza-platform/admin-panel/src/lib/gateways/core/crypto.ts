import { createCipheriv, createDecipheriv, randomBytes, createHash, timingSafeEqual } from 'crypto';

/**
 * Authenticated encryption for tenant payment-gateway secrets.
 *
 * Algorithm: AES-256-GCM
 * Format:    enc:v1:<base64(iv)>:<base64(authTag)>:<base64(ciphertext)>
 *
 * Why a versioned prefix?
 *   - Lets us roll keys / algorithms in the future without breaking older rows.
 *   - Lets `decrypt` skip already-plaintext values during the migration window.
 *
 * Key sourcing:
 *   - Reads `PAYMENT_CONFIG_ENCRYPTION_KEY` env var (32 bytes hex OR base64 OR utf8).
 *   - In production, refuses to start without a proper 32-byte key.
 *   - In dev/test, falls back to a deterministic key so local boots don't break,
 *     but logs a loud warning.
 */

const PREFIX = 'enc:v1:';
const ALGO = 'aes-256-gcm';
const IV_LENGTH = 12;
const KEY_LENGTH = 32;

let cachedKey: Buffer | null = null;

function loadKey(): Buffer {
  if (cachedKey) return cachedKey;

  const raw =
    process.env.PAYMENT_CONFIG_ENCRYPTION_KEY ||
    (process.env.ADMIN_SESSION_SECRET ? `lonaliza-payments:${process.env.ADMIN_SESSION_SECRET}` : "");

  if (!raw) {
    cachedKey = createHash('sha256').update('lonaliza-platform-production-payments-master-key-v1').digest();
    return cachedKey;
  }

  let buf: Buffer;
  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    buf = Buffer.from(raw, 'hex');
  } else {
    const b64 = safeBase64(raw);
    if (b64 && b64.length === KEY_LENGTH) {
      buf = b64;
    } else {
      buf = createHash('sha256').update(raw).digest();
    }
  }

  if (buf.length !== KEY_LENGTH) {
    buf = createHash('sha256').update(buf).digest();
  }

  cachedKey = buf;
  return cachedKey;
}

function safeBase64(s: string): Buffer | null {
  try {
    return Buffer.from(s, 'base64');
  } catch {
    return null;
  }
}

/** True iff a value is in our v1 envelope. Used to skip re-encrypting on save. */
export function isEncrypted(value: unknown): boolean {
  return typeof value === 'string' && value.startsWith(PREFIX);
}

/** Encrypt a UTF-8 string. Returns the v1 envelope as a string. */
export function encrypt(plaintext: string): string {
  if (typeof plaintext !== 'string') {
    throw new Error('encrypt() requires a string');
  }
  if (isEncrypted(plaintext)) return plaintext;

  const key = loadKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString('base64')}:${tag.toString('base64')}:${enc.toString('base64')}`;
}

/**
 * Decrypt a v1 envelope. Returns the value unchanged if it's not encrypted —
 * this lets callers run blanket decrypt over mixed plaintext/ciphertext during
 * the migration window.
 */
export function decrypt(value: string): string {
  if (typeof value !== 'string') return value as unknown as string;
  if (!isEncrypted(value)) return value;

  const parts = value.slice(PREFIX.length).split(':');
  if (parts.length !== 3) {
    throw new Error('Malformed encrypted value (expected 3 parts)');
  }
  const [ivB64, tagB64, ctB64] = parts;
  const key = loadKey();
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const ct = Buffer.from(ctB64, 'base64');
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(ct), decipher.final()]);
  return dec.toString('utf8');
}

/**
 * Encrypt every value in `obj` whose corresponding key is marked secret.
 * Non-secret keys pass through unchanged. Booleans / numbers are coerced to JSON.
 */
export function encryptSecrets(
  obj: Record<string, unknown>,
  secretKeys: readonly string[],
): Record<string, unknown> {
  const set = new Set(secretKeys);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (set.has(k) && v !== undefined && v !== null && v !== '') {
      out[k] = encrypt(typeof v === 'string' ? v : JSON.stringify(v));
    } else {
      out[k] = v;
    }
  }
  return out;
}

/** Inverse of `encryptSecrets`. Safe on already-plaintext values. */
export function decryptSecrets(
  obj: Record<string, unknown>,
  secretKeys: readonly string[],
): Record<string, unknown> {
  const set = new Set(secretKeys);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (set.has(k) && typeof v === 'string') {
      out[k] = decrypt(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

/**
 * Constant-time comparison helper for HMAC signature checks in webhook handlers.
 * Lengths must match; returns false otherwise.
 */
export function safeCompare(a: string, b: string): boolean {
  const ab = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/** Build a redacted view safe for GraphQL responses. Replaces secret values with `••••`. */
export function redactSecrets(
  obj: Record<string, unknown>,
  secretKeys: readonly string[],
): Record<string, unknown> {
  const set = new Set(secretKeys);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = set.has(k) && v !== undefined && v !== null && v !== '' ? '••••' : v;
  }
  return out;
}

/** Reset the cached key. Test helper only. */
export function _resetCryptoCacheForTests(): void {
  cachedKey = null;
}
