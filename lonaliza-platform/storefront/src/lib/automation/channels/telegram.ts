import { getCommsSettings } from "@/lib/automation/comms-settings";
import { rateLimit } from "@/lib/server/rate-limit";

export type TelegramSendInput = {
  chatId: string;
  text: string;
  replyMarkup?: Record<string, unknown>;
  parseMode?: "Markdown" | "HTML";
};

export type TelegramEditInput = {
  chatId: string;
  messageId: string | number;
  text: string;
  replyMarkup?: Record<string, unknown>;
  parseMode?: "Markdown" | "HTML";
};

export type TelegramMediaInput = {
  chatId: string;
  caption?: string;
  filename?: string;
  buffer?: Buffer;
  filePath?: string;
  url?: string;
  replyMarkup?: Record<string, unknown>;
  parseMode?: "Markdown" | "HTML";
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
  const limited = await rateLimit("tg-bot-send", settings.rateLimitPerMinute, 60_000);
  if (!limited.ok) return { ok: false, error: "rate_limited" };
  return null;
}

async function telegramToken(): Promise<string> {
  const settings = await getCommsSettings();
  return settings.telegramBotToken;
}

export async function sendTelegramAdminMessage(
  text: string,
  options?: { replyMarkup?: Record<string, unknown>; parseMode?: "Markdown" | "HTML" }
): Promise<TelegramApiResult> {
  const settings = await getCommsSettings();
  const chatId = settings.telegramDefaultChatId?.trim();
  if (!chatId) return { ok: false, error: "telegram_no_default_chat_id" };
  return sendTelegramMessage({
    chatId,
    text,
    replyMarkup: options?.replyMarkup,
    parseMode: options?.parseMode || "Markdown",
  });
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
    const payload: Record<string, unknown> = {
      chat_id: chatId,
      text: String(input.text || "").slice(0, 3900),
      disable_web_page_preview: true,
    };
    if (input.parseMode) payload.parse_mode = input.parseMode;
    if (input.replyMarkup) payload.reply_markup = input.replyMarkup;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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

export async function editTelegramMessageText(
  input: TelegramEditInput
): Promise<TelegramApiResult> {
  const chatId = String(input.chatId || "").trim();
  if (!chatId || !input.messageId) return { ok: false, error: "invalid_chat_or_message" };
  const token = await telegramToken();
  const url = `https://api.telegram.org/bot${token}/editMessageText`;
  try {
    const payload: Record<string, unknown> = {
      chat_id: chatId,
      message_id: Number(input.messageId),
      text: String(input.text || "").slice(0, 3900),
      disable_web_page_preview: true,
    };
    if (input.parseMode) payload.parse_mode = input.parseMode;
    if (input.replyMarkup) payload.reply_markup = input.replyMarkup;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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

export async function answerTelegramCallbackQuery(input: {
  callbackQueryId: string;
  text?: string;
  showAlert?: boolean;
}): Promise<TelegramApiResult> {
  if (!input.callbackQueryId) return { ok: false, error: "invalid_callback_query_id" };
  const token = await telegramToken();
  const url = `https://api.telegram.org/bot${token}/answerCallbackQuery`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: input.callbackQueryId,
        text: input.text,
        show_alert: Boolean(input.showAlert),
      }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      description?: string;
    };
    return { ok: Boolean(data.ok), error: data.description };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "answer_callback_failed" };
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
