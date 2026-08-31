import { sendCommsEmail } from "@/lib/automation/channels/email";
import { sendTelegramMessage } from "@/lib/automation/channels/telegram";
import { sendWhatsAppMessage } from "@/lib/automation/channels/whatsapp";
import { appendCampaignLog } from "@/lib/automation/campaign-log";
import {
  channelReady,
  getCommsSettings,
  getOtpPepper,
  pickOtpChannel,
} from "@/lib/automation/comms-settings";
import {
  contactExistsInCrm,
  loadCrmContacts,
  marketingAudience,
  parseSegment,
} from "@/lib/automation/crm-audience";
import { formatOfferText, getActiveOffer } from "@/lib/automation/offers";
import {
  DEFAULT_OTP_TTL_MS,
  fileOtpStore,
  persistIssuedOtp,
  verifyStoredOtp,
} from "@/lib/automation/otp";
import { rateLimit } from "@/lib/server/rate-limit";
import {
  assertNeverChannel,
  type AutomationJob,
  type AutomationJobContext,
  type CampaignResult,
  type CommsSegment,
  type CrmContact,
  type OtpChannel,
  type SendOtpInput,
  type SendOtpResult,
  type VerifyOtpInput,
  type VerifyOtpResult,
} from "@/lib/automation/types";

type CampaignJobLike = {
  id?: string;
  type?: string;
  dryRun?: boolean;
  payload?: Record<string, unknown>;
  settings?: Record<string, unknown>;
};

function isDryRun(job: CampaignJobLike, ctx: AutomationJobContext | { dryRun?: boolean }): boolean {
  const settings = job.settings && typeof job.settings === "object" ? job.settings : {};
  const payload = job.payload && typeof job.payload === "object" ? job.payload : {};
  return Boolean(job.dryRun ?? ctx.dryRun ?? settings.dryRun ?? payload.dryRun);
}

function payloadOf(job: CampaignJobLike): Record<string, unknown> {
  const settings = job.settings && typeof job.settings === "object" ? job.settings : {};
  const payload = job.payload && typeof job.payload === "object" ? job.payload : {};
  return { ...settings, ...payload };
}

function campaignMessage(payload: Record<string, unknown>, offerText: string): string {
  const custom = String(payload.message || payload.body || "").trim();
  return [custom, offerText].filter(Boolean).join("\n\n");
}

async function finish(
  result: CampaignResult,
  job: CampaignJobLike,
  ctx: AutomationJobContext | { dryRun?: boolean; log?: AutomationJobContext["log"] }
): Promise<CampaignResult> {
  ctx.log?.("comms.campaign", result);
  await appendCampaignLog({
    ...result,
    at: new Date().toISOString(),
    jobId: job.id,
    jobType: job.type,
  });
  return result;
}

async function resolveAudience(
  channel: "email" | "whatsapp" | "telegram",
  payload: Record<string, unknown>
): Promise<{ segment: CommsSegment; contacts: CrmContact[] }> {
  const fallback: CommsSegment =
    channel === "whatsapp" ? "whatsapp_optin" : channel === "telegram" ? "telegram_optin" : "newsletter";
  const segment = parseSegment(payload.segment, fallback);
  const contacts = marketingAudience(await loadCrmContacts(segment), channel);
  return { segment, contacts };
}

export async function runEmailCampaign(
  job: CampaignJobLike,
  ctx: AutomationJobContext | { dryRun?: boolean; log?: AutomationJobContext["log"] } = {}
): Promise<CampaignResult> {
  const payload = payloadOf(job);
  const { segment, contacts } = await resolveAudience("email", payload);
  const offer = payload.includeOffer === false ? null : await getActiveOffer();
  const offerText = offer ? formatOfferText(offer) : "";
  const text = campaignMessage(payload, offerText) || "عرض من الريان لضيوفنا المشتركين.";
  const dryRun = isDryRun(job, ctx);
  const result: CampaignResult = {
    ok: true,
    dryRun,
    channel: "email",
    segment,
    recipients: contacts.length,
    sent: 0,
    failed: 0,
    skipped: 0,
    offerCodes: offer?.couponCode ? [offer.couponCode] : [],
  };
  if (dryRun) return finish(result, job, ctx);
  for (const contact of contacts) {
    if (!contact.email) {
      result.skipped += 1;
      continue;
    }
    const sent = await sendCommsEmail({
      to: contact.email,
      name: contact.name,
      subject: String(payload.subject || "عرض من الريان"),
      text: text.replace(/\{name\}/g, contact.name || ""),
      locale: contact.locale,
    });
    if (sent.ok) result.sent += 1;
    else result.failed += 1;
  }
  return finish(result, job, ctx);
}

