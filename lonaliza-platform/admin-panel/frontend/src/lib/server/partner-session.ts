import { cookies } from "next/headers";
import { getResellerCompany, type ResellerCompany } from "@/lib/server/resale-store";
import { getServerEnv } from "@/lib/server/env-store";

const encoder = new TextEncoder();
export const PARTNER_AUTH_COOKIE = "liotrip_partner_auth";
export const PARTNER_SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export type PartnerSessionPayload = {
  companyId: string;
  email: string;
  exp: number;
  v: 1;
};

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 1) bin += String.fromCharCode(bytes[i]);
  const b64 = typeof btoa === "function" ? btoa(bin) : Buffer.from(bytes).toString("base64");
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

export async function createPartnerSessionToken(
  companyId: string,
  email: string,
  secret?: string
): Promise<string> {
  const s = secret || (await getServerEnv("ADMIN_SESSION_SECRET")) || "partner-secret-salt-2026";
  const payload: PartnerSessionPayload = {
    companyId,
    email,
    exp: Math.floor(Date.now() / 1000) + PARTNER_SESSION_MAX_AGE,
    v: 1,
  };
  const payloadB64 = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const sig = await hmacSha256(s, payloadB64);
  return `${payloadB64}.${toBase64Url(sig)}`;
}

export async function verifyPartnerSessionToken(
  token: string,
  secret?: string
): Promise<PartnerSessionPayload | null> {
  const raw = String(token || "").trim();
  if (!raw) return null;
  const parts = raw.split(".");
  if (parts.length !== 2) return null;
  const s = secret || (await getServerEnv("ADMIN_SESSION_SECRET")) || "partner-secret-salt-2026";

  const [payloadB64, sigB64] = parts;
  const expected = await hmacSha256(s, payloadB64);
  const given = fromBase64Url(sigB64);
  if (!timingEqual(expected, given)) return null;

  try {
    const json = new TextDecoder().decode(fromBase64Url(payloadB64));
    const parsed = JSON.parse(json) as PartnerSessionPayload;
    if (parsed.v === 1 && parsed.exp > Math.floor(Date.now() / 1000)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Get the currently authenticated partner company from request cookies.
 */
export async function getAuthenticatedPartnerCompany(): Promise<ResellerCompany | null> {
  try {
    const cookieStore = await cookies();
    
    // 1. Try partner token cookie
    const rawToken = cookieStore.get(PARTNER_AUTH_COOKIE)?.value;
    if (rawToken) {
      const token = decodeURIComponent(rawToken);
      const payload = await verifyPartnerSessionToken(token);
      if (payload?.companyId) {
        const company = await getResellerCompany(payload.companyId);
        if (company) return company;
      }
    }

    // 2. Fallback: Check pb_auth cookie from Google OAuth / PocketBase
    const pbAuthRaw = cookieStore.get("pb_auth")?.value;
    if (pbAuthRaw) {
      try {
        const decoded = decodeURIComponent(pbAuthRaw);
        const parsed = JSON.parse(decoded) as {
          token?: string;
          model?: { id?: string; email?: string; name?: string };
          user?: { id?: string; email?: string; name?: string };
        };
        const email = parsed?.model?.email || parsed?.user?.email;
        const name = parsed?.model?.name || parsed?.user?.name || "";
        const id = parsed?.model?.id || parsed?.user?.id || "";
        if (email) {
          const { upsertResellerCompanyFromGoogle } = await import("@/lib/server/resale-store");
          return await upsertResellerCompanyFromGoogle({
            email,
            name,
            googleId: id,
          });
        }
      } catch (e) {
        console.warn("[partner-session] pb_auth parse fallback note:", e);
      }
    }

    return null;
  } catch (err) {
    console.error("[partner-session] error:", err);
    return null;
  }
}
