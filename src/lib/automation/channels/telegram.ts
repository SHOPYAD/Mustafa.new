import { getCommsSettings } from "@/lib/automation/comms-settings";
import { rateLimit } from "@/lib/server/rate-limit";

export type TelegramSendInput = {
  chatId: string;
  text: string;
};

export type TelegramMediaInput = {
  chatId: string;
  caption?: string;
  filename?: string;
  buffer?: Buffer;
  filePath?: string;
  url?: string;
};

type TelegramApiResult = { ok: boolean; error?: string; providerId?: string };

function parseTelegramResponse(
  res: Response,
  data: { ok?: boolean; description?: string; result?: { message_id?: number } }
): TelegramApiResult {
  if (!res.ok || !data.ok) {
    return { ok: false, error: data.description || `telegram_http_${res.status}` };
  }
  return { ok: true, providerId: data.result?.message_id ? String(data.result.message_id) : undefined };
}

async function telegramRateLimit(): Promise<TelegramApiResult | null> {
  const settings = await getCommsSettings();
  if (!settings.telegramBotToken) return { ok: false, error: "telegram_not_configured" };
  const limited = rateLimit("tg-bot-send", settings.rateLimitPerMinute, 60_000);
  if (!limited.ok) return { ok: false, error: "rate_limited" };
  return null;
}

async function telegramToken(): Promise<string> {
  const settings = await getCommsSettings();
  return settings.telegramBotToken;
}

export async function sendTelegramMessage(
  input: TelegramSendInput
): Promise<TelegramApiResult> {
  const blocked = await telegramRateLimit();
  if (blocked) return blocked;
  const chatId = String(input.chatId || "").trim();
  if (!chatId) return { ok: false, error: "invalid_chat" };
  const token = await telegramToken();
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: String(input.text || "").slice(0, 3900),
        disable_web_page_preview: true,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      description?: string;
      result?: { message_id?: number };
    };
    return parseTelegramResponse(res, data);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "telegram_failed" };
  }
}

async function readMediaBuffer(input: TelegramMediaInput): Promise<{ buffer: Buffer; filename: string } | { error: string }> {
  if (input.buffer?.length) {
    return { buffer: input.buffer, filename: input.filename || "file.bin" };
  }
  if (input.filePath) {
    const { promises: fs } = await import("fs");
    try {
      const buffer = await fs.readFile(input.filePath);
      return { buffer, filename: input.filename || input.filePath.split("/").pop() || "file.bin" };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "file_read_failed" };
    }
  }
  if (input.url) {
    try {
      const res = await fetch(input.url);
      if (!res.ok) return { error: `media_http_${res.status}` };
      const buffer = Buffer.from(await res.arrayBuffer());
      return { buffer, filename: input.filename || "file.bin" };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "media_fetch_failed" };
    }
  }
  return { error: "no_media" };
}

async function sendTelegramMultipart(
  method: "sendPhoto" | "sendDocument",
  field: "photo" | "document",
  input: TelegramMediaInput
): Promise<TelegramApiResult> {
  const blocked = await telegramRateLimit();
  if (blocked) return blocked;
  const chatId = String(input.chatId || "").trim();
  if (!chatId) return { ok: false, error: "invalid_chat" };
  const media = await readMediaBuffer(input);
  if ("error" in media) return { ok: false, error: media.error };
  const token = await telegramToken();
  const form = new FormData();
  form.set("chat_id", chatId);
  if (input.caption) form.set("caption", input.caption.slice(0, 1024));
  form.set(field, new Blob([new Uint8Array(media.buffer)]), media.filename);
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      body: form,
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      description?: string;
      result?: { message_id?: number };
    };
    return parseTelegramResponse(res, data);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "telegram_media_failed" };
  }
}

export async function sendTelegramPhoto(input: TelegramMediaInput): Promise<TelegramApiResult> {
  return sendTelegramMultipart("sendPhoto", "photo", input);
}

export async function sendTelegramDocument(input: TelegramMediaInput): Promise<TelegramApiResult> {
  return sendTelegramMultipart("sendDocument", "document", input);
}
