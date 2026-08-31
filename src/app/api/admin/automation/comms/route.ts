import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { listCampaignLogs } from "@/lib/automation/campaign-log";
import {
  getCommsSettings,
  publicCommsSettings,
  saveCommsSettings,
  type CommsSettings,
} from "@/lib/automation/comms-settings";
import { validateWhatsAppPhoneNumberId } from "@/lib/automation/comms-validate";
import { loadCrmContacts, marketingAudience, parseSegment } from "@/lib/automation/crm-audience";
import { listLiveCoupons } from "@/lib/automation/offers";
import {
  runEmailCampaign,
  runTelegramCampaign,
  runWhatsAppCampaign,
} from "@/lib/automation/handlers/comms";
import { commsWebhookUrls, siteOrigin } from "@/lib/automation/site-url";
import { isOtpChannel, type OtpChannel } from "@/lib/automation/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const [settings, logs, coupons] = await Promise.all([
    getCommsSettings(),
    listCampaignLogs(),
    listLiveCoupons(),
  ]);
  const [email, whatsapp, telegram] = await Promise.all([
    marketingAudience(await loadCrmContacts("newsletter"), "email"),
    marketingAudience(await loadCrmContacts("whatsapp_optin"), "whatsapp"),
    marketingAudience(await loadCrmContacts("telegram_optin"), "telegram"),
  ]);
  return NextResponse.json({
    ok: true,
    settings: publicCommsSettings(settings),
    webhooks: commsWebhookUrls(siteOrigin(req)),
    logs: logs.slice(0, 12),
    liveCoupons: coupons.map((row) => ({
      code: row.code,
      title: row.title.ar || row.title.en,
      discount: row.discountType === "percent" ? `${row.discountValue}%` : `${row.discountValue} ${row.currency}`,
    })),
    audience: {
      email: email.length,
      whatsapp: whatsapp.length,
      telegram: telegram.length,
    },
  });
}

export async function PUT(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const otpChannels = Array.isArray(body.otpChannels)
    ? body.otpChannels.filter((ch): ch is OtpChannel => isOtpChannel(ch))
    : undefined;
  if (body.whatsappPhoneNumberId !== undefined) {
    const phoneErr = validateWhatsAppPhoneNumberId(String(body.whatsappPhoneNumberId));
    if (phoneErr && String(body.whatsappPhoneNumberId || "").trim()) {
      return NextResponse.json({ ok: false, error: phoneErr }, { status: 400 });
    }
  }
  const patch: Partial<CommsSettings> = {
    otpEnabled: body.otpEnabled === undefined ? undefined : Boolean(body.otpEnabled),
    otpChannels,
    otpTtlSec: body.otpTtlSec === undefined ? undefined : Number(body.otpTtlSec),
    whatsappPhoneNumberId:
      body.whatsappPhoneNumberId === undefined ? undefined : String(body.whatsappPhoneNumberId),
    whatsappAccessToken:
      body.whatsappAccessToken === undefined ? undefined : String(body.whatsappAccessToken),
    whatsappWabaId: body.whatsappWabaId === undefined ? undefined : String(body.whatsappWabaId),
    whatsappVerifyToken:
      body.whatsappVerifyToken === undefined ? undefined : String(body.whatsappVerifyToken),
    whatsappGraphVersion:
      body.whatsappGraphVersion === undefined ? undefined : String(body.whatsappGraphVersion),
    whatsappOtpTemplate:
      body.whatsappOtpTemplate === undefined ? undefined : String(body.whatsappOtpTemplate),
    whatsappTransactionalTemplate:
      body.whatsappTransactionalTemplate === undefined
        ? undefined
        : String(body.whatsappTransactionalTemplate),
    whatsappMarketingTemplate:
      body.whatsappMarketingTemplate === undefined
        ? undefined
        : String(body.whatsappMarketingTemplate),
    telegramBotToken: body.telegramBotToken === undefined ? undefined : String(body.telegramBotToken),
    telegramDefaultChatId:
      body.telegramDefaultChatId === undefined ? undefined : String(body.telegramDefaultChatId),
    rateLimitPerMinute:
      body.rateLimitPerMinute === undefined ? undefined : Number(body.rateLimitPerMinute),
  };
  const settings = await saveCommsSettings(patch);
  return NextResponse.json({ ok: true, settings: publicCommsSettings(settings) });
}

export async function POST(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const channel = String(body.channel || "email");
  const segment = parseSegment(body.segment, channel === "whatsapp" ? "whatsapp_optin" : "newsletter");
  const job = {
    type:
      channel === "whatsapp"
        ? "leads.whatsapp_campaign"
        : channel === "telegram"
          ? "leads.telegram_campaign"
          : "leads.email_campaign",
    dryRun: true,
    payload: { segment, dryRun: true, includeOffer: true },
  };
  const runner =
    channel === "whatsapp"
      ? runWhatsAppCampaign
      : channel === "telegram"
        ? runTelegramCampaign
        : runEmailCampaign;
  const result = await runner(job, { dryRun: true });
  return NextResponse.json({ ok: true, result });
}
