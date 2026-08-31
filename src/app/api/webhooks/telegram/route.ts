import { NextResponse } from "next/server";
import { sendTelegramMessage } from "@/lib/automation/channels/telegram";
import { recordTelegramInbound } from "@/lib/automation/optin-store";
import { handleTelegramApprovalText } from "@/lib/server/automation/approval-store";

export const runtime = "nodejs";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function inboundText(message: Record<string, unknown> | null): string {
  if (!message) return "";
  if (typeof message.text === "string") return message.text;
  if (typeof message.caption === "string") return message.caption;
  return "";
}

/**
 * Telegram inbound: always record opt-in first (OTP / audience).
 * Admin approval commands (انشر / أطلق / ارفض / عدّل) are parsed separately
 * and never replace the opt-in write.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: true });
  }

  const message = asRecord(body.message) || asRecord(body.edited_message);
  const chat = asRecord(message?.chat);
  const chatId = chat?.id != null ? String(chat.id) : "";
  if (chatId) await recordTelegramInbound(chatId);

  const text = inboundText(message);
  if (chatId && text) {
    try {
      const result = await handleTelegramApprovalText(chatId, text);
      if (result.handled && result.reply) {
        await sendTelegramMessage({ chatId, text: result.reply });
      }
    } catch {
      // Opt-in already persisted. Approval failures must not break inbound.
    }
  }

  return NextResponse.json({ ok: true });
}
