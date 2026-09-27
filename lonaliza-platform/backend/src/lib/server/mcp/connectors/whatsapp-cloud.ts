import { sendWhatsAppMessage } from "@/lib/automation/channels/whatsapp";
import { getCommsSettings, publicCommsSettings } from "@/lib/automation/comms-settings";
import { testWhatsAppConnection } from "@/lib/automation/comms-test";
import { loadCrmContacts, marketingAudience } from "@/lib/automation/crm-audience";

export type WhatsAppCallResult = { ok: boolean; content: string; error?: string };

function digits(phone: string): string {
  return String(phone || "").replace(/\D/g, "");
}

export async function verifyWhatsAppCloud(): Promise<{ ok: boolean; error?: string }> {
  const result = await testWhatsAppConnection();
  return { ok: result.ok, error: result.ok ? undefined : result.error || result.summaryAr };
}

async function assertWhatsAppOptIn(phone: string): Promise<string> {
  const to = digits(phone);
  if (to.length < 8) throw new Error("رقم واتساب غير صالح");
  const contacts = await loadCrmContacts("whatsapp_optin");
  const audience = marketingAudience(contacts, "whatsapp");
  const allowed = audience.some((row) => digits(row.phone || "") === to);
  if (!allowed) {
    throw new Error("المستلم ليس ضمن جهات CRM بموافقة واتساب (opt-in) — لن يُرسل شيء");
  }
  return to;
}

export async function callWhatsAppCloudTool(
  tool: string,
  args: Record<string, unknown>
): Promise<WhatsAppCallResult> {
  switch (tool) {
    case "whatsapp.health": {
      const test = await testWhatsAppConnection();
      const settings = publicCommsSettings(await getCommsSettings());
      return {
        ok: test.ok,
        content: JSON.stringify({
          summary: test.summaryAr,
          details: test.details,
          phoneNumberId: settings.whatsappPhoneNumberId,
          ready: settings.whatsappReady,
        }),
        error: test.error,
      };
    }
    case "whatsapp.send_text": {
      const to = await assertWhatsAppOptIn(String(args.to || args.phone || ""));
      const body = String(args.body || args.text || "").trim();
      if (!body) return { ok: false, content: "", error: "نص الرسالة مطلوب" };
      const result = await sendWhatsAppMessage({
        to,
        body,
        kind: "transactional",
      });
      return {
        ok: result.ok,
        content: result.ok ? JSON.stringify({ providerId: result.providerId }) : "",
        error: result.error,
      };
    }
    case "whatsapp.send_template": {
      const to = await assertWhatsAppOptIn(String(args.to || args.phone || ""));
      const body = String(args.body || args.text || "").trim();
      const templateName = String(args.templateName || args.template || "").trim() || undefined;
      const params = Array.isArray(args.templateParams)
        ? args.templateParams.map(String)
        : body
          ? [body]
          : undefined;
      const result = await sendWhatsAppMessage({
        to,
        body: body || templateName || " ",
        kind: "marketing",
        templateName,
        templateParams: params,
      });
      return {
        ok: result.ok,
        content: result.ok ? JSON.stringify({ providerId: result.providerId }) : "",
        error: result.error,
      };
    }
    default:
      return { ok: false, content: "", error: `أداة واتساب غير معروفة: ${tool}` };
  }
}
