import { getTelegramBotToken } from "../env";
import { fetchJsonWithRetry, SocialHttpError } from "../http";
import { upsertPublishOAuthChannel } from "../publish-channel-connect";
import { saveTelegramBotTokenToApps } from "../oauth-apps";
import { saveServerEnv } from "@/lib/server/env-store";
import type { PublishChannel } from "@/lib/publish/types";

type TelegramApi<T> = { ok?: boolean; description?: string; result?: T };

export type TelegramChatChoice = {
  id: string;
  label: string;
  hint?: string;
};

function botUrl(token: string, method: string, query?: Record<string, string>): string {
  const base = `https://api.telegram.org/bot${token}/${method}`;
  if (!query) return base;
  return `${base}?${new URLSearchParams(query).toString()}`;
}

export async function telegramGetMe(token: string): Promise<{ id: number; username?: string; first_name?: string }> {
  try {
    const data = await fetchJsonWithRetry<TelegramApi<{ id: number; username?: string; first_name?: string }>>(
      botUrl(token, "getMe")
    );
    if (!data.ok || !data.result?.id) {
      throw new SocialHttpError(data.description || "رمز بوت تيليجرام غير صالح", 400, false, data);
    }
    return data.result;
  } catch (err) {
    if (err instanceof SocialHttpError) {
      throw new SocialHttpError("رمز بوت تيليجرام غير صالح", err.status, false, err.body);
    }
    throw err;
  }
}

export async function telegramGetChat(
  token: string,
  chatId: string
): Promise<{ id: number; title?: string; username?: string; type?: string }> {
  try {
    const data = await fetchJsonWithRetry<
      TelegramApi<{ id: number; title?: string; username?: string; type?: string }>
    >(botUrl(token, "getChat", { chat_id: chatId }));
    if (!data.ok || data.result?.id == null) {
      throw new SocialHttpError(
        data.description || "معرّف المحادثة غير صالح أو البوت ليس عضواً فيها",
        400,
        false,
        data
      );
    }
    return data.result;
  } catch (err) {
    if (err instanceof SocialHttpError) {
      throw new SocialHttpError(
        "معرّف المحادثة غير صالح أو البوت ليس عضواً فيها",
        err.status,
        false,
        err.body
      );
    }
    throw err;
  }
}

export async function listTelegramChatsFromUpdates(token: string): Promise<TelegramChatChoice[]> {
  const data = await fetchJsonWithRetry<
    TelegramApi<Array<{ message?: { chat?: { id?: number; title?: string; username?: string; type?: string } } }>>
  >(botUrl(token, "getUpdates", { limit: "50" }));
  const map = new Map<string, TelegramChatChoice>();
  for (const row of data.result || []) {
    const chat = row.message?.chat;
    if (chat?.id == null) continue;
    const id = String(chat.id);
    map.set(id, {
      id,
      label: chat.title || (chat.username ? `@${chat.username}` : id),
      hint: chat.type,
    });
  }
  return [...map.values()];
}

export async function completeTelegramConnect(input: {
  botToken?: string;
  chatId: string;
}): Promise<PublishChannel> {
  const token = (input.botToken || (await getTelegramBotToken()) || "").trim();
  const chatId = input.chatId.trim();
  if (!token) {
    throw new SocialHttpError("أدخل رمز بوت تيليجرام من BotFather", 400, false);
  }
  if (!chatId) {
    throw new SocialHttpError("أدخل معرّف المحادثة أو اختر قناة من القائمة", 400, false);
  }
  const me = await telegramGetMe(token);
  const chat = await telegramGetChat(token, chatId);
  if (!process.env.VITEST) {
    try {
      await saveServerEnv({ TELEGRAM_BOT_TOKEN: token });
    } catch {
      /* overlay optional */
    }
  }
  await saveTelegramBotTokenToApps(token);

  const name = chat.title || (chat.username ? `@${chat.username}` : `Telegram ${chat.id}`);
  return upsertPublishOAuthChannel({
    provider: "telegram",
    name,
    accessToken: String(chat.id),
    pageAccessToken: token,
    extra: {
      externalId: String(chat.id),
      pageId: String(chat.id),
      username: chat.username || me.username,
      scopes: ["bot"],
    },
  });
}

export function renderTelegramConnectHtml(opts: {
  presetToken: boolean;
  chats: TelegramChatChoice[];
  errorAr?: string;
}): string {
  const chatOptions = opts.chats
    .map(
      (chat) =>
        `<option value="${escapeHtml(chat.id)}">${escapeHtml(chat.label)}${chat.hint ? ` (${escapeHtml(chat.hint)})` : ""}</option>`
    )
    .join("");
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>ربط تيليجرام</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: Cairo, system-ui, sans-serif; background: #090d16; color: #f8fafc; margin: 0; padding: 24px; }
    .card { max-width: 480px; margin: 0 auto; background: #0f172a; border: 1px solid rgba(148,163,184,.2); border-radius: 24px; padding: 28px 22px; }
    h1 { font-size: 18px; margin: 0 0 8px; }
    p, li { color: #94a3b8; font-size: 13px; line-height: 1.6; }
    label { display: block; font-size: 12px; font-weight: 700; margin: 12px 0 6px; }
    input, select { width: 100%; padding: 12px; border-radius: 14px; border: 1px solid #334155; background: #1e293b; color: #fff; box-sizing: border-box; }
    button { width: 100%; margin-top: 16px; padding: 12px; border: 0; border-radius: 14px; background: #229ed9; color: #fff; font-weight: 800; cursor: pointer; }
    .err { background: rgba(239,68,68,.15); border: 1px solid rgba(239,68,68,.3); color: #fca5a5; padding: 10px; border-radius: 12px; font-size: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>ربط قناة تيليجرام</h1>
    <p>لا يوجد OAuth لتيليجرام. أنشئ بوتاً عبر BotFather ثم أضف البوت مشرفاً على القناة أو المجموعة.</p>
    ${opts.errorAr ? `<div class="err">${escapeHtml(opts.errorAr)}</div>` : ""}
    <form method="POST" action="/api/oauth/telegram">
      <label>رمز البوت (Bot Token)</label>
      <input type="password" name="botToken" ${opts.presetToken ? "" : "required"} placeholder="${opts.presetToken ? "محفوظ مسبقاً — اتركه فارغاً أو الصق رمزاً جديداً" : "123456:ABC..."}" autocomplete="off" />
      <label>معرّف المحادثة (Chat ID)</label>
      <input type="text" name="chatId" placeholder="-1001234567890 أو @channel" ${opts.chats.length ? "" : "required"} />
      ${
        opts.chats.length
          ? `<label>أو اختر محادثة اكتشفها البوت</label><select name="chatIdSelect"><option value="">—</option>${chatOptions}</select>`
          : "<p>بعد حفظ الرمز يمكن جلب المحادثات التي راسلت البوت مؤخراً عبر getUpdates.</p>"
      }
      <button type="submit" name="intent" value="connect">حفظ وربط القناة</button>
      <button type="submit" name="intent" value="discover" style="background:#334155;margin-top:8px">اكتشاف المحادثات من getUpdates</button>
    </form>
  </div>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
