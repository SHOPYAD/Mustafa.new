import { createHash, randomBytes } from "crypto";
import {
  getXSocialEnv,
  isXConfigured,
  oauthRedirectUri,
  resolveSocialOrigin,
  X_SCOPES,
} from "../env";
import { fetchJsonWithRetry, SocialHttpError } from "../http";
import { publishError } from "../errors";
import { isTokenExpired, patchStoredAccount, upsertStoredAccount } from "../token-store";
import type {
  PublishPlatformResult,
  PublishToConnectedAccountsInput,
  StoredSocialAccount,
} from "../types";

const X_AUTH = "https://twitter.com/i/oauth2/authorize";
const X_TOKEN = "https://api.twitter.com/2/oauth2/token";
const X_API = "https://api.twitter.com/2";

function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function createXPkce(): { verifier: string; challenge: string } {
  const verifier = b64url(randomBytes(32));
  const challenge = b64url(createHash("sha256").update(verifier).digest());
  return { verifier, challenge };
}

function basicAuth(id: string, secret: string): string {
  return `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`;
}

function expiresAtFromSeconds(seconds?: number): string | undefined {
  if (!seconds || !Number.isFinite(seconds)) return undefined;
  return new Date(Date.now() + seconds * 1000).toISOString();
}

export async function buildXAuthorizeUrl(
  req: Request,
  state: string,
  challenge: string
): Promise<string> {
  const env = await getXSocialEnv();
  if (!isXConfigured(env)) {
    throw new SocialHttpError("مفاتيح X غير مهيأة (X_CLIENT_ID / X_CLIENT_SECRET)", 400, false);
  }
  const origin = await resolveSocialOrigin(req);
  const params = new URLSearchParams({
    response_type: "code",
    client_id: env.clientId,
    redirect_uri: oauthRedirectUri(origin, "x"),
    scope: X_SCOPES.join(" "),
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });
  return `${X_AUTH}?${params.toString()}`;
}

export async function completeXOauth(
  req: Request,
  code: string,
  verifier: string
): Promise<StoredSocialAccount> {
  const env = await getXSocialEnv();
  if (!isXConfigured(env)) {
    throw new SocialHttpError("مفاتيح X غير مهيأة", 400, false);
  }
  const origin = await resolveSocialOrigin(req);
  const token = await fetchJsonWithRetry<{
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    scope?: string;
    error?: string;
    error_description?: string;
  }>(X_TOKEN, {
    method: "POST",
    headers: {
      Authorization: basicAuth(env.clientId, env.clientSecret),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: oauthRedirectUri(origin, "x"),
      code_verifier: verifier,
    }).toString(),
  });
  if (!token.access_token) {
    throw new SocialHttpError(token.error_description || token.error || "فشل تبادل رمز X", 400, false);
  }
  const me = await fetchJsonWithRetry<{
    data?: { id?: string; name?: string; username?: string };
    errors?: Array<{ message?: string }>;
  }>(`${X_API}/users/me`, {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  const user = me.data;
  if (!user?.id) {
    throw new SocialHttpError(me.errors?.[0]?.message || "تعذّر قراءة حساب X", 400, false);
  }
  return upsertStoredAccount({
    platform: "x",
    displayName: user.name || user.username || "X",
    username: user.username,
    externalId: user.id,
    scopes: (token.scope || "").split(" ").filter(Boolean),
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    tokenExpiresAt: expiresAtFromSeconds(token.expires_in),
    status: "connected",
  });
}

export async function refreshXAccount(account: StoredSocialAccount): Promise<StoredSocialAccount> {
  if (!account.refreshToken) {
    if (account.accessToken && !isTokenExpired(account)) return account;
    throw new SocialHttpError("حساب X يحتاج إعادة ربط", 401, false);
  }
  const env = await getXSocialEnv();
  const token = await fetchJsonWithRetry<{
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    error_description?: string;
  }>(X_TOKEN, {
    method: "POST",
    headers: {
      Authorization: basicAuth(env.clientId, env.clientSecret),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: account.refreshToken,
    }).toString(),
  });
  if (!token.access_token) {
    throw new SocialHttpError(token.error_description || "فشل تحديث رمز X", 401, false);
  }
  const next = await patchStoredAccount(account.id, {
    accessToken: token.access_token,
    refreshToken: token.refresh_token || account.refreshToken,
    tokenExpiresAt: expiresAtFromSeconds(token.expires_in),
    status: "connected",
    lastError: undefined,
    lastRefreshedAt: new Date().toISOString(),
  });
  if (!next) throw new SocialHttpError("تعذّر حفظ رمز X المحدّث", 500, false);
  return next;
}

export async function testXAccount(account: StoredSocialAccount): Promise<{ ok: boolean; error?: string }> {
  try {
    const fresh = isTokenExpired(account) ? await refreshXAccount(account) : account;
    const me = await fetchJsonWithRetry<{ data?: { id?: string }; errors?: Array<{ message?: string }> }>(
      `${X_API}/users/me`,
      { headers: { Authorization: `Bearer ${fresh.accessToken}` } }
    );
    if (!me.data?.id) return { ok: false, error: me.errors?.[0]?.message || "users/me failed" };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "x_test_failed" };
  }
}

export async function publishX(
  account: StoredSocialAccount,
  input: PublishToConnectedAccountsInput
): Promise<PublishPlatformResult> {
  try {
    const fresh = isTokenExpired(account) ? await refreshXAccount(account) : account;
    const text = [input.caption, input.mediaUrls[0]].filter(Boolean).join("\n").slice(0, 270);
    const res = await fetch(`${X_API}/tweets`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${fresh.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      data?: { id?: string };
      errors?: Array<{ message?: string }>;
      detail?: string;
    };
    if (!res.ok || !data.data?.id) {
      return {
        ok: false,
        platform: "x",
        error: publishError("publish_failed", data.errors?.[0]?.message || data.detail || `http_${res.status}`),
      };
    }
    return {
      ok: true,
      platform: "x",
      postId: data.data.id,
      permalink: `https://x.com/i/web/status/${data.data.id}`,
    };
  } catch (e) {
    return {
      ok: false,
      platform: "x",
      error: publishError("publish_failed", e instanceof Error ? e.message : "x_publish_failed"),
    };
  }
}