export async function runWhatsAppCampaign(
  job: CampaignJobLike,
  ctx: AutomationJobContext | { dryRun?: boolean; log?: AutomationJobContext["log"] } = {}
): Promise<CampaignResult> {
  const settings = await getCommsSettings();
  const payload = payloadOf(job);
  const { segment, contacts } = await resolveAudience("whatsapp", payload);
  const offer = payload.includeOffer === false ? null : await getActiveOffer();
  const offerText = offer ? formatOfferText(offer) : "";
  const text = campaignMessage(payload, offerText) || "عرض من الريان.";
  const dryRun = isDryRun(job, ctx);
  const result: CampaignResult = {
    ok: true,
    dryRun,
    channel: "whatsapp",
    segment,
    recipients: contacts.length,
    sent: 0,
    failed: 0,
    skipped: 0,
    offerCodes: offer?.couponCode ? [offer.couponCode] : [],
  };
  if (!settings.whatsappPhoneNumberId || !settings.whatsappAccessToken) {
    result.ok = dryRun;
    result.error = "whatsapp_not_configured";
    if (dryRun) return finish(result, job, ctx);
    return finish({ ...result, ok: false }, job, ctx);
  }
  if (dryRun) return finish(result, job, ctx);
  if (!settings.whatsappMarketingTemplate) {
    return finish({ ...result, ok: false, error: "template_required" }, job, ctx);
  }
  for (const contact of contacts) {
    if (!contact.phone) {
      result.skipped += 1;
      continue;
    }
    const sent = await sendWhatsAppMessage({
      to: contact.phone,
      body: text,
      kind: "marketing",
      templateName: String(payload.template || settings.whatsappMarketingTemplate),
      templateParams: [contact.name || "ضيفنا", offer?.couponCode || "", offer?.discountLabel || ""],
    });
    if (sent.ok) result.sent += 1;
    else result.failed += 1;
  }
  return finish(result, job, ctx);
}

export async function runTelegramCampaign(
  job: CampaignJobLike,
  ctx: AutomationJobContext | { dryRun?: boolean; log?: AutomationJobContext["log"] } = {}
): Promise<CampaignResult> {
  const settings = await getCommsSettings();
  const payload = payloadOf(job);
  const { segment, contacts } = await resolveAudience("telegram", payload);
  const offer = payload.includeOffer === false ? null : await getActiveOffer();
  const offerText = offer ? formatOfferText(offer) : "";
  const text = campaignMessage(payload, offerText) || "عرض من الريان.";
  const dryRun = isDryRun(job, ctx);
  const result: CampaignResult = {
    ok: true,
    dryRun,
    channel: "telegram",
    segment,
    recipients: contacts.length,
    sent: 0,
    failed: 0,
    skipped: 0,
    offerCodes: offer?.couponCode ? [offer.couponCode] : [],
  };
  if (!settings.telegramBotToken) {
    result.error = "telegram_not_configured";
    if (dryRun) return finish(result, job, ctx);
    return finish({ ...result, ok: false }, job, ctx);
  }
  if (dryRun) return finish(result, job, ctx);
  const targets = contacts.filter((row) => row.telegramChatId);
  if (targets.length === 0 && settings.telegramDefaultChatId) {
    result.recipients = 0;
    result.skipped += 1;
    result.error = "no_opted_telegram_subscribers";
    return finish({ ...result, ok: false }, job, ctx);
  }
  for (const contact of targets) {
    const sent = await sendTelegramMessage({
      chatId: contact.telegramChatId || "",
      text: text.replace(/\{name\}/g, contact.name || ""),
    });
    if (sent.ok) result.sent += 1;
    else result.failed += 1;
  }
  return finish(result, job, ctx);
}

