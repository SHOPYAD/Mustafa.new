import {
  getYoutubeSocialEnv,
  isYoutubeConfigured,
  oauthRedirectUri,
  resolveSocialOrigin,
  YOUTUBE_SCOPES,
} from "../env";
import {
  fetchFormJson,
  fetchJsonWithRetry,
  fetchWithRetry,
  SocialHttpError,
} from "../http";
import { splitMedia } from "../media";
import {
  isTokenExpired,
  patchStoredAccount,
  upsertStoredAccount,
} from "../token-store";
import type {
  PublishPlatformResult,
  PublishToConnectedAccountsInput,
  StoredSocialAccount,
} from "../types";

type GoogleTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
  error?: string;
  error_description?: string;
};

type YoutubeChannelList = {
  items?: Array<{
    id?: string;
    snippet?: { title?: string; customUrl?: string };
  }>;
  error?: { message?: string };
};

type YoutubeVideoInsert = {
  id?: string;
  error?: { message?: string };
};

const GOOGLE_AUTH = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN = "https://oauth2.googleapis.com/token";
const YOUTUBE_API = "https://www.googleapis.com/youtube/v3";
const YOUTUBE_UPLOAD = "https://www.googleapis.com/upload/youtube/v3/videos";
const MAX_VIDEO_BYTES = 256 * 1024 * 1024;

function expiresAtFromSeconds(seconds?: number): string | undefined {
  if (!seconds || !Number.isFinite(seconds)) return undefined;
  return new Date(Date.now() + seconds * 1000).toISOString();
}

export async function buildYoutubeAuthorizeUrl(
  req: Request,
  state: string
): Promise<string> {
  const env = await getYoutubeSocialEnv();
  if (!isYoutubeConfigured(env)) {
    throw new SocialHttpError(
      "مفاتيح يوتيوب غير مهيأة (GOOGLE_YOUTUBE_CLIENT_ID / SECRET)",
      400,
      false
    );
  }
  const origin = await resolveSocialOrigin(req);
  const params = new URLSearchParams({
    client_id: env.clientId,
    redirect_uri: oauthRedirectUri(origin, "youtube"),
    response_type: "code",
    scope: YOUTUBE_SCOPES.join(" "),
    state,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
  });
  return `${GOOGLE_AUTH}?${params.toString()}`;
}

export async function completeYoutubeOAuth(
  req: Request,
  code: string
): Promise<StoredSocialAccount> {
  const env = await getYoutubeSocialEnv();
  const origin = await resolveSocialOrigin(req);
  const token = await fetchFormJson<GoogleTokenResponse>(GOOGLE_TOKEN, {
    client_id: env.clientId,
    client_secret: env.clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: oauthRedirectUri(origin, "youtube"),
  });
  if (!token.access_token) {
    throw new SocialHttpError(
      token.error_description || token.error || "فشل تبادل رمز يوتيوب",
      400,
      false,
      token
    );
  }

  const channels = await fetchJsonWithRetry<YoutubeChannelList>(
    `${YOUTUBE_API}/channels?part=snippet&mine=true`,
    { headers: { Authorization: `Bearer ${token.access_token}` } }
  );
  const channel = channels.items?.[0];
  if (!channel?.id) {
    throw new SocialHttpError(
      "لا توجد قناة يوتيوب مرتبطة بهذا الحساب",
      400,
      false,
      channels
    );
  }

  return upsertStoredAccount({
    platform: "youtube",
    displayName: channel.snippet?.title || "YouTube",
    username: channel.snippet?.customUrl,
    externalId: channel.id,
    scopes: token.scope ? token.scope.split(/[ ,]+/).filter(Boolean) : [...YOUTUBE_SCOPES],
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    tokenExpiresAt: expiresAtFromSeconds(token.expires_in),
    status: "connected",
    lastError: undefined,
  });
}

