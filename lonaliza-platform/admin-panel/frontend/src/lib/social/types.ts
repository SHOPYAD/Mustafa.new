export const SOCIAL_PLATFORMS = [
  "facebook",
  "instagram",
  "youtube",
  "tiktok",
  "x",
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export const ACCOUNT_STATUSES = [
  "connected",
  "disconnected",
  "needs_reauth",
] as const;

export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export const ACCOUNT_STATUS_AR: Record<AccountStatus, string> = {
  connected: "متصل",
  disconnected: "منقطع",
  needs_reauth: "يحتاج إعادة تحقق",
};

export const PLATFORM_LABEL_AR: Record<SocialPlatform, string> = {
  facebook: "فيسبوك",
  instagram: "إنستغرام",
  youtube: "يوتيوب",
  tiktok: "تيك توك",
  x: "إكس (تويتر)",
};

export const PUBLISH_ERROR_CODES = [
  "not_approved",
  "not_connected",
  "needs_reauth",
  "missing_credentials",
  "tiktok_app_required",
  "unsupported_media",
  "rate_limited",
  "publish_failed",
  "invalid_input",
] as const;

export type PublishErrorCode = (typeof PUBLISH_ERROR_CODES)[number];

export type PublishError = {
  code: PublishErrorCode;
  message: string;
  retryable?: boolean;
};

export type StoredSocialAccount = {
  id: string;
  platform: SocialPlatform;
  displayName: string;
  username?: string;
  externalId: string;
  status: AccountStatus;
  scopes: string[];
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: string;
  pageAccessToken?: string;
  pageId?: string;
  instagramUserId?: string;
  connectedAt: string;
  lastRefreshedAt?: string;
  lastError?: string;
  isPrimary?: boolean;
};

export type PublicSocialAccount = {
  id: string;
  platform: SocialPlatform;
  displayName: string;
  username?: string;
  externalId: string;
  status: AccountStatus;
  statusLabel: string;
  scopes: string[];
  pageId?: string;
  instagramUserId?: string;
  connectedAt: string;
  lastRefreshedAt?: string;
  lastError?: string;
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
  tokenExpiresAt?: string;
  isPrimary?: boolean;
};

export type TokenStoreFile = {
  version: 1;
  accounts: StoredSocialAccount[];
  updatedAt: string;
};

export type PublishToConnectedAccountsInput = {
  approved: boolean;
  platforms: SocialPlatform[];
  mediaUrls: string[];
  caption: string;
  title?: string;
};

export type PublishPlatformSuccess = {
  ok: true;
  platform: SocialPlatform;
  postId: string;
  permalink?: string;
};

export type PublishPlatformFailure = {
  ok: false;
  platform: SocialPlatform;
  error: PublishError;
};

export type PublishPlatformResult = PublishPlatformSuccess | PublishPlatformFailure;

export type PublishToConnectedAccountsResult = {
  ok: boolean;
  results: PublishPlatformResult[];
};

/** OAuth app providers (existing five-network platforms plus publish-engine networks). */
export const SOCIAL_OAUTH_PROVIDERS = [
  "meta",
  "youtube",
  "tiktok",
  "x",
  "linkedin",
  "linkedin-page",
  "threads",
  "gmb",
  "pinterest",
  "telegram",
] as const;

export type SocialProvider = (typeof SOCIAL_OAUTH_PROVIDERS)[number];

/** Six networks stored in the publish channel store, not the legacy token file. */
export const PUBLISH_OAUTH_PROVIDERS = [
  "telegram",
  "linkedin",
  "linkedin-page",
  "threads",
  "gmb",
  "pinterest",
] as const;

export type PublishOAuthProvider = (typeof PUBLISH_OAUTH_PROVIDERS)[number];

export type SocialCredentialsStatus = {
  provider: SocialProvider;
  configured: boolean;
  missing: string[];
  redirectUri: string;
  scopes: string[];
  noteAr: string;
};

export type MediaKind = "image" | "video" | "unknown";
