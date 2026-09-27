import type { PublishCreationMethod, PublishState } from "./types";

export const PUBLISH_STATES: readonly PublishState[] = [
  "draft",
  "queue",
  "published",
  "error",
] as const;

export const PUBLISH_CREATION_METHODS: readonly PublishCreationMethod[] = [
  "web",
  "mcp",
  "api",
  "autopost",
  "agent",
] as const;

/** Implemented via wrappers around `src/lib/social/platforms/*`. */
export const IMPLEMENTED_PROVIDERS = [
  "facebook",
  "instagram",
  "youtube",
  "tiktok",
  "x",
] as const;

export type ImplementedProvider = (typeof IMPLEMENTED_PROVIDERS)[number];

/**
 * Postiz socialIntegrationList identifiers that are not yet adapted.
 * Farcaster is `wrapcast`. `mastodon-custom` is omitted (commented out upstream).
 */
export const STUB_PROVIDERS = [
  "linkedin",
  "linkedin-page",
  "reddit",
  "instagram-standalone",
  "threads",
  "gmb",
  "tiktok-business",
  "pinterest",
  "dribbble",
  "discord",
  "slack",
  "kick",
  "twitch",
  "mastodon",
  "bluesky",
  "lemmy",
  "wrapcast",
  "telegram",
  "nostr",
  "vk",
  "medium",
  "devto",
  "hashnode",
  "wordpress",
  "listmonk",
  "moltbook",
  "whop",
  "skool",
  "mewe",
  "tumblr",
] as const;

export type StubProvider = (typeof STUB_PROVIDERS)[number];

export const ALL_PROVIDER_IDS = [
  ...IMPLEMENTED_PROVIDERS,
  ...STUB_PROVIDERS,
] as const;

export const PROVIDER_LABEL_AR: Record<string, string> = {
  facebook: "فيسبوك",
  instagram: "إنستغرام",
  youtube: "يوتيوب",
  tiktok: "تيك توك",
  x: "إكس (تويتر)",
  linkedin: "لينكدإن",
  "linkedin-page": "صفحة لينكدإن",
  reddit: "ريديت",
  "instagram-standalone": "إنستغرام (مستقل)",
  threads: "ثريدز",
  gmb: "جوجل للأعمال",
  "tiktok-business": "تيك توك بزنس",
  pinterest: "بينترست",
  dribbble: "دريبل",
  discord: "ديسكورد",
  slack: "سلاك",
  kick: "كيك",
  twitch: "تويتش",
  mastodon: "ماستودون",
  bluesky: "بلوسكاي",
  lemmy: "ليمي",
  wrapcast: "فاركاستر",
  telegram: "تيليغرام",
  nostr: "نوستر",
  vk: "في كيه",
  medium: "ميديوم",
  devto: "ديف.تو",
  hashnode: "هاشنود",
  wordpress: "ووردبريس",
  listmonk: "ليستمونك",
  moltbook: "مولت بوك",
  whop: "ووب",
  skool: "سكول",
  mewe: "مي وي",
  tumblr: "تمبلر",
};

export const PROVIDER_LABEL_EN: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  tiktok: "TikTok",
  x: "X (Twitter)",
  linkedin: "LinkedIn",
  "linkedin-page": "LinkedIn Page",
  reddit: "Reddit",
  "instagram-standalone": "Instagram (Standalone)",
  threads: "Threads",
  gmb: "Google Business",
  "tiktok-business": "TikTok Business",
  pinterest: "Pinterest",
  dribbble: "Dribbble",
  discord: "Discord",
  slack: "Slack",
  kick: "Kick",
  twitch: "Twitch",
  mastodon: "Mastodon",
  bluesky: "Bluesky",
  lemmy: "Lemmy",
  wrapcast: "Farcaster",
  telegram: "Telegram",
  nostr: "Nostr",
  vk: "VK",
  medium: "Medium",
  devto: "Dev.to",
  hashnode: "Hashnode",
  wordpress: "WordPress",
  listmonk: "ListMonk",
  moltbook: "Moltbook",
  whop: "Whop",
  skool: "Skool",
  mewe: "MeWe",
  tumblr: "Tumblr",
};

export const NOT_APPROVED_AR =
  "لن يُنشر شيء قبل موافقة STUDIO (approved=true).";

export const NOT_IMPLEMENTED_AR =
  "هذه المنصة غير مفعّلة بعد في محرّك النشر. سجّل الطلب فقط.";

export const MISSING_COLLECTIONS_AR =
  "مجموعات PocketBase الخاصة بالنشر غير موجودة — تم استخدام التخزين المحلي.";

export const SHADOW_ACCOUNT_PREFIX = "pubch_";

export const PUBLISH_REDIS_PREFIX = "lonaliza-publish:";
export const PUBLISH_BULLMQ_PREFIX = "{lonaliza-publish}";
export const PUBLISH_QUEUE_PREFIX = "publish-";

export { PUBLISH_COLLECTIONS } from "./pb-collections";
