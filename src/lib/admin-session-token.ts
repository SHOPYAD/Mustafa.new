/**
 * HMAC-signed admin session token. Edge-safe (Web Crypto) so middleware
 * and Node route handlers share the same verifier.
 *
 * Format: base64url(JSON.stringify({ exp, v: 1 })).base64url(hmac-sha256)
 */

const encoder = new TextEncoder();

export const ADMIN_AUTH_COOKIE = "liotrip_admin_auth";
/** Previous OKTRAVEL cookie — still accepted so existing admin sessions stay valid. */
export const LEGACY_ADMIN_AUTH_COOKIE = "oktravel_admin_auth";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export type AdminSessionPayload = {
  exp: number;
  v: 1;
};

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 1) bin += String.fromCharCode(bytes[i]);
  const b64 =
    typeof btoa === "function"
      ? btoa(bin)
      : Buffer.from(bytes).toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const b64 = padded + pad;
  if (typeof atob === "function") {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
    return out;
  }
  return new Uint8Array(Buffer.from(b64, "base64"));
}

function timingEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function hmacSha256(secret: string, message: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return new Uint8Array(sig);
}

export function looksLikeSignedAdminToken(token: string): boolean {
  const raw = String(token || "").trim();
  if (!raw || raw === "1") return false;
  const parts = raw.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return false;
  try {
    const json = new TextDecoder().decode(fromBase64Url(parts[0]));
    const parsed = JSON.parse(json) as { exp?: unknown; v?: unknown };
    return typeof parsed.exp === "number" && parsed.v === 1;
  } catch {
    return false;
  }
}

export async function createAdminSessionToken(
  secret: string,
  maxAgeSeconds = ADMIN_SESSION_MAX_AGE
): Promise<string> {
  const payload: AdminSessionPayload = {
    exp: Math.floor(Date.now() / 1000) + maxAgeSeconds,
    v: 1,
  };
  const payloadB64 = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const sig = await hmacSha256(secret, payloadB64);
  return `${payloadB64}.${toBase64Url(sig)}`;
}

export async function verifyAdminSessionToken(
  secret: string,
  token: string
): Promise<boolean> {
  const raw = String(token || "").trim();
  if (!secret || !looksLikeSignedAdminToken(raw)) return false;
  const [payloadB64, sigB64] = raw.split(".");
  const expected = await hmacSha256(secret, payloadB64);
  const given = fromBase64Url(sigB64);
  if (!timingEqual(expected, given)) return false;
  try {
    const json = new TextDecoder().decode(fromBase64Url(payloadB64));
    const parsed = JSON.parse(json) as AdminSessionPayload;
    return parsed.v === 1 && parsed.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}
