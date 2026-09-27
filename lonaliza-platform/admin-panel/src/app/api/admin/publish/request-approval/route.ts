import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { sendTelegramAdminMessage } from "@/lib/automation/channels/telegram";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = (await req.json()) as { postIds?: unknown; summary?: unknown };
    const postIds = Array.isArray(body.postIds) ? body.postIds.map(String).filter(Boolean) : [];
    const summary = String(body.summary || "").trim();
    if (postIds.length === 0) {
      return NextResponse.json({ ok: false, error: "لا منشورات للاعتماد" }, { status: 400 });
    }
    const text = [
      "طلب اعتماد محرك النشر",
      summary || "بدون ملخص",
      `المنشورات: ${postIds.join(", ")}`,
      "لن يُنشر شيء قبل موافقة صريحة (approved=true).",
    ].join("\n");
    const sent = await sendTelegramAdminMessage(text, { parseMode: undefined });
    if (!sent.ok) {
      return NextResponse.json(
        { ok: false, notified: false, error: sent.error || "تيليجرام غير مهيأ" },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: true, notified: true, postIds });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "تعذّر إرسال طلب الاعتماد" },
      { status: 400 }
    );
  }
}