export async function refreshYoutubeAccount(
  account: StoredSocialAccount
): Promise<StoredSocialAccount> {
  const env = await getYoutubeSocialEnv();
  if (!isYoutubeConfigured(env) || !account.refreshToken) {
    await patchStoredAccount(account.id, {
      status: "needs_reauth",
      lastError: "لا يوجد refresh token ليوتيوب",
    });
    throw new SocialHttpError("يحتاج إعادة تحقق ليوتيوب", 401, false);
  }
  try {
    const token = await fetchFormJson<GoogleTokenResponse>(GOOGLE_TOKEN, {
      client_id: env.clientId,
      client_secret: env.clientSecret,
      refresh_token: account.refreshToken,
      grant_type: "refresh_token",
    });
    if (!token.access_token) {
      throw new SocialHttpError(
        token.error_description || "تعذر تجديد رمز يوتيوب",
        401,
        false,
        token
      );
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
    const message = err instanceof Error ? err.message : "فشل تجديد رمز يوتيوب";
    await patchStoredAccount(account.id, {
      status: "needs_reauth",
      lastError: message,
    });
    throw err;
  }
}

async function ensureFreshYoutube(
  account: StoredSocialAccount
): Promise<StoredSocialAccount> {
  if (account.status === "needs_reauth") {
    throw new SocialHttpError("الحساب يحتاج إعادة تحقق", 401, false);
  }
  if (isTokenExpired(account) || !account.accessToken) {
    return refreshYoutubeAccount(account);
  }
  return account;
}

async function downloadVideo(url: string): Promise<{
  buffer: Buffer;
  contentType: string;
}> {
  const res = await fetchWithRetry(url, { method: "GET" }, { timeoutMs: 120_000 });
  if (!res.ok) {
    throw new SocialHttpError(`تعذر تنزيل فيديو يوتيوب (${res.status})`, res.status, true);
  }
  const length = Number(res.headers.get("content-length") || 0);
  if (length > MAX_VIDEO_BYTES) {
    throw new SocialHttpError("حجم فيديو يوتيوب أكبر من 256MB", 400, false);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.byteLength > MAX_VIDEO_BYTES) {
    throw new SocialHttpError("حجم فيديو يوتيوب أكبر من 256MB", 400, false);
  }
  const contentType = res.headers.get("content-type") || "video/mp4";
  return { buffer, contentType: contentType.split(";")[0] || "video/mp4" };
}

export async function publishYoutube(
  account: StoredSocialAccount,
  input: PublishToConnectedAccountsInput
): Promise<PublishPlatformResult> {
  const fresh = await ensureFreshYoutube(account);
  const { videos } = splitMedia(input.mediaUrls);
  if (videos.length === 0) {
    return {
      ok: false,
      platform: "youtube",
      error: {
        code: "unsupported_media",
        message: "يوتيوب ينشر فيديو فقط — أرسل mediaUrls بصيغة mp4/mov/webm",
      },
    };
  }

  const title = (input.title || input.caption).trim().slice(0, 100) || "Alrayyan";
  const description = input.caption.trim().slice(0, 5000);
  const { buffer, contentType } = await downloadVideo(videos[0]);

  const init = await fetchWithRetry(
    `${YOUTUBE_UPLOAD}?uploadType=resumable&part=snippet,status`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${fresh.accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Length": String(buffer.byteLength),
        "X-Upload-Content-Type": contentType,
      },
      body: JSON.stringify({
        snippet: {
          title,
          description,
          categoryId: "19",
        },
        status: {
          privacyStatus: "public",
          selfDeclaredMadeForKids: false,
        },
      }),
    },
    { timeoutMs: 60_000 }
  );

  if (!init.ok) {
    const body = await init.text();
    throw new SocialHttpError(
      `فشل بدء رفع يوتيوب (${init.status})`,
      init.status,
      init.status >= 500,
      body
    );
  }

  const location = init.headers.get("location");
  if (!location) {
    throw new SocialHttpError("يوتيوب لم يُرجع رابط الرفع", 502, true);
  }

  const uploaded = await fetchWithRetry(
    location,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${fresh.accessToken}`,
        "Content-Type": contentType,
        "Content-Length": String(buffer.byteLength),
      },
      body: new Uint8Array(buffer),
    },
    { timeoutMs: 180_000, retries: 2 }
  );

  const payload = (await uploaded.json().catch(() => ({}))) as YoutubeVideoInsert;
  if (!uploaded.ok || !payload.id) {
    throw new SocialHttpError(
      payload.error?.message || "فشل رفع فيديو يوتيوب",
      uploaded.status,
      uploaded.status >= 500,
      payload
    );
  }

  return {
    ok: true,
    platform: "youtube",
    postId: payload.id,
    permalink: `https://www.youtube.com/watch?v=${payload.id}`,
  };
}
