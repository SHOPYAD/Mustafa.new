import { getServerEnv } from "@/lib/server/env-store";
import { getOAuthApp, getTelegramBotTokenFromApps } from "./oauth-apps";
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

export const LINKEDIN_SCOPES = [
  "openid",
  "profile",
  "w_member_social",
  "r_basicprofile",
  "rw_organization_admin",
  "w_organization_social",
  "r_organization_social",
] as const;

export const THREADS_SCOPES = [
  "threads_basic",
  "threads_content_publish",
  "threads_manage_replies",
  "threads_manage_insights",
] as const;

export const PINTEREST_SCOPES = [
  "boards:read",
  "boards:write",
  "pins:read",
  "pins:write",
  "user_accounts:read",
] as const;

export const GMB_SCOPES = [
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/business.manage",
] as const;

export type LinkedInSocialEnv = { clientId: string; clientSecret: string };
export type ThreadsSocialEnv = { clientId: string; clientSecret: string };
export type PinterestSocialEnv = { clientId: string; clientSecret: string };
export type GmbSocialEnv = { clientId: string; clientSecret: string };

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

export async function getLinkedInSocialEnv(): Promise<LinkedInSocialEnv> {
  const fromEnv = {
    clientId: (await getServerEnv("LINKEDIN_CLIENT_ID")).trim() || (process.env.LINKEDIN_CLIENT_ID || "").trim(),
    clientSecret:
      (await getServerEnv("LINKEDIN_CLIENT_SECRET")).trim() || (process.env.LINKEDIN_CLIENT_SECRET || "").trim(),
  };
  if (fromEnv.clientId && fromEnv.clientSecret) return fromEnv;
  const stored = await getOAuthApp("linkedin");
  return stored || { clientId: "", clientSecret: "" };
}

export async function getThreadsSocialEnv(): Promise<ThreadsSocialEnv> {
  const fromEnv = {
    clientId: (await getServerEnv("THREADS_APP_ID")).trim() || (process.env.THREADS_APP_ID || "").trim(),
    clientSecret:
      (await getServerEnv("THREADS_APP_SECRET")).trim() || (process.env.THREADS_APP_SECRET || "").trim(),
  };
  if (fromEnv.clientId && fromEnv.clientSecret) return fromEnv;
  const stored = await getOAuthApp("threads");
  return stored || { clientId: "", clientSecret: "" };
}

export async function getPinterestSocialEnv(): Promise<PinterestSocialEnv> {
  const fromEnv = {
    clientId: (await getServerEnv("PINTEREST_CLIENT_ID")).trim() || (process.env.PINTEREST_CLIENT_ID || "").trim(),
    clientSecret:
      (await getServerEnv("PINTEREST_CLIENT_SECRET")).trim() ||
      (process.env.PINTEREST_CLIENT_SECRET || "").trim(),
  };
  if (fromEnv.clientId && fromEnv.clientSecret) return fromEnv;
  const stored = await getOAuthApp("pinterest");
  return stored || { clientId: "", clientSecret: "" };
}

export async function getGmbSocialEnv(): Promise<GmbSocialEnv> {
  const dedicated = {
    clientId: (await getServerEnv("GOOGLE_GMB_CLIENT_ID")).trim() || (process.env.GOOGLE_GMB_CLIENT_ID || "").trim(),
    clientSecret:
      (await getServerEnv("GOOGLE_GMB_CLIENT_SECRET")).trim() ||
      (process.env.GOOGLE_GMB_CLIENT_SECRET || "").trim(),
  };
  if (dedicated.clientId && dedicated.clientSecret) return dedicated;
  const stored = await getOAuthApp("gmb");
  if (stored) return stored;
  return getYoutubeSocialEnv();
}

export async function getTelegramBotToken(): Promise<string> {
  const fromEnv =
    (await getServerEnv("TELEGRAM_BOT_TOKEN")).trim() ||
    (process.env.TELEGRAM_BOT_TOKEN || "").trim() ||
    (process.env.TELEGRAM_TOKEN || "").trim();
  if (fromEnv) return fromEnv;
  const fromApps = await getTelegramBotTokenFromApps();
  if (fromApps) return fromApps;
  try {
    const { getCommsSettings } = await import("@/lib/automation/comms-settings");
    return ((await getCommsSettings()).telegramBotToken || "").trim();
  } catch {
    return "";
  }
}

