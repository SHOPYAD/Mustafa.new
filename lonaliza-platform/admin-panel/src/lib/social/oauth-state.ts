import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { getServerEnv } from "@/lib/server/env-store";
import type { SocialProvider } from "./types";

export const SOCIAL_OAUTH_COOKIE = "alrayyan_social_oauth";
const STATE_TTL_MS = 10 * 60 * 1000;

type StatePayload = {
  provider: SocialProvider;
  nonce: string;
  exp: number;
};

async function stateSecret(): Promise<string> {
  const dedicated = (await getServerEnv("SOCIAL_OAUTH_STATE_SECRET")).trim();
  if (dedicated.length >= 16) return dedicated;
  const session = (await getServerEnv("ADMIN_SESSION_SECRET")).trim();
  if (session.length >= 16) return session;
  return "alrayyan-social-oauth-dev-only";
}

function b64url(value: string | Buffer): string {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromB64url(value: string): Buffer {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return Buffer.from(padded + pad, "base64");
}

export async function createOAuthState(
  provider: SocialProvider
): Promise<string> {
  const payload: StatePayload = {
    provider,
    nonce: randomBytes(16).toString("hex"),
    exp: Date.now() + STATE_TTL_MS,
  };
  const body = b64url(JSON.stringify(payload));
  const secret = await stateSecret();
  const sig = b64url(createHmac("sha256", secret).update(body).digest());
  return `${body}.${sig}`;
}

export async function verifyOAuthState(
  token: string,
  provider: SocialProvider
): Promise<boolean> {
  const [body, sig] = String(token || "").split(".");
  if (!body || !sig) return false;
  const secret = await stateSecret();
  const expected = b64url(createHmac("sha256", secret).update(body).digest());
  const left = Buffer.from(sig);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  if (!timingSafeEqual(left, right)) return false;
  try {
    const payload = JSON.parse(fromB64url(body).toString("utf8")) as StatePayload;
    if (payload.provider !== provider) return false;
    if (!payload.nonce || typeof payload.exp !== "number") return false;
    if (payload.exp < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

export function oauthCookieHeader(
  value: string,
  origin: string,
  maxAgeSec = 600
): string {
  const secure = origin.startsWith("https:") ? "; Secure" : "";
  return `${SOCIAL_OAUTH_COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}${secure}`;
}

export function clearOAuthCookieHeader(origin: string): string {
  const secure = origin.startsWith("https:") ? "; Secure" : "";
  return `${SOCIAL_OAUTH_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

export function readCookie(req: Request, name: string): string {
  const raw = req.headers.get("cookie") || "";
  for (const part of raw.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("=") || "");
  }
  return "";
}
