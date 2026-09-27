/**
 * Admin API gate — signed HttpOnly session cookie, plus optional
 * ADMIN_SETUP_SECRET for internal scripts.
 */

import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import {
  ADMIN_AUTH_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  LEGACY_ADMIN_AUTH_COOKIE,
  createAdminSessionToken,
  verifyAdminSessionToken,
} from "@/lib/admin-session-token";
import {
  getServerEnv,
  persistInternalEnv,
} from "@/lib/server/env-store";

export { ADMIN_AUTH_COOKIE };

export function timingSafeEqualString(a: string, b: string): boolean {
  const left = Buffer.from(String(a), "utf8");
  const right = Buffer.from(String(b), "utf8");
  if (left.length !== right.length) {
    const dummy = createHash("sha256").update(left).digest();
    timingSafeEqual(dummy, dummy);
    return false;
  }
  return timingSafeEqual(left, right);
}

export async function ensureAdminSessionSecret(): Promise<string> {
  const existing = (await getServerEnv("ADMIN_SESSION_SECRET")).trim();
  if (existing.length >= 32) return existing;
  const generated = randomBytes(32).toString("hex");
  await persistInternalEnv({ ADMIN_SESSION_SECRET: generated });
  return generated;
}

export async function resolveAdminCredentials(): Promise<{
  username: string;
  password: string;
}> {
  const username =
    (await getServerEnv("ADMIN_USERNAME")).trim() ||
    (await getServerEnv("NEXT_PUBLIC_ADMIN_USERNAME")).trim();
  const password =
    (await getServerEnv("ADMIN_PASSWORD")).trim() ||
    (await getServerEnv("NEXT_PUBLIC_ADMIN_PASSWORD")).trim();
  return { username, password };
}

export async function adminAuthCookieHeader(
  maxAgeSeconds = ADMIN_SESSION_MAX_AGE
): Promise<string> {
  const secret = await ensureAdminSessionSecret();
  const token = await createAdminSessionToken(secret, maxAgeSeconds);
  return `${ADMIN_AUTH_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAgeSeconds}`;
}

export function clearAdminAuthCookieHeader(): string {
  return `${ADMIN_AUTH_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export function clearLegacyAdminAuthCookieHeader(): string {
  return `${LEGACY_ADMIN_AUTH_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export function readAdminAuthToken(req: Request): string | null {
  return (
    readCookie(req, ADMIN_AUTH_COOKIE) ||
    readCookie(req, LEGACY_ADMIN_AUTH_COOKIE)
  );
}

export function readCookie(req: Request, name: string): string | null {
  const raw = req.headers.get("cookie") || "";
  const parts = raw.split(";");
  for (const part of parts) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return rest.join("=") || "";
  }
  return null;
}

function extractSetupSecret(req: Request): string {
  const custom = req.headers.get("x-admin-setup-secret")?.trim() || "";
  if (custom) return custom;
  const auth = req.headers.get("authorization")?.trim() || "";
  if (/^Bearer\s+/i.test(auth)) {
    return auth.replace(/^Bearer\s+/i, "").trim();
  }
  return "";
}

export async function isAdminRequest(req: Request): Promise<boolean> {
  return (await assertAdminApi(req)) === null;
}

export async function assertAdminApi(
  req: Request
): Promise<NextResponse | null> {
  const setupSecret = (await getServerEnv("ADMIN_SETUP_SECRET")).trim();
  const headerSecret = extractSetupSecret(req);
  if (
    setupSecret &&
    headerSecret &&
    timingSafeEqualString(headerSecret, setupSecret)
  ) {
    return null;
  }

  const token = readAdminAuthToken(req);
  if (token && token !== "1") {
    const secret = await ensureAdminSessionSecret();
    if (await verifyAdminSessionToken(secret, token)) return null;
  }

  return NextResponse.json(
    { ok: false, error: "Unauthorized — admin session required" },
    { status: 401 }
  );
}
