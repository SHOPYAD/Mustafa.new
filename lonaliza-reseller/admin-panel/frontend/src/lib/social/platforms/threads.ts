import {
  getThreadsSocialEnv,
  isThreadsConfigured,
  oauthRedirectUri,
  resolveSocialOrigin,
  THREADS_SCOPES,
} from "../env";
import { fetchFormJson, fetchJsonWithRetry, SocialHttpError } from "../http";
import { expiresAtFromSeconds, upsertPublishOAuthChannel } from "../publish-channel-connect";
import type { PublishChannel } from "@/lib/publish/types";

const THREADS_AUTH = "https://threads.net/oauth/authorize";
const THREADS_TOKEN = "https://graph.threads.net/oauth/access_token";
const THREADS_LL = "https://graph.threads.net/access_token";
const THREADS_GRAPH = "https://graph.threads.net/v1.0";

type TokenResponse = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  error?: { message?: string } | string;
  error_message?: string;
};

export async function buildThreadsAuthorizeUrl(req: Request, state: string): Promise<string> {
  const env = await getThreadsSocialEnv();
  if (!isThreadsConfigured(env)) {
    throw new SocialHttpError("مفاتيح ثريدز غير مهيأة (THREADS_APP_ID / SECRET)", 400, false);
  }
  const origin = await resolveSocialOrigin(req);
  const params = new URLSearchParams({
    client_id: env.clientId,
    redirect_uri: oauthRedirectUri(origin, "threads"),
    scope: THREADS_SCOPES.join(","),
    response_type: "code",
    state,
  });
  return `${THREADS_AUTH}?${params.toString()}`;
}

export async function completeThreadsOAuth(req: Request, code: string): Promise<PublishChannel> {
  const env = await getThreadsSocialEnv();
  if (!isThreadsConfigured(env)) {
    throw new SocialHttpError("مفاتيح ثريدز غير مهيأة", 400, false);
  }
  const origin = await resolveSocialOrigin(req);
  const short = await fetchFormJson<TokenResponse>(THREADS_TOKEN, {
    client_id: env.clientId,
    client_secret: env.clientSecret,
    grant_type: "authorization_code",
    redirect_uri: oauthRedirectUri(origin, "threads"),
    code,
  });
  if (!short.access_token) {
    const message =
      (typeof short.error === "object" && short.error?.message) ||
      (typeof short.error === "string" ? short.error : "") ||
      short.error_message ||
      "فشل تبادل رمز ثريدز";
    throw new SocialHttpError(message, 400, false, short);
  }

  let accessToken = short.access_token;
  let expiresAt = expiresAtFromSeconds(short.expires_in);
  try {
    const longLived = await fetchJsonWithRetry<TokenResponse>(
      `${THREADS_LL}?grant_type=th_exchange_token&client_secret=${encodeURIComponent(env.clientSecret)}&access_token=${encodeURIComponent(short.access_token)}`
    );
    if (longLived.access_token) {
      accessToken = longLived.access_token;
      expiresAt =
        expiresAtFromSeconds(longLived.expires_in) ||
        new Date(Date.now() + 58 * 24 * 60 * 60 * 1000).toISOString();
    }
  } catch {
    /* short-lived token still usable until refresh */
  }

  const me = await fetchJsonWithRetry<{
    id?: string;
    username?: string;
    name?: string;
    threads_profile_picture_url?: string;
    error?: { message?: string };
  }>(`${THREADS_GRAPH}/me?fields=id,username,name,threads_profile_picture_url&access_token=${encodeURIComponent(accessToken)}`);
  if (!me.id) {
    throw new SocialHttpError(me.error?.message || "تعذر قراءة حساب ثريدز", 400, false, me);
  }

  return upsertPublishOAuthChannel({
    provider: "threads",
    name: me.name || me.username || "Threads",
    picture: me.threads_profile_picture_url,
    accessToken,
    refreshToken: accessToken,
    tokenExpiresAt: expiresAt,
    extra: {
      externalId: me.id,
      username: me.username,
      instagramUserId: me.id,
      scopes: [...THREADS_SCOPES],
    },
  });
}
