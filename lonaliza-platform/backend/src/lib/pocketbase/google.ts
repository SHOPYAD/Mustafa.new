import { randomBytes } from "crypto";
import { getServerEnv } from "@/lib/server/env-store";
import {
  createAdminPocketBase,
  upsertUsersGoogleProvider,
} from "@/lib/pocketbase/admin";
import type { CustomerUser } from "@/lib/pocketbase/auth";

export const GOOGLE_FAIL_REASONS = [
  "google_denied",
  "google_expired",
  "google_failed",
  "google_disabled",
  "google_config",
  "access_denied",
] as const;

export type GoogleFailReason = (typeof GOOGLE_FAIL_REASONS)[number];

const FAIL_REASON_SET = new Set<string>(GOOGLE_FAIL_REASONS);

export function safeGoogleFailReason(raw: string): GoogleFailReason {
  const value = raw.trim().toLowerCase();
  if (FAIL_REASON_SET.has(value)) return value as GoogleFailReason;
  return "google_failed";
}

export function googleFailRedirectPath(reason: string): string {
  const safe = safeGoogleFailReason(reason);
  return `/account?auth-google-failed&reason=${encodeURIComponent(safe)}`;
}

export function safeOAuthNextPath(raw: string): string {
  const next = raw.trim() || "/account";
  if (!next.startsWith("/") || next.startsWith("//")) return "/account";
  if (next === "/") return "/account";
  return next;
}

export async function getGoogleOAuthCredentials(): Promise<{
  clientId: string;
  clientSecret: string;
}> {
  const clientId = (await getServerEnv("POCKETBASE_GOOGLE_CLIENT_ID")).trim();
  const clientSecret = (
    await getServerEnv("POCKETBASE_GOOGLE_CLIENT_SECRET")
  ).trim();
  return { clientId, clientSecret };
}

export async function isGoogleAuthEnabled(): Promise<boolean> {
  const enabled = (await getServerEnv("POCKETBASE_GOOGLE_ENABLED"))
    .trim()
    .toLowerCase();
  const { clientId, clientSecret } = await getGoogleOAuthCredentials();
  return (
    (enabled === "true" || enabled === "1" || enabled === "yes") &&
    Boolean(clientId) &&
    Boolean(clientSecret)
  );
}

export async function getGoogleOAuthClientId(): Promise<string> {
  return (await getGoogleOAuthCredentials()).clientId;
}

/** Write env-store Google keys into users.oauth2 and enable the provider. */
export async function ensureUsersGoogleProviderFromEnv(): Promise<{
  ok: boolean;
  enabled: boolean;
  error?: string;
}> {
  const { clientId, clientSecret } = await getGoogleOAuthCredentials();
  if (!clientId || !clientSecret) {
    return { ok: true, enabled: false };
  }
  const synced = await upsertUsersGoogleProvider({
    enabled: true,
    clientId,
    clientSecret,
  });
  return {
    ok: synced.ok,
    enabled: synced.ok,
    error: synced.error,
  };
}

export function redactAuthLog(value: string): string {
  return value
    .replace(/GOCSPX-[A-Za-z0-9_-]+/g, "[secret]")
    .replace(/ya29\.[A-Za-z0-9._-]+/g, "[token]")
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "[email]")
    .replace(/(code|client_secret|access_token|id_token|refresh_token)=[^&\s]+/gi, "$1=[redacted]")
    .replace(/[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, "[jwt]");
}

export function logGoogleAuthError(stage: string, err: unknown): void {
  const e = err as {
    message?: string;
    status?: number;
    response?: { message?: string; code?: number };
  };
  const message = redactAuthLog(String(e?.message || err || "unknown"));
  const pbMessage = redactAuthLog(String(e?.response?.message || ""));
  console.error("[auth-google]", stage, {
    status: e?.status || e?.response?.code || 0,
    message,
    pb: pbMessage,
  });
}

type GoogleTokenResponse = {
  access_token?: string;
  id_token?: string;
  token_type?: string;
};

type GoogleUserInfo = {
  sub?: string;
  email?: string;
  name?: string;
  email_verified?: boolean;
};

async function exchangeGoogleCode(opts: {
  code: string;
  verifier: string;
  redirectUri: string;
  clientId: string;
  clientSecret: string;
}): Promise<GoogleTokenResponse> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: opts.code,
      client_id: opts.clientId,
      client_secret: opts.clientSecret,
      redirect_uri: opts.redirectUri,
      grant_type: "authorization_code",
      code_verifier: opts.verifier,
    }),
  });
  const data = (await res.json()) as GoogleTokenResponse & { error?: string; error_description?: string };
  if (!res.ok || !data.access_token) {
    throw new Error(
      `google_token ${res.status} ${data.error || "exchange_failed"}`
    );
  }
  return data;
}

async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const res = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = (await res.json()) as GoogleUserInfo;
  if (!res.ok || !data.email) {
    throw new Error(`google_userinfo ${res.status}`);
  }
  return data;
}

export async function authWithGoogleCode(opts: {
  code: string;
  verifier: string;
  redirectUri: string;
}): Promise<{ token: string; user: CustomerUser }> {
  const { clientId, clientSecret } = await getGoogleOAuthCredentials();
  if (!clientId || !clientSecret) {
    throw new Error("google_config");
  }

  const tokens = await exchangeGoogleCode({
    code: opts.code,
    verifier: opts.verifier,
    redirectUri: opts.redirectUri,
    clientId,
    clientSecret,
  });
  const profile = await fetchGoogleUserInfo(tokens.access_token || "");
  const email = String(profile.email || "").trim().toLowerCase();
  const name = String(profile.name || "").trim() || email.split("@")[0] || "Customer";
  if (!email) throw new Error("google_userinfo_email");

  const admin = await createAdminPocketBase();
  let record: { id: string; email?: string; name?: string };
  try {
    record = await admin
      .collection("users")
      .getFirstListItem(`email="${email.replace(/"/g, "")}"`);
    if (!record.name && name) {
      try {
        record = await admin.collection("users").update(record.id, { name });
      } catch {
        /* keep existing */
      }
    }
  } catch {
    const password = randomBytes(24).toString("base64url");
    record = await admin.collection("users").create({
      email,
      password,
      passwordConfirm: password,
      name,
      emailVisibility: false,
      verified: Boolean(profile.email_verified),
    });
  }

  const impersonated = await admin
    .collection("users")
    .impersonate(record.id, 0);
  const store = impersonated.authStore as {
    token: string;
    record?: { id: string; email?: string; name?: string };
    model?: { id: string; email?: string; name?: string };
  };
  const token = store.token;
  const model = store.record || store.model;
  if (!token || !model?.id) {
    throw new Error("google_impersonate");
  }

  return {
    token,
    user: {
      id: model.id,
      email: String(model.email || email),
      name: String(model.name || name),
    },
  };
}
