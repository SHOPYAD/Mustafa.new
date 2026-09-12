import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { dispatchDueCampaigns, patchCampaign } from "@/lib/server/email/campaigns";
import { auditFromRequest } from "@/lib/server/admin-audit";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const { id } = await ctx.params;
    await patchCampaign(id, { status: "queued" });
    await auditFromRequest(req, "email.campaign.send", true, id);
    const batch = await dispatchDueCampaigns();
    return NextResponse.json({ ok: true, batch });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "تعذّر الإرسال" },
      { status: 400 }
    );
  }
}
