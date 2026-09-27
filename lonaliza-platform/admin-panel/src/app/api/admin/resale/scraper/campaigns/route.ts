import { NextResponse } from "next/server";
import { assertOriginOnly } from "@/lib/server/deployment-role";
import {
  getAllCampaigns,
  saveCampaign,
} from "@/lib/server/gmaps-scraper/reseller-leads-store";
import { executeCampaign } from "@/lib/server/gmaps-scraper/campaign-dispatcher";
import type { B2BCampaign } from "@/lib/server/gmaps-scraper/types";

export const runtime = "nodejs";

export async function GET() {
  try {
    assertOriginOnly("Reseller Campaigns API");
    const campaigns = getAllCampaigns();
    return NextResponse.json({ ok: true, campaigns });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "تعذر جلب الحملات" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    assertOriginOnly("Reseller Launch Campaign API");
    const body = (await req.json()) as {
      title: string;
      channel: "whatsapp" | "email";
      templateId: string;
      targetLeadIds: string[];
      jitterMinSeconds?: number;
      jitterMaxSeconds?: number;
    };

    if (!body.templateId || !Array.isArray(body.targetLeadIds) || body.targetLeadIds.length === 0) {
      return NextResponse.json(
        { ok: false, error: "يجب اختيار القالب وتحديد الشركات المستهدفة" },
        { status: 400 }
      );
    }

    const campaign: B2BCampaign = {
      id: `camp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      title: body.title || `حملة ${body.channel === "whatsapp" ? "واتساب" : "بريد"} (${body.targetLeadIds.length} شركة)`,
      channel: body.channel,
      templateId: body.templateId,
      targetLeadIds: body.targetLeadIds,
      status: "queued",
      totalRecipients: body.targetLeadIds.length,
      sentCount: 0,
      failedCount: 0,
      logs: [],
      jitterMinSeconds: body.jitterMinSeconds || 25,
      jitterMaxSeconds: body.jitterMaxSeconds || 50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveCampaign(campaign);

    // Launch background asynchronous dispatch
    void executeCampaign(campaign);

    return NextResponse.json({ ok: true, campaign });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "خطأ أثناء إطلاق الحملة" },
      { status: 500 }
    );
  }
}
