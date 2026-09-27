import { randomBytes } from "crypto";
import { getServerEnv } from "@/lib/server/env-store";
import { resolveSitePublicUrl } from "@/lib/pocketbase/constants";
import { signOAuthState, oauthCookieHeader } from "../google/oauth";

export const META_OAUTH_COOKIE = "ads_meta_oauth";
export const META_ADS_SCOPES = [
  "ads_management",
  "ads_read",
  "pages_read_engagement",
  "pages_show_list",
  "business_management",
].join(",");

export { oauthCookieHeader };

export async function metaAdsRedirectUri(): Promise<string> {
  const site = resolveSitePublicUrl(await getServerEnv("NEXT_PUBLIC_SITE_URL"));
  return `${site}/api/admin/ads/meta/callback`;
}

export async function buildMetaAdsAuthUrl(appId: string): Promise<{ url: string; state: string }> {
  const redirectUri = await metaAdsRedirectUri();
  const nonce = randomBytes(16).toString("hex");
  const state = await signOAuthState(`meta:${nonce}:${Date.now()}`);
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: META_ADS_SCOPES,
    state,
  });
  return {
    url: `https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`,
    state,
  };
}

export async function exchangeMetaAdsCode(input: {
  code: string;
  appId: string;
  appSecret: string;
}): Promise<{ access_token?: string; error?: string }> {
  const redirectUri = await metaAdsRedirectUri();
  const shortRes = await fetch(
    `https://graph.facebook.com/v21.0/oauth/access_token?${new URLSearchParams({
      client_id: input.appId,
      client_secret: input.appSecret,
      redirect_uri: redirectUri,
      code: input.code,
    }).toString()}`
  );
  const short = (await shortRes.json().catch(() => ({}))) as {
    access_token?: string;
    error?: { message?: string };
  };
  if (!shortRes.ok || !short.access_token) {
    return { error: short.error?.message || `meta_oauth_${shortRes.status}` };
  }

  const longRes = await fetch(
    `https://graph.facebook.com/v21.0/oauth/access_token?${new URLSearchParams({
      grant_type: "fb_exchange_token",
      client_id: input.appId,
      client_secret: input.appSecret,
      fb_exchange_token: short.access_token,
    }).toString()}`
  );
  const longTok = (await longRes.json().catch(() => ({}))) as { access_token?: string };
  return { access_token: longTok.access_token || short.access_token };
}

export async function fetchMetaAdAccounts(accessToken: string): Promise<
  Array<{ id: string; name?: string }>
> {
  const res = await fetch(
    `https://graph.facebook.com/v21.0/me/adaccounts?fields=id,name,account_id&limit=25&access_token=${encodeURIComponent(accessToken)}`
  );
  const data = (await res.json().catch(() => ({}))) as {
    data?: Array<{ id?: string; account_id?: string; name?: string }>;
  };
  return (data.data || []).map((row) => ({
    id: String(row.account_id || row.id || "").replace(/^act_/i, ""),
    name: row.name,
  }));
}
