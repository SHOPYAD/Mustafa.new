import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { getServerEnv } from "@/lib/server/env-store";
import { resolveSitePublicUrl } from "@/lib/pocketbase/constants";

export const GOOGLE_ADS_SCOPE = "https://www.googleapis.com/auth/adwords";
export const GOOGLE_OAUTH_COOKIE = "ads_google_oauth";

async function signingSecret(): Promise<string> {
  const secret =
    (await getServerEnv("ADMIN_SESSION_SECRET")).trim() ||
    (await getServerEnv("GOOGLE_ADS_CLIENT_SECRET")).trim();
  return secret || "lonaliza-ads-oauth-dev";
}

export async function signOAuthState(payload: string): Promise<string> {
  const secret = await signingSecret();
  const body = Buffer.from(payload, "utf8").toString("base64url");
  const mac = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${mac}`;
}

export async function verifyOAuthState(token: string, cookie: string): Promise<boolean> {
  const a = String(token || "");
  const b = String(cookie || "");
  if (!a || !b || a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export async function googleAdsRedirectUri(): Promise<string> {
  const site = resolveSitePublicUrl(await getServerEnv("NEXT_PUBLIC_SITE_URL"));
  return `${site}/api/admin/ads/google/callback`;
}

export async function buildGoogleAdsAuthUrl(clientId: string): Promise<{
  url: string;
  state: string;
}> {
  const redirectUri = await googleAdsRedirectUri();
  const nonce = randomBytes(16).toString("hex");
  const state = await signOAuthState(`google:${nonce}:${Date.now()}`);
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: GOOGLE_ADS_SCOPE,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });
  return {
    url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    state,
  };
}

export async function exchangeGoogleAdsCode(input: {
  code: string;
  clientId: string;
  clientSecret: string;
}): Promise<{ refresh_token?: string; access_token?: string; error?: string }> {
  const redirectUri = await googleAdsRedirectUri();
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: input.code,
      client_id: input.clientId,
      client_secret: input.clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    refresh_token?: string;
    access_token?: string;
    error?: string;
    error_description?: string;
  };
  if (!res.ok) {
    return { error: data.error_description || data.error || `google_oauth_${res.status}` };
  }
  return { refresh_token: data.refresh_token, access_token: data.access_token };
}

export function oauthCookieHeader(name: string, value: string, maxAge = 600): string {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}; Secure`;
}
