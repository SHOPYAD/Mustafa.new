import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { getCampaign, sendCampaignTest } from "@/lib/server/email/campaigns";
import { getAdminTestEmail } from "@/lib/server/email/smtp";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const { id } = await ctx.params;
    const campaign = await getCampaign(id);
    const body = (await req.json().catch(() => ({}))) as { to?: string };
    const to = String(body.to || (await getAdminTestEmail()) || "").trim();
    if (!to) {
      return NextResponse.json(
        { ok: false, error: "أدخل إيميل الأدمن للتجربة" },
        { status: 400 }
      );
    }
    const result = await sendCampaignTest({ templateId: campaign.template, to });
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
