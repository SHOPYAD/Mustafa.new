/**
 * AUTO-COMMS contract — AUTO-CORE calls these names.
 * Implementations live in src/lib/automation/handlers/comms.ts
 *
 * LEGAL: only CRM / opt-in contacts. ctx.job.consentSource is required for messaging jobs.
 */

import {
  runEmailCampaign,
  runTelegramCampaign,
  runWhatsAppCampaign,
  sendOtp as sendOtpImpl,
} from "@/lib/automation/handlers/comms";
import type { AutomationJobContext, AutomationJobResult, CampaignResult, OtpChannel, OtpPurpose } from "../types";
import { isOtpChannel, isOtpPurpose } from "../types";

function fromCampaign(result: CampaignResult, name: string): AutomationJobResult {
  return {
    ok: result.ok,
    processed: result.sent,
    skipped: result.skipped,
    message: result.error || `${name}: sent=${result.sent} skipped=${result.skipped} dryRun=${result.dryRun}`,
    dryRun: result.dryRun,
    details: { channel: result.channel, segment: result.segment, recipients: result.recipients },
  };
}

export async function sendLeadEmailCampaign(ctx: AutomationJobContext): Promise<AutomationJobResult> {
  return fromCampaign(await runEmailCampaign(ctx.job || {}, ctx), "sendLeadEmailCampaign");
}

export async function sendLeadWhatsAppCampaign(ctx: AutomationJobContext): Promise<AutomationJobResult> {
  return fromCampaign(await runWhatsAppCampaign(ctx.job || {}, ctx), "sendLeadWhatsAppCampaign");
}

export async function sendLeadTelegramCampaign(ctx: AutomationJobContext): Promise<AutomationJobResult> {
  return fromCampaign(await runTelegramCampaign(ctx.job || {}, ctx), "sendLeadTelegramCampaign");
}

export async function sendOtp(ctx: AutomationJobContext): Promise<AutomationJobResult> {
  const payload = { ...(ctx.job?.payload || {}), ...(ctx.job?.settings || {}) };
  const channel = isOtpChannel(payload.channel) ? payload.channel : ("whatsapp" as OtpChannel);
  const purpose = isOtpPurpose(payload.purpose) ? payload.purpose : ("generic" as OtpPurpose);
  const to = String(payload.to || payload.phone || payload.email || "").trim();
  if (!to) {
    return {
      ok: false,
      processed: 0,
      message: "otp.send requires settings.to",
      dryRun: Boolean(ctx.dryRun),
    };
  }
  if (ctx.dryRun) {
    return {
      ok: true,
      processed: 0,
      message: `otp.send dry-run to=${to} channel=${channel}`,
      dryRun: true,
    };
  }
  const result = await sendOtpImpl({ channel, to, purpose });
  return {
    ok: result.ok,
    processed: result.ok ? 1 : 0,
    message: result.error || `otp sent via ${result.channel}`,
    dryRun: false,
    details: { channel: result.channel, purpose: result.purpose },
  };
}

export async function sendAbandonedBookingReminder(ctx: AutomationJobContext): Promise<AutomationJobResult> {
  return fromCampaign(
    await runEmailCampaign(
      {
        ...ctx.job,
        settings: {
          ...ctx.job?.settings,
          segment: "abandoned",
          includeOffer: true,
          consentSource: ctx.job?.consentSource || "crm_opt_in",
          subject: "أكملوا حجزكم لدى لوناليزا — العرض ما زال متاحاً لجمهوركم الموافق",
        },
      },
      ctx
    ),
    "sendAbandonedBookingReminder"
  );
}

export async function sendPostTripReviewRequest(ctx: AutomationJobContext): Promise<AutomationJobResult> {
  return fromCampaign(
    await runEmailCampaign(
      {
        ...ctx.job,
        settings: {
          ...ctx.job?.settings,
          segment: "past_guests",
          includeOffer: false,
          consentSource: ctx.job?.consentSource || "crm_opt_in",
          subject: "كيف كانت رحلتكم مع لوناليزا؟ تقييمكم يساعدنا — لجمهور موافق فقط",
        },
      },
      ctx
    ),
    "sendPostTripReviewRequest"
  );
}

export async function sendVisaAlert(ctx: AutomationJobContext): Promise<AutomationJobResult> {
  return fromCampaign(
    await runEmailCampaign(
      { ...ctx.job, settings: { ...ctx.job?.settings, segment: "newsletter", includeOffer: false } },
      ctx
    ),
    "sendVisaAlert"
  );
}

export async function sendSeasonalCampaign(ctx: AutomationJobContext): Promise<AutomationJobResult> {
  return fromCampaign(
    await runEmailCampaign(
      { ...ctx.job, settings: { ...ctx.job?.settings, segment: "newsletter", includeOffer: true } },
      ctx
    ),
    "sendSeasonalCampaign"
  );
}

export async function sendBirthdayOffer(ctx: AutomationJobContext): Promise<AutomationJobResult> {
  return fromCampaign(
    await runEmailCampaign(
      { ...ctx.job, settings: { ...ctx.job?.settings, segment: "customers", includeOffer: true } },
      ctx
    ),
    "sendBirthdayOffer"
  );
}
