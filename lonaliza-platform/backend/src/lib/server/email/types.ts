export const EMAIL_TEMPLATE_KINDS = [
  "offers_reminder",
  "flight_reminder",
  "hotel_reminder",
  "package_reminder",
  "tour_reminder",
  "transfer_reminder",
  "car_reminder",
  "visa_reminder",
  "booking_success",
  "hotel_success",
  "flight_success",
  "package_success",
  "tour_success",
  "transfer_success",
  "car_success",
  "visa_success",
  "invoice",
  "custom",
] as const;

export type EmailTemplateKind = (typeof EMAIL_TEMPLATE_KINDS)[number];

export const EMAIL_TEMPLATE_SOURCES = ["builtin", "manual", "gemini"] as const;
export type EmailTemplateSource = (typeof EMAIL_TEMPLATE_SOURCES)[number];

export const EMAIL_CAMPAIGN_AUDIENCES = [
  "customers",
  "csv",
  "hotel",
  "flight",
  "package",
  "tour",
  "transfer",
  "car",
  "visa",
] as const;
export type EmailCampaignAudience = (typeof EMAIL_CAMPAIGN_AUDIENCES)[number];

export const EMAIL_CAMPAIGN_STATUSES = [
  "draft",
  "scheduled",
  "queued",
  "sending",
  "paused",
  "completed",
  "cancelled",
] as const;
export type EmailCampaignStatus = (typeof EMAIL_CAMPAIGN_STATUSES)[number];

export const EMAIL_RECIPIENT_STATUSES = [
  "pending",
  "sent",
  "failed",
  "skipped",
] as const;
export type EmailRecipientStatus = (typeof EMAIL_RECIPIENT_STATUSES)[number];

export type EmailTemplateRecord = {
  id: string;
  slug: string;
  kind: EmailTemplateKind;
  name: string;
  subject_ar: string;
  subject_en: string;
  html_ar: string;
  html_en: string;
  text_ar: string;
  text_en: string;
  is_builtin: boolean;
  source: EmailTemplateSource;
  variables?: string[];
  document?: unknown;
  created?: string;
  updated?: string;
};

export type EmailCampaignRecord = {
  id: string;
  name: string;
  template: string;
  audience: EmailCampaignAudience;
  status: EmailCampaignStatus;
  scheduled_at?: string;
  batch_size: number;
  sent_count: number;
  failed_count: number;
  remaining_count: number;
  total_count: number;
  last_error?: string;
  last_batch_at?: string;
  csv_name?: string;
  created?: string;
  updated?: string;
};

export type EmailRecipientRecord = {
  id: string;
  campaign: string;
  email: string;
  name?: string;
  company?: string;
  locale?: string;
  status: EmailRecipientStatus;
  error?: string;
  sent_at?: string;
  created?: string;
  updated?: string;
};

export type EmailVars = Record<string, string | number | undefined | null>;

export const MAIL_DELIVERY_STATUSES = [
  "local_accepted",
  "delivered",
  "bounced",
  "deferred",
  "unknown",
] as const;
export type MailDeliveryStatus = (typeof MAIL_DELIVERY_STATUSES)[number];

export type LastMailDelivery = {
  at: string;
  to: string;
  from: string;
  localAccepted: boolean;
  deliveredToInbox: boolean;
  status: MailDeliveryStatus;
  queueId: string;
  messageId: string;
  smtpResponse: string;
  remoteDsn: string;
  remoteReason: string;
  labelAr: string;
  labelEn: string;
};

export const DNS_CHECK_STATUSES = ["ok", "warning", "missing"] as const;
export type DnsCheckStatus = (typeof DNS_CHECK_STATUSES)[number];

export type DnsAuthCheck = {
  name: string;
  ok: boolean;
  status: DnsCheckStatus;
  current: string;
  recommended?: string;
  noteAr: string;
  noteEn: string;
};

export type DnsSetupTip = {
  name: "PTR" | "MX" | "DKIM";
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
};

export type DnsAuthReport = {
  sendingIpv4: string;
  mailDomain: string;
  mailHost: string;
  checkedAt: string;
  queriedVia: string[];
  signingSelector: string;
  signingHost: string;
  checks: DnsAuthCheck[];
  setupTips: DnsSetupTip[];
  bimiNoteAr: string;
  bimiNoteEn: string;
  canGuaranteeAr: string;
  canGuaranteeEn: string;
};

export type SmtpPublicStatus = {
  configured: boolean;
  connected: boolean;
  placeholder: boolean;
  enabled: boolean;
  host: string;
  port: number;
  username: string;
  passwordConfigured: boolean;
  authMethod: string;
  tlsMode: string;
  localName: string;
  senderName: string;
  senderAddress: string;
  statusLabelAr: string;
  statusLabelEn: string;
};

export type SmtpSaveInput = {
  enabled?: boolean;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  authMethod?: string;
  tlsMode?: string;
  localName?: string;
  senderName?: string;
  senderAddress?: string;
};

export type MailAttachment = {
  filename: string;
  content: Buffer;
  contentType?: string;
  cid?: string;
  contentDisposition?: "inline" | "attachment";
};

export function isEmailTemplateKind(value: string): value is EmailTemplateKind {
  return (EMAIL_TEMPLATE_KINDS as readonly string[]).includes(value);
}

export function isEmailCampaignAudience(value: string): value is EmailCampaignAudience {
  return (EMAIL_CAMPAIGN_AUDIENCES as readonly string[]).includes(value);
}

export function assertNeverKind(kind: never): never {
  throw new Error(`Unhandled email template kind: ${String(kind)}`);
}
