import { NextResponse } from "next/server";
import { requireAdminForOAuth, redirectSocialAdmin } from "@/lib/social/oauth-redirect";
import { getTelegramBotToken } from "@/lib/social/env";
import {
  completeTelegramConnect,
  listTelegramChatsFromUpdates,
  renderTelegramConnectHtml,
  telegramGetMe,
} from "@/lib/social/platforms/telegram";

export const runtime = "nodejs";

async function telegramForm(req: Request): Promise<{
  botToken: string;
  chatId: string;
  intent: string;
}> {
  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const json = (await req.json()) as { botToken?: string; chatId?: string; intent?: string };
    return {
      botToken: (json.botToken || "").trim(),
      chatId: (json.chatId || "").trim(),
      intent: (json.intent || "connect").trim(),
    };
  }
  const form = await req.formData();
  const selected = String(form.get("chatIdSelect") || "").trim();
  return {
    botToken: String(form.get("botToken") || "").trim(),
    chatId: String(form.get("chatId") || "").trim() || selected,
    intent: String(form.get("intent") || "connect").trim(),
  };
}

export async function GET(req: Request) {
  const denied = await requireAdminForOAuth(req);
  if (denied) return denied;
  const preset = Boolean((await getTelegramBotToken()).trim());
  return new NextResponse(renderTelegramConnectHtml({ presetToken: preset, chats: [] }), {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function POST(req: Request) {
  const denied = await requireAdminForOAuth(req);
  if (denied) return denied;
  const body = await telegramForm(req);
  const token = body.botToken || (await getTelegramBotToken());
  try {
    if (body.intent === "discover") {
      if (!token) {
        return new NextResponse(
          renderTelegramConnectHtml({
            presetToken: false,
            chats: [],
            errorAr: "أدخل رمز البوت أولاً لاكتشاف المحادثات",
          }),
          { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
        );
      }
      await telegramGetMe(token);
      const chats = await listTelegramChatsFromUpdates(token);
      return new NextResponse(
        renderTelegramConnectHtml({
          presetToken: true,
          chats,
          errorAr: chats.length ? undefined : "لا توجد محادثات في getUpdates — أرسل رسالة للبوت أو الصق Chat ID يدوياً",
        }),
        { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }
    await completeTelegramConnect({ botToken: token, chatId: body.chatId });
    return redirectSocialAdmin(req, { connected: "telegram" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "فشل ربط تيليجرام";
    if (body.intent === "discover" || !body.chatId) {
      return new NextResponse(
        renderTelegramConnectHtml({
          presetToken: Boolean(token),
          chats: [],
          errorAr: message,
        }),
        { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }
    return redirectSocialAdmin(req, {
      error: "token_exchange_failed",
      provider: "telegram",
      detail: message.slice(0, 180),
    });
  }
}
