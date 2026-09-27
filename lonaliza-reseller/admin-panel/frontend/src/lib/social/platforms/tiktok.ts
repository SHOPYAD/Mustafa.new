import {
  getTikTokSocialEnv,
  isTikTokConfigured,
  oauthRedirectUri,
  resolveSocialOrigin,
  TIKTOK_SCOPES,
} from "../env";
import { fetchJsonWithRetry, SocialHttpError } from "../http";
import { splitMedia } from "../media";
import {
  isTokenExpired,
  patchStoredAccount,
  upsertStoredAccount,
} from "../token-store";
import type {
  PublishError,
  PublishPlatformResult,
  PublishToConnectedAccountsInput,
  StoredSocialAccount,
} from "../types";

type TikTokTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  refresh_expires_in?: number;
  open_id?: string;
  scope?: string;
  error?: string;
  error_description?: string;
  message?: string;
};

type TikTokUserResponse = {
  data?: {
    user?: {
      open_id?: string;
      display_name?: string;
      avatar_url?: string;
      username?: string;
    };
  };
  error?: { code?: string; message?: string };
};

type TikTokPublishResponse = {
  data?: {
    publish_id?: string;
    upload_url?: string;
  };
  error?: { code?: string; message?: string };
};

const TIKTOK_AUTH = "https://www.tiktok.com/v2/auth/authorize/";
const TIKTOK_TOKEN = "https://open.tiktokapis.com/v2/oauth/token/";
const TIKTOK_USER = "https://open.tiktokapis.com/v2/user/info/";
const TIKTOK_VIDEO_INIT = "https://open.tiktokapis.com/v2/post/publish/video/init/";
const TIKTOK_PHOTO_INIT = "https://open.tiktokapis.com/v2/post/publish/content/init/";

export const TIKTOK_APP_REQUIRED: PublishError = {
  code: "tiktok_app_required",
  message:
    "يحتاج تطبيق تيك توك (TikTok Content Posting API). عيّن TIKTOK_CLIENT_KEY و TIKTOK_CLIENT_SECRET — لن يُنفَّذ نشر وهمي.",
};

function expiresAtFromSeconds(seconds?: number): string | undefined {
  if (!seconds || !Number.isFinite(seconds)) return undefined;
  return new Date(Date.now() + seconds * 1000).toISOString();
}

export async function tiktokConfigured(): Promise<boolean> {
  return isTikTokConfigured(await getTikTokSocialEnv());
}

export async function buildTikTokAuthorizeUrl(
  req: Request,
  state: string
): Promise<string> {
  const env = await getTikTokSocialEnv();
  if (!isTikTokConfigured(env)) {
    throw new SocialHttpError(TIKTOK_APP_REQUIRED.message, 400, false);
  }
  const origin = await resolveSocialOrigin(req);
  const params = new URLSearchParams({
    client_key: env.clientKey,
    redirect_uri: oauthRedirectUri(origin, "tiktok"),
    response_type: "code",
    scope: TIKTOK_SCOPES.join(","),
    state,
  });
  return `${TIKTOK_AUTH}?${params.toString()}`;
}

async function tokenRequest(
  fields: Record<string, string>
): Promise<TikTokTokenResponse> {
  return fetchJsonWithRetry<TikTokTokenResponse>(TIKTOK_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(fields).toString(),
  });
}

export async function completeTikTokOAuth(
  req: Request,
  code: string
): Promise<StoredSocialAccount> {
  const env = await getTikTokSocialEnv();
  if (!isTikTokConfigured(env)) {
    throw new SocialHttpError(TIKTOK_APP_REQUIRED.message, 400, false);
  }
  const origin = await resolveSocialOrigin(req);
  const token = await tokenRequest({
    client_key: env.clientKey,
    client_secret: env.clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: oauthRedirectUri(origin, "tiktok"),
  });
  if (!token.access_token) {
    throw new SocialHttpError(
      token.error_description || token.error || token.message || "فشل تبادل رمز تيك توك",
      400,
      false,
      token
    );
  }

  let displayName = "TikTok";
  let username: string | undefined;
  let openId = token.open_id || "";
  try {
    const user = await fetchJsonWithRetry<TikTokUserResponse>(
      `${TIKTOK_USER}?fields=open_id,display_name,avatar_url,username`,
      { headers: { Authorization: `Bearer ${token.access_token}` } }
    );
    openId = user.data?.user?.open_id || openId;
    displayName = user.data?.user?.display_name || displayName;
    username = user.data?.user?.username;
  } catch {
    /* token.open_id is enough */
  }
  if (!openId) {
    throw new SocialHttpError("تيك توك لم يُرجع open_id", 400, false);
  }

  return upsertStoredAccount({
    platform: "tiktok",
    displayName,
    username,
    externalId: openId,
    scopes: token.scope ? token.scope.split(/[,\s]+/).filter(Boolean) : [...TIKTOK_SCOPES],
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    tokenExpiresAt: expiresAtFromSeconds(token.expires_in),
    status: "connected",
    lastError: undefined,
  });
}

