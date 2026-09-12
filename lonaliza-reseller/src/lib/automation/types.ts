export const AUTOMATION_JOB_TYPES = [
  "articles.research_and_publish",
  "trips.discover_and_draft",
  "programs.discover_and_draft",
  "activities.discover_and_draft",
  "leads.email_campaign",
  "leads.whatsapp_campaign",
  "leads.telegram_campaign",
  "otp.send",
  "booking.abandoned_reminder",
  "booking.post_trip_review",
  "visa.alert",
  "marketing.seasonal_campaign",
  "pricing.watch",
  "articles.translate",
  "marketing.birthday_offer",
  "leads.score",
  "studio.weekly_plan",
  "studio.generate_image",
  "studio.generate_video",
  "studio.schedule_publish",
  "admin.weekly_digest",
  "places.reviews",
  "ads.lookalike",
  "ads.ctwa",
  "ads.ctwa_lookalike",
] as const;

export type AutomationJobType = (typeof AUTOMATION_JOB_TYPES)[number];

export const MESSAGING_JOB_TYPES = [
  "leads.email_campaign",
  "leads.whatsapp_campaign",
  "leads.telegram_campaign",
  "otp.send",
  "booking.abandoned_reminder",
  "booking.post_trip_review",
  "visa.alert",
  "marketing.seasonal_campaign",
  "marketing.birthday_offer",
] as const;

export type MessagingJobType = (typeof MESSAGING_JOB_TYPES)[number];

export const AUTOMATION_LOCALES = ["ar", "en", "tr"] as const;
export type AutomationLocale = (typeof AUTOMATION_LOCALES)[number];

export const AUTOMATION_TIMEZONE = "Europe/Istanbul";

export type AutomationJob = {
  id: string;
  name: string;
  type: AutomationJobType;
  enabled: boolean;
  cron: string;
  timezone: string;
  maxPerRun: number;
  maxPerDay: number;
  locales: AutomationLocale[];
  dryRun: boolean;
  consentSource?: string;
  settings?: Record<string, unknown>;
  config?: Record<string, unknown>;
  payload?: Record<string, unknown>;
  locale?: string;
  autoPublish?: boolean;
  count?: number;
  publishAt?: string;
  lastRunAt: string | null;
  lastError: string | null;
  lastResult: string | null;
  runCountToday: number;
  runCountDate: string;
  createdAt: string;
  updatedAt: string;
};

export type AutomationJobInput = {
  id?: string;
  name: string;
  type: AutomationJobType;
  enabled?: boolean;
  cron?: string;
  timezone?: string;
  maxPerRun?: number;
  maxPerDay?: number;
  locales?: AutomationLocale[];
  dryRun?: boolean;
  consentSource?: string;
  settings?: Record<string, unknown>;
};

export type ContentJobResult = {
  ok: boolean;
  handler: string;
  dryRun: boolean;
  topics: DiscoveredTopic[];
  produced: Array<{
    slug?: string;
    id?: string;
    title: string;
    status: string;
    path: string;
    kind?: string;
  }>;
  artifacts?: { topicsPath?: string; articlePath?: string; dir?: string };
  logs: string[];
  limitations: string[];
  sourcesUsed: string[];
};

export type AutomationJobContext = {
  job?: AutomationJob;
  dryRun?: boolean;
  locales?: AutomationLocale[];
  maxPerRun?: number;
  timezone?: string;
  runAt?: string;
  now?: Date;
  log?: (event: string, data?: Record<string, unknown>) => void;
  storeResult?: (result: unknown) => Promise<void> | void;
};

/** AUTO-COMMS loose context (compatible with campaign handlers). */
export type AutomationCtx = {
  dryRun?: boolean;
  now?: number;
  log?: (event: string, data?: Record<string, unknown>) => void;
};

export type AutomationJobResult = {
  ok: boolean;
  processed: number;
  skipped?: number;
  message: string;
  dryRun: boolean;
  details?: Record<string, unknown>;
};

export type AutomationSettings = {
  timezone: string;
  publishWindowStart: string;
  publishWindowEnd: string;
  defaultMaxPerRun: number;
  defaultMaxPerDay: number;
  defaultDryRun: boolean;
  workerEnabled: boolean;
  consentPolicy: string;
  updatedAt: string;
};

export type AutomationLogLevel = "info" | "warn" | "error";

export type AutomationLogEntry = {
  id: string;
  at: string;
  level: AutomationLogLevel;
  jobId?: string;
  jobType?: string;
  message: string;
  dryRun?: boolean;
  meta?: Record<string, unknown>;
};

export type AutomationTickResult = {
  ok: boolean;
  due: number;
  ran: number;
  skipped: number;
  errors: number;
  source: "cron" | "worker" | "manual";
  redis: boolean;
  jobs: Array<{ id: string; type: string; status: string; message: string }>;
};

