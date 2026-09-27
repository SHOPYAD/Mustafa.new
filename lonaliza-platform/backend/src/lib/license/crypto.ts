import { createHmac, timingSafeEqual } from "crypto";

const DEFAULT_KEY = "liotrip-license-signing-secret-2026";

/**
 * Sign a payload with HMAC-SHA256.
 */
export function signLicensePayload(payload: Record<string, unknown>, secretKey?: string): string {
  const key = secretKey || process.env.LICENSE_SIGNING_KEY || DEFAULT_KEY;
  const raw = JSON.stringify(payload, Object.keys(payload).sort());
  return createHmac("sha256", key).update(raw).digest("hex");
}

/**
 * Verify HMAC-SHA256 signature.
 */
export function verifyLicenseSignature(
  payload: Record<string, unknown>,
  signature: string,
  secretKey?: string
): boolean {
  try {
    const expected = signLicensePayload(payload, secretKey);
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(signature, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