function otpText(purpose: SendOtpInput["purpose"], code: string): string {
  switch (purpose) {
    case "booking_confirm":
      return `رمز تأكيد الحجز: ${code}`;
    case "register":
      return `رمز التحقق لإنشاء الحساب: ${code}`;
    case "login_verify":
      return `رمز التحقق لتسجيل الدخول: ${code}`;
    case "generic":
      return `رمز التحقق: ${code}`;
    default:
      return assertNeverPurposeSafe(purpose, code);
  }
}

function assertNeverPurposeSafe(
  purpose: never,
  code: string
): string {
  void purpose;
  return `رمز التحقق: ${code}`;
}

async function deliverOtp(
  channel: OtpChannel,
  to: string,
  purpose: SendOtpInput["purpose"],
  code: string
): Promise<{ ok: boolean; error?: string }> {
  const text = otpText(purpose, code);
  switch (channel) {
    case "whatsapp":
      return sendWhatsAppMessage({
        to,
        body: text,
        kind: "otp",
        templateParams: [code],
      });
    case "telegram":
      return sendTelegramMessage({ chatId: to, text });
    case "email":
      return sendCommsEmail({
        to,
        subject: "رمز التحقق",
        text,
      });
    case "sms":
      return { ok: false, error: "sms_not_configured" };
    default:
      return assertNeverChannel(channel);
  }
}

export async function sendOtp(input: SendOtpInput): Promise<SendOtpResult> {
  const settings = await getCommsSettings();
  const to = String(input.to || "").trim();
  const expiresInSec = settings.otpTtlSec || Math.round(DEFAULT_OTP_TTL_MS / 1000);
  const base: SendOtpResult = {
    ok: false,
    channel: input.channel,
    purpose: input.purpose,
    to,
    expiresInSec,
  };
  if (!settings.otpEnabled && input.purpose !== "generic") {
    return { ...base, error: "otp_disabled" };
  }
  if (!to) return { ...base, error: "missing_to" };
  if (!channelReady(settings, input.channel) && input.channel !== "email") {
    return { ...base, error: `${input.channel}_not_configured` };
  }
  const limited = rateLimit(`otp-send:${to}:${input.purpose}`, 5, 15 * 60 * 1000);
  if (!limited.ok) return { ...base, error: "rate_limited" };

  if (input.purpose !== "register") {
    const known = await contactExistsInCrm(to);
    if (!known) return { ...base, error: "unknown_contact" };
  }

  const pepper = await getOtpPepper();
  const issued = await persistIssuedOtp(fileOtpStore, {
    to,
    purpose: input.purpose,
    channel: input.channel,
    pepper,
    ttlMs: expiresInSec * 1000,
  });
  const delivered = await deliverOtp(input.channel, to, input.purpose, issued.code);
  if (!delivered.ok) return { ...base, error: delivered.error || "send_failed" };
  return { ...base, ok: true };
}

export async function verifyOtp(input: VerifyOtpInput): Promise<VerifyOtpResult> {
  const to = String(input.to || "").trim();
  const code = String(input.code || "").replace(/\s/g, "");
  if (!to || !code) {
    return { ok: false, purpose: input.purpose, to, error: "missing_fields" };
  }
  const pepper = await getOtpPepper();
  return verifyStoredOtp(fileOtpStore, {
    to,
    code,
    purpose: input.purpose,
    pepper,
  });
}

export async function sendOtpIfEnabled(input: {
  phone?: string;
  email?: string;
  telegramChatId?: string;
  purpose: SendOtpInput["purpose"];
}): Promise<SendOtpResult | null> {
  const settings = await getCommsSettings();
  const channel = pickOtpChannel(settings, input.phone, input.email, input.telegramChatId);
  if (!channel) return null;
  const to =
    channel === "email" ? input.email : channel === "telegram" ? input.telegramChatId : input.phone;
  if (!to) return null;
  return sendOtp({ channel, to, purpose: input.purpose });
}
