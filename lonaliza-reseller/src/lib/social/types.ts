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

export type SocialProvider = "meta" | "youtube" | "tiktok" | "x";

export type SocialCredentialsStatus = {
  provider: SocialProvider;
  configured: boolean;
  missing: string[];
  redirectUri: string;
  scopes: string[];
  noteAr: string;
};

export type MediaKind = "image" | "video" | "unknown";
