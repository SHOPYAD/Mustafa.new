import { getCommsSettings } from "@/lib/automation/comms-settings";
import {
  redactCommsError,
  validateTelegramBotToken,
  validateWhatsAppAccessToken,
  validateWhatsAppPhoneNumberId,
} from "@/lib/automation/comms-validate";
import { commsWebhookUrls, siteOrigin } from "@/lib/automation/site-url";

export type CommsTestChannel = "whatsapp" | "telegram";

export type CommsTestResult = {
  ok: boolean;
  channel: CommsTestChannel;
  summaryAr: string;
  details: Record<string, unknown>;
  error?: string;
};

function assertNeverChannel(channel: never): never {
  throw new Error(`Unhandled comms test channel: ${String(channel)}`);
}

export async function testWhatsAppConnection(): Promise<CommsTestResult> {
  const settings = await getCommsSettings();
  const phoneErr = validateWhatsAppPhoneNumberId(settings.whatsappPhoneNumberId);
  const tokenErr = validateWhatsAppAccessToken(settings.whatsappAccessToken);
  if (phoneErr || tokenErr) {
    return {
      ok: false,
      channel: "whatsapp",
      summaryAr: phoneErr || tokenErr || "إعدادات غير مكتملة",
      details: {},
      error: phoneErr || tokenErr || undefined,
    };
  }
  const version = settings.whatsappGraphVersion || "v21.0";
  const url = `https://graph.facebook.com/${version}/${settings.whatsappPhoneNumberId}?fields=id,display_phone_number,verified_name,quality_rating`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${settings.whatsappAccessToken}` },
      cache: "no-store",
    });
    const data = (await res.json().catch(() => ({}))) as {
      id?: string;
      display_phone_number?: string;
      verified_name?: string;
      quality_rating?: string;
      error?: { message?: string; code?: number };
    };
    if (!res.ok || data.error) {
      const raw = data.error?.message || `http_${res.status}`;
      return {
        ok: false,
        channel: "whatsapp",
        summaryAr: "فشل الاتصال بـ Graph API",
        details: { status: res.status, code: data.error?.code },
        error: redactCommsError(raw),
      };
    }
    return {
      ok: true,
      channel: "whatsapp",
      summaryAr: `اتصال ناجح — ${data.verified_name || "رقم واتساب"} ${data.display_phone_number || ""}`.trim(),
      details: {
        id: data.id,
        displayPhone: data.display_phone_number,
        verifiedName: data.verified_name,
        quality: data.quality_rating,
        webhook: commsWebhookUrls(siteOrigin()).whatsapp,
      },
    };
  } catch (e) {
    return {
      ok: false,
      channel: "whatsapp",
      summaryAr: "تعذّر الوصول إلى Graph API",
      details: {},
      error: redactCommsError(e instanceof Error ? e.message : "whatsapp_test_failed"),
    };
  }
}

export async function testTelegramConnection(): Promise<CommsTestResult> {
  const settings = await getCommsSettings();
  const tokenErr = validateTelegramBotToken(settings.telegramBotToken);
  if (tokenErr) {
    return {
      ok: false,
      channel: "telegram",
      summaryAr: tokenErr,
      details: {},
      error: tokenErr,
    };
  }
  const token = settings.telegramBotToken;
  try {
    const meRes = await fetch(`https://api.telegram.org/bot${token}/getMe`, { cache: "no-store" });
    const me = (await meRes.json().catch(() => ({}))) as {
      ok?: boolean;
      description?: string;
      result?: { username?: string; id?: number; first_name?: string };
    };
    if (!meRes.ok || !me.ok) {
      return {
        ok: false,
        channel: "telegram",
        summaryAr: "فشل getMe — تحققوا من رمز BotFather",
        details: { status: meRes.status },
        error: redactCommsError(me.description || `http_${meRes.status}`),
      };
    }

    const hookUrl = commsWebhookUrls(siteOrigin()).telegram;
    const hookRes = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`, {
      cache: "no-store",
    });
    const hook = (await hookRes.json().catch(() => ({}))) as {
      ok?: boolean;
      result?: { url?: string; last_error_message?: string; pending_update_count?: number };
    };
    const current = hook.result?.url || "";
    let setOk: boolean | null = null;
    let setError = "";
    if (current !== hookUrl) {
      const setRes = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: hookUrl, allowed_updates: ["message", "edited_message"] }),
      });
      const setData = (await setRes.json().catch(() => ({}))) as { ok?: boolean; description?: string };
      setOk = Boolean(setData.ok);
      if (!setOk) setError = redactCommsError(setData.description || `http_${setRes.status}`);
    }

    let chatOk: boolean | null = null;
    let chatError = "";
    if (settings.telegramDefaultChatId) {
      const chatRes = await fetch(
        `https://api.telegram.org/bot${token}/getChat?chat_id=${encodeURIComponent(settings.telegramDefaultChatId)}`,
        { cache: "no-store" }
      );
      const chat = (await chatRes.json().catch(() => ({}))) as { ok?: boolean; description?: string };
      chatOk = Boolean(chat.ok);
      if (!chatOk) chatError = redactCommsError(chat.description || `http_${chatRes.status}`);
    }

    const ok = Boolean(me.ok) && (setOk !== false) && (chatOk !== false);
    return {
      ok,
      channel: "telegram",
      summaryAr: ok
        ? `البوت @${me.result?.username || "bot"} جاهز`
        : "البوت ردّ لكن الويب هوك أو المحادثة تحتاج مراجعة",
      details: {
        username: me.result?.username,
        botId: me.result?.id,
        webhook: hookUrl,
        webhookWas: current || "غير مضبوط",
        webhookSet: setOk,
        defaultChat: settings.telegramDefaultChatId || null,
        defaultChatOk: chatOk,
        pendingUpdates: hook.result?.pending_update_count,
        lastWebhookError: hook.result?.last_error_message
          ? redactCommsError(hook.result.last_error_message)
          : null,
        setError: setError || null,
        chatError: chatError || null,
      },
      error: ok ? undefined : setError || chatError || "telegram_partial",
    };
  } catch (e) {
    return {
      ok: false,
      channel: "telegram",
      summaryAr: "تعذّر الوصول إلى Telegram API",
      details: {},
      error: redactCommsError(e instanceof Error ? e.message : "telegram_test_failed"),
    };
  }
}

export async function testCommsConnection(channel: CommsTestChannel): Promise<CommsTestResult> {
  switch (channel) {
    case "whatsapp":
      return testWhatsAppConnection();
    case "telegram":
      return testTelegramConnection();
    default:
      return assertNeverChannel(channel);
  }
}
