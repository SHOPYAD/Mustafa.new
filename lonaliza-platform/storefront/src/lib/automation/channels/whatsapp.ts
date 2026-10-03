import { getCommsSettings, type CommsSettings } from "@/lib/automation/comms-settings";
import { rateLimit } from "@/lib/server/rate-limit";
import { sendQrWhatsAppMessage } from "@/lib/server/whatsapp-qr/service";
import type { MessageCategory } from "@/lib/automation/comms-message-store";

export type WhatsAppSendInput = {
  to: string;
  body: string;
  kind?: "otp" | "transactional" | "marketing";
  category?: MessageCategory;
  templateName?: string;
  templateParams?: string[];
  settings?: CommsSettings;
  customerName?: string;
};

export type ChannelSendResult = { ok: boolean; error?: string; providerId?: string };

function digits(phone: string): string {
  return String(phone || "").replace(/\D/g, "");
}

function templatePayload(
  settings: CommsSettings,
  input: WhatsAppSendInput
): Record<string, unknown> | null {
  const kind = input.kind || (input.category === "otp" ? "otp" : input.category === "marketing" ? "marketing" : "transactional");
  const name =
    input.templateName ||
    (kind === "otp"
      ? settings.whatsappOtpTemplate
      : kind === "marketing"
        ? settings.whatsappMarketingTemplate
        : settings.whatsappTransactionalTemplate);
  if (!name) return null;
  const params = (input.templateParams?.length ? input.templateParams : [input.body]).map((text) => ({
    type: "text",
    text: String(text).slice(0, 1024),
  }));
  const components: Record<string, unknown>[] = [{ type: "body", parameters: params }];
  if (kind === "otp") {
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
  const settings = input.settings || (await getCommsSettings());
  const to = digits(input.to);
  if (to.length < 8) return { ok: false, error: "invalid_phone" };

  const limited = await rateLimit(
    "wa-send",
    settings.rateLimitPerMinute,
    60_000
  );
  if (!limited.ok) return { ok: false, error: "rate_limited" };

  let result: ChannelSendResult = { ok: false };

  // Mode 1: QR Direct Session (Default)
  if (settings.whatsappMode === "qr") {
    const qrResult = await sendQrWhatsAppMessage({ to, body: input.body });
    if (qrResult.ok) {
      result = qrResult;
    } else if (!settings.whatsappPhoneNumberId || !settings.whatsappAccessToken) {
      result = qrResult;
    }
  }

  // Mode 2: Meta Cloud API (if QR was not chosen or failed and Cloud API is configured)
  if (!result.ok && settings.whatsappPhoneNumberId && settings.whatsappAccessToken) {
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

    if (payload) {
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
        if (res.ok) {
          result = { ok: true, providerId: data.messages?.[0]?.id };
        } else {
          result = { ok: false, error: data.error?.message || `whatsapp_http_${res.status}` };
        }
      } catch (e) {
        result = { ok: false, error: e instanceof Error ? e.message : "whatsapp_failed" };
      }
    }
  }

  // Log to comms message store
  try {
    const { saveCommsMessage } = await import("@/lib/automation/comms-message-store");
    const category = input.category || (input.kind === "otp" ? "otp" : input.kind === "marketing" ? "marketing" : "booking");
    saveCommsMessage({
      channel: "whatsapp",
      direction: "outbound",
      category,
      track: "b2c",
      from: "system",
      to,
      body: input.body,
      status: result.ok ? "sent" : "failed",
      customerName: input.customerName,
      metadata: result.error ? { error: result.error } : undefined,
    });
  } catch {
    // ignore
  }

  return result;
}
