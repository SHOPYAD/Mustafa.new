import { sendTelegramDocument, sendTelegramMessage, sendTelegramPhoto } from "@/lib/automation/channels/telegram";
import { getCommsSettings } from "@/lib/automation/comms-settings";
import type { StudioNotifyPayload } from "@/lib/studio/creative/types";

function looksLikeVideo(pathOrUrl: string): boolean {
  return /\.(mp4|mov|webm|mkv)(\?|$)/i.test(pathOrUrl);
}

/**
 * Sends studio media to the admin Telegram chat (sendPhoto / sendDocument).
 * Falls back to paths-only payload when Telegram is not configured.
 */
export async function studioNotifyTelegram(input: {
  title: string;
  paths: string[];
  urls: string[];
}): Promise<StudioNotifyPayload> {
  const settings = await getCommsSettings();
  const chatId = (settings.telegramDefaultChatId || "").trim();
  const paths = input.paths.filter(Boolean);
  const urls = input.urls.filter(Boolean);
  const base: StudioNotifyPayload = {
    channel: "paths-only",
    message: input.title,
    paths,
    urls,
    sent: false,
  };

  if (!chatId || !settings.telegramBotToken) {
    return { ...base, error: "telegram_not_configured" };
  }

  const caption = `${input.title}\n\nانشر للموافقة`.slice(0, 1024);
  let sentAny = false;
  let lastError: string | undefined;

  for (const filePath of paths) {
    const isVideo = looksLikeVideo(filePath);
    const result = isVideo
      ? await sendTelegramDocument({ chatId, filePath, caption })
      : await sendTelegramPhoto({ chatId, filePath, caption });
    if (result.ok) sentAny = true;
    else lastError = result.error || lastError;
  }

  if (!sentAny && !paths.length && urls.length) {
    const text = `${input.title}\n${urls.join("\n")}\n\nأجب: انشر`;
    const result = await sendTelegramMessage({ chatId, text });
    if (result.ok) sentAny = true;
    else lastError = result.error;
  } else if (sentAny || paths.length) {
    await sendTelegramMessage({
      chatId,
      text: `${input.title}\nأجب: انشر / أطلق (مع ميزانية) / ارفض / عدّل`,
    }).catch(() => undefined);
  }

  return {
    channel: sentAny ? "telegram" : "paths-only",
    message: input.title,
    paths,
    urls,
    sent: sentAny,
    error: sentAny ? undefined : lastError || "telegram_send_failed",
  };
}

/** @deprecated Prefer studioNotifyTelegram — kept for sync path builders. */
export function studioNotifyPaths(input: {
  title: string;
  paths: string[];
  urls: string[];
}): StudioNotifyPayload {
  return {
    channel: "paths-only",
    message: input.title,
    paths: input.paths,
    urls: input.urls,
    sent: false,
  };
}