export function isLinkedInConfigured(env: LinkedInSocialEnv): boolean {
  return Boolean(env.clientId && env.clientSecret);
}

export function isThreadsConfigured(env: ThreadsSocialEnv): boolean {
  return Boolean(env.clientId && env.clientSecret);
}

export function isPinterestConfigured(env: PinterestSocialEnv): boolean {
  return Boolean(env.clientId && env.clientSecret);
}

export function isGmbConfigured(env: GmbSocialEnv): boolean {
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
  if (provider === "telegram") {
    return `${origin.replace(/\/$/, "")}/api/oauth/telegram`;
  }
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
  const linkedin = await getLinkedInSocialEnv();
  const threads = await getThreadsSocialEnv();
  const pinterest = await getPinterestSocialEnv();
  const gmb = await getGmbSocialEnv();
  const telegramToken = await getTelegramBotToken();

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
    {
      provider: "linkedin",
      configured: isLinkedInConfigured(linkedin),
      missing: [
        !linkedin.clientId ? "LINKEDIN_CLIENT_ID" : "",
        !linkedin.clientSecret ? "LINKEDIN_CLIENT_SECRET" : "",
      ].filter(Boolean),
      redirectUri: oauthRedirectUri(origin, "linkedin"),
      scopes: [...LINKEDIN_SCOPES],
      noteAr: "تطبيق LinkedIn Marketing / Community Management. نفس المفاتيح للحساب الشخصي وصفحة الشركة.",
    },
    {
      provider: "linkedin-page",
      configured: isLinkedInConfigured(linkedin),
      missing: [
        !linkedin.clientId ? "LINKEDIN_CLIENT_ID" : "",
        !linkedin.clientSecret ? "LINKEDIN_CLIENT_SECRET" : "",
      ].filter(Boolean),
      redirectUri: oauthRedirectUri(origin, "linkedin-page"),
      scopes: [...LINKEDIN_SCOPES],
      noteAr: "بعد تسجيل الدخول تُختار صفحة الشركة (Organization) من صلاحيات rw_organization_admin.",
    },
    {
      provider: "threads",
      configured: isThreadsConfigured(threads),
      missing: [
        !threads.clientId ? "THREADS_APP_ID" : "",
        !threads.clientSecret ? "THREADS_APP_SECRET" : "",
      ].filter(Boolean),
      redirectUri: oauthRedirectUri(origin, "threads"),
      scopes: [...THREADS_SCOPES],
      noteAr: "تطبيق Threads من Meta for Developers (ليس تطبيق فيسبوك نفسه).",
    },
    {
      provider: "gmb",
      configured: isGmbConfigured(gmb),
      missing: [
        !gmb.clientId ? "GOOGLE_GMB_CLIENT_ID" : "",
        !gmb.clientSecret ? "GOOGLE_GMB_CLIENT_SECRET" : "",
      ].filter(Boolean),
      redirectUri: oauthRedirectUri(origin, "gmb"),
      scopes: [...GMB_SCOPES],
      noteAr: "Google Business Profile API. يمكن استخدام عميل يوتيوب إن أُضيف رابط إعادة التوجيه نفسه.",
    },
    {
      provider: "pinterest",
      configured: isPinterestConfigured(pinterest),
      missing: [
        !pinterest.clientId ? "PINTEREST_CLIENT_ID" : "",
        !pinterest.clientSecret ? "PINTEREST_CLIENT_SECRET" : "",
      ].filter(Boolean),
      redirectUri: oauthRedirectUri(origin, "pinterest"),
      scopes: [...PINTEREST_SCOPES],
      noteAr: "Pinterest API v5 — صلاحيات اللوحات والدبابيس.",
    },
    {
      provider: "telegram",
      configured: Boolean(telegramToken),
      missing: telegramToken ? [] : ["TELEGRAM_BOT_TOKEN"],
      redirectUri: oauthRedirectUri(origin, "telegram"),
      scopes: ["bot"],
      noteAr: "رمز بوت تيليجرام + معرّف المحادثة. لا OAuth — حوار رسمي عبر BotFather.",
    },
  ];
}