export async function refreshTikTokAccount(
  account: StoredSocialAccount
): Promise<StoredSocialAccount> {
  const env = await getTikTokSocialEnv();
  if (!isTikTokConfigured(env) || !account.refreshToken) {
    await patchStoredAccount(account.id, {
      status: "needs_reauth",
      lastError: TIKTOK_APP_REQUIRED.message,
    });
    throw new SocialHttpError("يحتاج إعادة تحقق لتيك توك", 401, false);
  }
  try {
    const token = await tokenRequest({
      client_key: env.clientKey,
      client_secret: env.clientSecret,
      grant_type: "refresh_token",
      refresh_token: account.refreshToken,
    });
    if (!token.access_token) {
      throw new SocialHttpError("تعذر تجديد رمز تيك توك", 401, false, token);
    }
    const next = await patchStoredAccount(account.id, {
      accessToken: token.access_token,
      refreshToken: token.refresh_token || account.refreshToken,
      tokenExpiresAt: expiresAtFromSeconds(token.expires_in),
      lastRefreshedAt: new Date().toISOString(),
      status: "connected",
      lastError: undefined,
    });
    return next || account;
  } catch (err) {
    const message = err instanceof Error ? err.message : "فشل تجديد رمز تيك توك";
    await patchStoredAccount(account.id, {
      status: "needs_reauth",
      lastError: message,
    });
    throw err;
  }
}

async function ensureFreshTikTok(
  account: StoredSocialAccount
): Promise<StoredSocialAccount> {
  if (account.status === "needs_reauth") {
    throw new SocialHttpError("الحساب يحتاج إعادة تحقق", 401, false);
  }
  if (isTokenExpired(account) || !account.accessToken) {
    return refreshTikTokAccount(account);
  }
  return account;
}

export async function publishTikTok(
  account: StoredSocialAccount,
  input: PublishToConnectedAccountsInput
): Promise<PublishPlatformResult> {
  if (!(await tiktokConfigured())) {
    return { ok: false, platform: "tiktok", error: TIKTOK_APP_REQUIRED };
  }

  const fresh = await ensureFreshTikTok(account);
  const { images, videos } = splitMedia(input.mediaUrls);
  const title = (input.title || input.caption).trim().slice(0, 150);
  const description = input.caption.trim().slice(0, 2200);

  if (videos.length > 0) {
    const created = await fetchJsonWithRetry<TikTokPublishResponse>(
      TIKTOK_VIDEO_INIT,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${fresh.accessToken}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
          post_info: {
            title,
            privacy_level: "PUBLIC_TO_EVERYONE",
            disable_duet: false,
            disable_comment: false,
            disable_stitch: false,
          },
          source_info: {
            source: "PULL_FROM_URL",
            video_url: videos[0],
          },
        }),
      }
    );
    const publishId = created.data?.publish_id;
    if (!publishId) {
      throw new SocialHttpError(
        created.error?.message || "فشل بدء نشر فيديو تيك توك",
        400,
        false,
        created
      );
    }
    return { ok: true, platform: "tiktok", postId: publishId };
  }

  if (images.length > 0) {
    const created = await fetchJsonWithRetry<TikTokPublishResponse>(
      TIKTOK_PHOTO_INIT,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${fresh.accessToken}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
          post_info: {
            title,
            description,
            privacy_level: "PUBLIC_TO_EVERYONE",
          },
          source_info: {
            source: "PULL_FROM_URL",
            photo_cover_index: 0,
            photo_images: images.slice(0, 35),
          },
          post_mode: "DIRECT_POST",
          media_type: "PHOTO",
        }),
      }
    );
    const publishId = created.data?.publish_id;
    if (!publishId) {
      throw new SocialHttpError(
        created.error?.message || "فشل بدء نشر صور تيك توك",
        400,
        false,
        created
      );
    }
    return { ok: true, platform: "tiktok", postId: publishId };
  }

  return {
    ok: false,
    platform: "tiktok",
    error: {
      code: "unsupported_media",
      message: "تيك توك يحتاج صورة أو فيديو عاماً",
    },
  };
}
