import { getServerEnv } from "@/lib/server/env-store";
import type { SocialCredentialsStatus, SocialProvider } from "./types";

export const META_GRAPH_DEFAULT_VERSION = "v21.0";

export const META_SCOPES = [
  "pages_show_list",
  "pages_manage_posts",
  "pages_read_engagement",
  "instagram_basic",
  "instagram_content_publish",
  "business_management",
] as const;

export const YOUTUBE_SCOPES = [
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube.readonly",
] as const;

export const TIKTOK_SCOPES = [
  "user.info.basic",
  "video.upload",
  "video.publish",
] as const;

export const X_SCOPES = [
  "tweet.read",
  "tweet.write",
  "users.read",
  "offline.access",
] as const;

export type MetaSocialEnv = {
  appId: string;
  appSecret: string;
  graphVersion: string;
};

export type YoutubeSocialEnv = {
  clientId: string;
  clientSecret: string;
};

export type TikTokSocialEnv = {
  clientKey: string;
  clientSecret: string;
};

export type XSocialEnv = {
  clientId: string;
  clientSecret: string;
};

export async function getMetaSocialEnv(): Promise<MetaSocialEnv> {
  const version = (await getServerEnv("META_GRAPH_VERSION")).trim();
  return {
    appId: (await getServerEnv("META_APP_ID")).trim(),
    appSecret: (await getServerEnv("META_APP_SECRET")).trim(),
    graphVersion: version || META_GRAPH_DEFAULT_VERSION,
  };
}

export async function getYoutubeSocialEnv(): Promise<YoutubeSocialEnv> {
  const dedicatedId = (await getServerEnv("GOOGLE_YOUTUBE_CLIENT_ID")).trim();
  const dedicatedSecret = (
    await getServerEnv("GOOGLE_YOUTUBE_CLIENT_SECRET")
  ).trim();
  if (dedicatedId && dedicatedSecret) {
    return { clientId: dedicatedId, clientSecret: dedicatedSecret };
  }
  return {
    clientId: (await getServerEnv("POCKETBASE_GOOGLE_CLIENT_ID")).trim(),
    clientSecret: (await getServerEnv("POCKETBASE_GOOGLE_CLIENT_SECRET")).trim(),
  };
}

export async function getXSocialEnv(): Promise<XSocialEnv> {
  return {
    clientId: (await getServerEnv("X_CLIENT_ID")).trim() || (await getServerEnv("TWITTER_CLIENT_ID")).trim(),
    clientSecret:
      (await getServerEnv("X_CLIENT_SECRET")).trim() || (await getServerEnv("TWITTER_CLIENT_SECRET")).trim(),
  };
}

export async function getTikTokSocialEnv(): Promise<TikTokSocialEnv> {
  if (process.env.VITEST) {
    return {
      clientKey: (process.env.TIKTOK_CLIENT_KEY || "").trim(),
      clientSecret: (process.env.TIKTOK_CLIENT_SECRET || "").trim(),
    };
  }
  return {
    clientKey: (await getServerEnv("TIKTOK_CLIENT_KEY")).trim(),
    clientSecret: (await getServerEnv("TIKTOK_CLIENT_SECRET")).trim(),
  };
}

export function isMetaConfigured(env: MetaSocialEnv): boolean {
  return Boolean(env.appId && env.appSecret);
}

export function isYoutubeConfigured(env: YoutubeSocialEnv): boolean {
  return Boolean(env.clientId && env.clientSecret);
}

export function isTikTokConfigured(env: TikTokSocialEnv): boolean {
  return Boolean(env.clientKey && env.clientSecret);
}

export function isXConfigured(env: XSocialEnv): boolean {
  return Boolean(env.clientId && env.clientSecret);
}

export async function resolveSocialOrigin(req?: Request): Promise<string> {
  const configured = (await getServerEnv("NEXT_PUBLIC_SITE_URL"))
    .trim()
    .replace(/\/$/, "");
  if (configured && /^https?:\/\//i.test(configured)) {
    return configured;
  }
  if (req) {
    const host =
      req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
    const proto = req.headers.get("x-forwarded-proto") || "https";
    if (host) return `${proto}://${host}`.replace(/\/$/, "");
  }
  return "https://lonaliza.com";
}

export function oauthRedirectUri(origin: string, provider: SocialProvider): string {
  const slug = provider === "meta" ? "meta" : provider;
  return `${origin.replace(/\/$/, "")}/api/oauth/${slug}/callback`;
}

export async function getSocialCredentialsStatus(
  req?: Request
): Promise<SocialCredentialsStatus[]> {
  const origin = await resolveSocialOrigin(req);
  const meta = await getMetaSocialEnv();
  const youtube = await getYoutubeSocialEnv();
  const tiktok = await getTikTokSocialEnv();
  const x = await getXSocialEnv();

  const metaMissing = [
    !meta.appId ? "META_APP_ID" : "",
    !meta.appSecret ? "META_APP_SECRET" : "",
  ].filter(Boolean);

  const youtubeMissing = [
    !youtube.clientId ? "GOOGLE_YOUTUBE_CLIENT_ID" : "",
    !youtube.clientSecret ? "GOOGLE_YOUTUBE_CLIENT_SECRET" : "",
  ].filter(Boolean);

  const tiktokMissing = [
    !tiktok.clientKey ? "TIKTOK_CLIENT_KEY" : "",
    !tiktok.clientSecret ? "TIKTOK_CLIENT_SECRET" : "",
  ].filter(Boolean);

  return [
    {
      provider: "meta",
      configured: isMetaConfigured(meta),
      missing: metaMissing,
      redirectUri: oauthRedirectUri(origin, "meta"),
      scopes: [...META_SCOPES],
      noteAr:
        "تطبيق ميتا (فيسبوك + إنستغرام). فعّل instagram_content_publish وصفحة فيسبوك مرتبطة بحساب إنستغرام للأعمال.",
    },
    {
      provider: "youtube",
      configured: isYoutubeConfigured(youtube),
      missing: youtubeMissing,
      redirectUri: oauthRedirectUri(origin, "youtube"),
      scopes: [...YOUTUBE_SCOPES],
      noteAr:
        "عميل Google OAuth منفصل ليوتيوب، أو نفس POCKETBASE_GOOGLE_CLIENT_ID مع نطاق youtube.upload. تسجيل الدخول الإعلاني لـ Google من اختصاص ADS.",
    },
    {
      provider: "tiktok",
      configured: isTikTokConfigured(tiktok),
      missing: tiktokMissing,
      redirectUri: oauthRedirectUri(origin, "tiktok"),
      scopes: [...TIKTOK_SCOPES],
      noteAr:
        "يحتاج تطبيق تيك توك مع Content Posting API. بدون المفاتيح لا يُنفَّذ نشر وهمي.",
    },
    {
      provider: "x",
      configured: isXConfigured(x),
      missing: [
        !x.clientId ? "X_CLIENT_ID" : "",
        !x.clientSecret ? "X_CLIENT_SECRET" : "",
      ].filter(Boolean),
      redirectUri: oauthRedirectUri(origin, "x"),
      scopes: [...X_SCOPES],
      noteAr:
        "تطبيق X Developer Portal (OAuth 2.0). أضيفوا User authentication وRedirect URI أعلاه، ثم الصقوا Client ID/Secret.",
    },
  ];
}
