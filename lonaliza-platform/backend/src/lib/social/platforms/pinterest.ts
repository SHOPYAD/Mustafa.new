import {
  getPinterestSocialEnv,
  isPinterestConfigured,
  oauthRedirectUri,
  PINTEREST_SCOPES,
  resolveSocialOrigin,
} from "../env";
import { fetchJsonWithRetry, SocialHttpError } from "../http";
import { expiresAtFromSeconds, upsertPublishOAuthChannel } from "../publish-channel-connect";
import type { PublishChannel } from "@/lib/publish/types";

const PIN_AUTH = "https://www.pinterest.com/oauth/";
const PIN_TOKEN = "https://api.pinterest.com/v5/oauth/token";
const PIN_API = "https://api.pinterest.com/v5";

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  error?: string;
  message?: string;
};

function basicAuth(id: string, secret: string): string {
  return `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`;
}

export async function buildPinterestAuthorizeUrl(req: Request, state: string): Promise<string> {
  const env = await getPinterestSocialEnv();
  if (!isPinterestConfigured(env)) {
    throw new SocialHttpError("مفاتيح بنترست غير مهيأة (PINTEREST_CLIENT_ID / SECRET)", 400, false);
  }
  const origin = await resolveSocialOrigin(req);
  const params = new URLSearchParams({
    client_id: env.clientId,
    redirect_uri: oauthRedirectUri(origin, "pinterest"),
    response_type: "code",
    scope: PINTEREST_SCOPES.join(","),
    state,
  });
  return `${PIN_AUTH}?${params.toString()}`;
}

export async function completePinterestOAuth(req: Request, code: string): Promise<PublishChannel> {
  const env = await getPinterestSocialEnv();
  if (!isPinterestConfigured(env)) {
    throw new SocialHttpError("مفاتيح بنترست غير مهيأة", 400, false);
  }
  const origin = await resolveSocialOrigin(req);
  const token = await fetchJsonWithRetry<TokenResponse>(PIN_TOKEN, {
    method: "POST",
    headers: {
      Authorization: basicAuth(env.clientId, env.clientSecret),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: oauthRedirectUri(origin, "pinterest"),
      continuous_refresh: "true",
    }).toString(),
  });
  if (!token.access_token) {
    throw new SocialHttpError(token.message || token.error || "فشل تبادل رمز بنترست", 400, false, token);
  }
  const me = await fetchJsonWithRetry<{
    username?: string;
    id?: string;
    profile_image?: string;
    business_name?: string;
    message?: string;
  }>(`${PIN_API}/user_account`, {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  const username = (me.username || "").trim();
  if (!username && !me.id) {
    throw new SocialHttpError(me.message || "تعذر قراءة حساب بنترست", 400, false, me);
  }
  return upsertPublishOAuthChannel({
    provider: "pinterest",
    name: me.business_name || username || "Pinterest",
    picture: me.profile_image,
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    tokenExpiresAt: expiresAtFromSeconds(token.expires_in),
    extra: {
      externalId: me.id || username,
      username,
      scopes: (token.scope || "").split(/[ ,]+/).filter(Boolean),
    },
  });
}