export type ContentSourceId = "trends" | "rss" | "official";
export type ContentLocale = "ar" | "tr" | "en";
export type ContentImageProvider = "unsplash" | "pexels" | "wikimedia" | "auto";

export type ContentJobSettings = {
  sources?: ContentSourceId[];
  locales?: ContentLocale[];
  autoPublish?: boolean;
  imageProvider?: ContentImageProvider;
  minWords?: number;
  count?: number;
  publishAt?: string;
  dryRun?: boolean;
  draft?: boolean;
};

export type TopicDestination =
  | "istanbul"
  | "antalya"
  | "trabzon"
  | "cappadocia"
  | "bursa"
  | "sapanca"
  | "bodrum"
  | "izmir"
  | "visa"
  | "season"
  | "events"
  | "turkey";

export type DiscoveredTopic = {
  id: string;
  titleAr: string;
  titleEn: string;
  titleTr: string;
  queryAr: string;
  queryEn: string;
  destination: TopicDestination;
  angle: string;
  sourceIds: string[];
  sourceTitles: string[];
  publishedAt?: string;
  trendInterest: number;
  recencyScore: number;
  relevanceScore: number;
  score: number;
};

export type ContentPhotoAttribution = {
  provider: "unsplash" | "pexels" | "wikimedia" | "catalog" | "brand";
  url: string;
  localUrl?: string;
  authorName?: string;
  authorUrl?: string;
  license?: string;
  alt: string;
};

export type GeneratedArticle = {
  slug: string;
  titleAr: string;
  titleEn: string;
  titleTr?: string;
  excerptAr: string;
  excerptEn: string;
  contentAr: string;
  contentEn: string;
  category: string;
  tags: string[];
  cover: ContentPhotoAttribution;
  photos: ContentPhotoAttribution[];
  ogImage: string;
  wordCountAr: number;
  locales: ContentLocale[];
  internalLinks: Array<{ href: string; labelAr: string; labelEn: string }>;
};

export const OTP_PURPOSES = [
  "booking_confirm",
  "register",
  "login_verify",
  "generic",
] as const;

export type OtpPurpose = (typeof OTP_PURPOSES)[number];

export const OTP_CHANNELS = ["whatsapp", "telegram", "email", "sms"] as const;

export type OtpChannel = (typeof OTP_CHANNELS)[number];

export const COMMS_SEGMENTS = [
  "customers",
  "newsletter",
  "whatsapp_optin",
  "telegram_optin",
  "past_guests",
  "abandoned",
  "inbound_leads",
] as const;

export type CommsSegment = (typeof COMMS_SEGMENTS)[number];

export type CampaignResult = {
  ok: boolean;
  dryRun: boolean;
  channel: "email" | "whatsapp" | "telegram";
  segment: CommsSegment;
  recipients: number;
  sent: number;
  failed: number;
  skipped: number;
  offerCodes: string[];
  error?: string;
};

export type SendOtpInput = {
  channel: OtpChannel;
  to: string;
  purpose: OtpPurpose;
};

export type SendOtpResult = {
  ok: boolean;
  channel: OtpChannel;
  purpose: OtpPurpose;
  to: string;
  expiresInSec: number;
  error?: string;
};

export type VerifyOtpInput = {
  to: string;
  code: string;
  purpose: OtpPurpose;
};

export type VerifyOtpResult = {
  ok: boolean;
  purpose: OtpPurpose;
  to: string;
  error?: string;
};

export type CrmContact = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  telegramChatId?: string;
  locale?: string;
  source: "customers" | "booking" | "enquiry" | "newsletter" | "whatsapp_optin" | "telegram_optin";
  marketingEmail: boolean;
  marketingWhatsapp: boolean;
  marketingTelegram: boolean;
};

export function isAutomationJobType(value: unknown): value is AutomationJobType {
  return AUTOMATION_JOB_TYPES.includes(value as AutomationJobType);
}

export function isMessagingJobType(value: unknown): value is MessagingJobType {
  return MESSAGING_JOB_TYPES.includes(value as MessagingJobType);
}

export function isAutomationLocale(value: unknown): value is AutomationLocale {
  return AUTOMATION_LOCALES.includes(value as AutomationLocale);
}

export function isOtpPurpose(value: unknown): value is OtpPurpose {
  return OTP_PURPOSES.includes(value as OtpPurpose);
}

export function isOtpChannel(value: unknown): value is OtpChannel {
  return OTP_CHANNELS.includes(value as OtpChannel);
}

export function isCommsSegment(value: unknown): value is CommsSegment {
  return COMMS_SEGMENTS.includes(value as CommsSegment);
}

export function assertNeverChannel(channel: never): never {
  throw new Error(`Unhandled comms channel: ${String(channel)}`);
}

export function assertNeverPurpose(purpose: never): never {
  throw new Error(`Unhandled OTP purpose: ${String(purpose)}`);
}

export function assertNeverSegment(segment: never): never {
  throw new Error(`Unhandled comms segment: ${String(segment)}`);
}
