import { getCommsSettings, type CommsSettings } from "@/lib/automation/comms-settings";
import { rateLimit } from "@/lib/server/rate-limit";

export type WhatsAppSendInput = {
  to: string;
  body: string;
  kind: "otp" | "transactional" | "marketing";
  templateName?: string;
  templateParams?: string[];
};

export type ChannelSendResult = { ok: boolean; error?: string; providerId?: string };

function digits(phone: string): string {
  return String(phone || "").replace(/\D/g, "");
}

function templatePayload(
  settings: CommsSettings,
  input: WhatsAppSendInput
): Record<string, unknown> | null {
  const name =
    input.templateName ||
    (input.kind === "otp"
      ? settings.whatsappOtpTemplate
      : input.kind === "marketing"
        ? settings.whatsappMarketingTemplate
        : settings.whatsappTransactionalTemplate);
  if (!name) return null;
  const params = (input.templateParams?.length ? input.templateParams : [input.body]).map((text) => ({
    type: "text",
    text: String(text).slice(0, 1024),
  }));
  const components: Record<string, unknown>[] = [{ type: "body", parameters: params }];
  if (input.kind === "otp") {
    components.push({
      type: "button",
      sub_type: "url",
      index: "0",
      parameters: [{ type: "text", text: String(input.templateParams?.[0] || input.body).slice(0, 15) }],
    });
  }
  return {
    messaging_product: "whatsapp",
    to: digits(input.to),
    type: "template",
    template: {
      name,
      language: { code: "ar" },
      components,
    },
  };
}

export async function sendWhatsAppMessage(input: WhatsAppSendInput): Promise<ChannelSendResult> {
  const settings = await getCommsSettings();
  if (!settings.whatsappPhoneNumberId || !settings.whatsappAccessToken) {
    return { ok: false, error: "whatsapp_not_configured" };
  }
  const to = digits(input.to);
  if (to.length < 8) return { ok: false, error: "invalid_phone" };

  const limited = rateLimit(
    "wa-cloud-send",
    settings.rateLimitPerMinute,
    60_000
  );
  if (!limited.ok) return { ok: false, error: "rate_limited" };

  const url = `https://graph.facebook.com/${settings.whatsappGraphVersion}/${settings.whatsappPhoneNumberId}/messages`;
  const payload =
    templatePayload(settings, input) ||
    (input.kind === "marketing"
      ? null
      : {
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: input.body.slice(0, 4096), preview_url: false },
        });
  if (!payload) return { ok: false, error: "template_required" };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${settings.whatsappAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: { message?: string };
      messages?: Array<{ id?: string }>;
    };
    if (!res.ok) {
      return { ok: false, error: data.error?.message || `whatsapp_http_${res.status}` };
    }
    return { ok: true, providerId: data.messages?.[0]?.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "whatsapp_failed" };
  }
}
