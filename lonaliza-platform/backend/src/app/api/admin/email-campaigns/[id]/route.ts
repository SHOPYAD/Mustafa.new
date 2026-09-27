import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { getCampaign, patchCampaign } from "@/lib/server/email/campaigns";
import { EMAIL_CAMPAIGN_STATUSES } from "@/lib/server/email/types";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const { id } = await ctx.params;
    const campaign = await getCampaign(id);
    return NextResponse.json({ ok: true, campaign });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "غير موجود" },
      { status: 404 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const { id } = await ctx.params;
    const body = (await req.json()) as { status?: string; scheduledAt?: string };
    const status = EMAIL_CAMPAIGN_STATUSES.includes(
      body.status as (typeof EMAIL_CAMPAIGN_STATUSES)[number]
    )
      ? (body.status as (typeof EMAIL_CAMPAIGN_STATUSES)[number])
      : undefined;
    const campaign = await patchCampaign(id, {
      status,
      scheduledAt: body.scheduledAt,
    });
    return NextResponse.json({ ok: true, campaign });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "تعذّر التحديث" },
      { status: 400 }
    );
  }
}
