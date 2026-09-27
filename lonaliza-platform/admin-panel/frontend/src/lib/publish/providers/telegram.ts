import { z } from "zod";
import type { PublishContext, PublishProviderResult } from "../types";
import {
  createHttpHandler,
  envValue,
  fail,
  firstCommentOf,
  isVideoPath,
  missingToken,
  okResult,
  providerJson,
  type ValidatingPublishHandler,
} from "./http-base";

const telegramSettingsSchema = z
  .object({
    firstComment: z.string().optional(),
  })
  .passthrough();

type TelegramSettings = z.infer<typeof telegramSettingsSchema>;

type TelegramApi = {
  ok?: boolean;
  description?: string;
  result?: { message_id?: number } | Array<{ message_id?: number }>;
};

function chatIdOf(ctx: PublishContext): string {
  return (
    (ctx.channel.extra.externalId || "").trim() ||
    (ctx.channel.extra.pageId || "").trim() ||
    (ctx.accessToken || "").trim()
  );
}

async function botToken(ctx?: PublishContext): Promise<string> {
  const fromChannel = (ctx?.pageAccessToken || "").trim();
  if (fromChannel) return fromChannel;
  const env = await envValue("TELEGRAM_BOT_TOKEN", "TELEGRAM_TOKEN");
  if (env) return env;
  if (process.env.VITEST) return "";
  try {
    const { getCommsSettings } = await import("@/lib/automation/comms-settings");
    return ((await getCommsSettings()).telegramBotToken || "").trim();
  } catch {
    return "";
  }
}

function telegramHtml(input: string): string {
  return input
    .replace(/<strong>/gi, "<b>")
    .replace(/<\/strong>/gi, "</b>")
    .replace(/<p>([\s\S]*?)<\/p>/gi, "$1\n")
    .replace(/<(?!\/?(?:b|i|u|s|a|code|pre)\b)[^>]+>/gi, "");
}

function mediaType(url: string): "photo" | "video" | "document" {
  if (isVideoPath(url)) return "video";
  if (/\.(jpe?g|png|gif|webp)$/i.test(url.split("?")[0] || "")) return "photo";
  return "document";
}

function releaseUrl(usernameOrId: string, chatId: string, messageId: number): string {
  if (usernameOrId && usernameOrId !== "undefined") {
    return `https://t.me/${usernameOrId.replace(/^@/, "")}/${messageId}`;
  }
  return `https://t.me/c/${chatId.replace(/^-100/, "")}/${messageId}`;
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

async function telegramCall(
  token: string,
  method: string,
  body: Record<string, unknown>
): Promise<TelegramApi> {
  const { data } = await providerJson<TelegramApi>(
    `https://api.telegram.org/bot${token}/${method}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  if (!data?.ok) {
    throw new Error(data?.description || `telegram_${method}_failed`);
  }
  return data;
}

function messageIdOf(data: TelegramApi): number | undefined {
  const result = data.result;
  if (Array.isArray(result)) return result[0]?.message_id;
  return result?.message_id;
}

async function sendTelegram(
  token: string,
  chatId: string,
  text: string,
  mediaUrls: string[],
  replyTo?: number
): Promise<number> {
  const html = telegramHtml(text);
  const reply = replyTo ? { reply_to_message_id: replyTo } : {};
  if (mediaUrls.length === 0) {
    const data = await telegramCall(token, "sendMessage", {
      chat_id: chatId,
      text: html || " ",
      parse_mode: "HTML",
      ...reply,
    });
    const id = messageIdOf(data);
    if (!id) throw new Error("تيليغرام لم يُرجع رقم الرسالة");
    return id;
  }

  if (mediaUrls.length === 1) {
    const url = mediaUrls[0];
    const kind = mediaType(url);
    const method =
      kind === "video" ? "sendVideo" : kind === "photo" ? "sendPhoto" : "sendDocument";
    const field = kind === "video" ? "video" : kind === "photo" ? "photo" : "document";
    const data = await telegramCall(token, method, {
      chat_id: chatId,
      [field]: url,
      caption: html || undefined,
      parse_mode: "HTML",
      ...reply,
    });
    const id = messageIdOf(data);
    if (!id) throw new Error("تيليغرام لم يُرجع رقم الرسالة");
    return id;
  }

  let firstId: number | undefined;
  const groups = chunk(mediaUrls, 10);
  for (let i = 0; i < groups.length; i++) {
    const media = groups[i].map((url, index) => ({
      type: mediaType(url),
      media: url,
      caption: i === 0 && index === 0 ? html : undefined,
      parse_mode: "HTML",
    }));
    const data = await telegramCall(token, "sendMediaGroup", {
      chat_id: chatId,
      media,
      ...(i === 0 ? reply : {}),
    });
    if (i === 0) firstId = messageIdOf(data);
  }
  if (!firstId) throw new Error("تيليغرام لم يُرجع رقم الرسالة");
  return firstId;
}

export function telegramHandler(): ValidatingPublishHandler {
  return createHttpHandler({
    id: "telegram",
    maxLength: 4096,
    settingsSchema: telegramSettingsSchema,
    credentials: async (ctx) => {
      const chat = chatIdOf(ctx);
      if (!chat) {
        return missingToken("لا يوجد معرّف محادثة تيليغرام. أعد ربط القناة.");
      }
      const token = await botToken(ctx);
      if (!token) {
        return missingToken(
          "لا يوجد رمز بوت تيليغرام. أضف TELEGRAM_BOT_TOKEN أو أعد ربط القناة."
        );
      }
      return { ok: true };
    },
    async publishApproved(ctx: PublishContext, settings: TelegramSettings) {
      const chat = chatIdOf(ctx);
      const token = await botToken(ctx);
      if (!chat || !token) {
        return fail("telegram", "missing_credentials", "لا توجد بيانات اعتماد لتيليغرام.");
      }
      const username = (ctx.channel.extra.username || ctx.channel.extra.externalId || "").trim();
      const messageId = await sendTelegram(token, chat, ctx.caption, ctx.mediaUrls);
      const comment = firstCommentOf(settings);
      if (comment) {
        await sendTelegram(token, chat, comment, [], messageId);
      }
      return okResult("telegram", String(messageId), releaseUrl(username, chat, messageId));
    },
  });
}
