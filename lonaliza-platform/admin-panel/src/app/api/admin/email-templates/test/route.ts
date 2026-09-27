import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { sendCampaignTest } from "@/lib/server/email/campaigns";
import { getAdminTestEmail } from "@/lib/server/email/smtp";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = (await req.json()) as { templateId?: string; to?: string };
    if (!body.templateId) {
      return NextResponse.json({ ok: false, error: "templateId مطلوب" }, { status: 400 });
    }
    const to = String(body.to || (await getAdminTestEmail()) || "").trim();
    if (!to) {
      return NextResponse.json(
        { ok: false, error: "أدخل إيميل الأدمن للتجربة" },
        { status: 400 }
      );
    }
    const result = await sendCampaignTest({ templateId: body.templateId, to });
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true, to });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "فشل الإرسال التجريبي" },
      { status: 500 }
    );
  }
}
