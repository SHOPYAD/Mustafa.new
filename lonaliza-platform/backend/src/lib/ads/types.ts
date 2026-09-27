export const ADS_PLATFORMS = ["google", "meta"] as const;
export type AdsPlatform = (typeof ADS_PLATFORMS)[number];

export const GOOGLE_CHANNELS = ["search", "pmax", "demand_gen"] as const;
export type GoogleChannel = (typeof GOOGLE_CHANNELS)[number];

export const META_CREATIVE_KINDS = ["boost", "link"] as const;
export type MetaCreativeKind = (typeof META_CREATIVE_KINDS)[number];

export type AdsGeo = {
  iso2: string;
  nameAr: string;
  nameEn: string;
  googleCriterionId: string;
};

export type AdsLaunchInput = {
  approved: boolean;
  dryRun?: boolean;
  platforms?: AdsPlatform[] | AdsPlatform | "both";
  name?: string;
  landingUrl: string;
  dailyBudget: number;
  lifetimeBudget?: number;
  currency?: string;
  geoCodes?: string[];
  headlines?: string[];
  descriptions?: string[];
  imageUrl?: string;
  keywords?: string[];
  googleChannel?: GoogleChannel;
  metaCreative?: MetaCreativeKind;
  postId?: string;
  permalink?: string;
  pageId?: string;
  conversionAction?: string;
};

export type AdsCredentials = {
  googleDeveloperToken: string;
  googleClientId: string;
  googleClientSecret: string;
  googleRefreshToken: string;
  googleCustomerId: string;
  googleLoginCustomerId: string;
  metaAccessToken: string;
  metaAdAccountId: string;
  metaPageId: string;
  metaAppId: string;
  metaAppSecret: string;
  metaPixelId: string;
};

export type AdsSettings = {
  defaultGeoCodes: string[];
  telegramChatId: string;
  currency: string;
  alert70SentOn: string;
  alert100SentOn: string;
};

export type StoredCampaign = {
  id: string;
  platform: AdsPlatform;
  name: string;
  landingUrl: string;
  dailyBudget: number;
  lifetimeBudget?: number;
  currency: string;
  status: "draft" | "dry_run" | "enabled" | "paused" | "capped";
  providerId?: string;
  providerResource?: string;
  metaAdSetId?: string;
  createdAt: string;
  approved: boolean;
  dryRun: boolean;
  googleChannel?: GoogleChannel;
  geoCodes: string[];
};

export type AdsMetrics = {
  platform: AdsPlatform;
  spend: number;
  clicks: number;
  impressions: number;
  ctr: number;
  conversions: number;
  invalidClicks?: number;
  currency: string;
};

export type AdsReport = {
  id: string;
  generatedAt: string;
  date: string;
  mode: "dryRun" | "live";
  metrics: AdsMetrics[];
  alerts: AdsBudgetAlert[];
  telegramSent: boolean;
  telegramError?: string;
};

export type AdsBudgetAlert = {
  platform: AdsPlatform;
  level: 70 | 100;
  spend: number;
  dailyBudget: number;
  ratio: number;
  paused: boolean;
};

export type LaunchValidationError = {
  field: string;
  message: string;
};

export type GoogleMutateOp = {
  entity: string;
  operation: "create" | "update" | "remove";
  resource: Record<string, unknown>;
};

export type MetaLaunchPayload = {
  campaign: Record<string, unknown>;
  adSet: Record<string, unknown>;
  creative: Record<string, unknown>;
  ad: Record<string, unknown>;
};

export type AdsLaunchResult = {
  ok: boolean;
  dryRun: boolean;
  live: boolean;
  reason?: string;
  errors?: LaunchValidationError[];
  campaigns: StoredCampaign[];
  googleOps?: GoogleMutateOp[];
  metaPayload?: MetaLaunchPayload;
  googleLive?: { resourceNames: string[] };
  metaLive?: { campaignId?: string; adSetId?: string; adId?: string };
};

export function isAdsPlatform(value: string): value is AdsPlatform {
  return (ADS_PLATFORMS as readonly string[]).includes(value);
}

export function isGoogleChannel(value: string): value is GoogleChannel {
  return (GOOGLE_CHANNELS as readonly string[]).includes(value);
}

export function parsePlatforms(
  raw: AdsLaunchInput["platforms"]
): AdsPlatform[] {
  if (raw === "both" || raw == null) return ["google", "meta"];
  if (typeof raw === "string") return isAdsPlatform(raw) ? [raw] : [];
  return raw.filter(isAdsPlatform);
}
