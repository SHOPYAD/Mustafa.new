import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  countCustomersWithEmail,
  createCampaign,
  listCampaigns,
} from "@/lib/server/email/campaigns";
import { isEmailCampaignAudience } from "@/lib/server/email/types";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const [campaigns, customerCount] = await Promise.all([
      listCampaigns().catch(() => []),
      countCustomersWithEmail().catch(() => 0),
    ]);
    return NextResponse.json({ ok: true, campaigns, customerCount });
  } catch (e) {
    return NextResponse.json(
      { ok: true, campaigns: [], customerCount: 0, error: e instanceof Error ? e.message : "" }
    );
  }
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = (await req.json()) as {
      name?: string;
      templateId?: string;
      audience?: string;
      csv?: string;
      csvName?: string;
      recipients?: Array<{ email?: string; name?: string; company?: string }>;
      scheduledAt?: string;
      batchSize?: number;
      sendMode?: "draft" | "now" | "schedule";
    };
    if (!body.templateId) {
      return NextResponse.json({ ok: false, error: "اختر قالباً" }, { status: 400 });
    }
    const audienceRaw = String(body.audience || "customers");
    const campaign = await createCampaign({
      name: String(body.name || "حملة جديدة"),
      templateId: body.templateId,
      audience: isEmailCampaignAudience(audienceRaw) ? audienceRaw : "customers",
      csv: body.csv,
      csvName: body.csvName,
      recipients: (body.recipients || [])
        .map((row) => ({
          email: String(row.email || "").trim().toLowerCase(),
          name: row.name || "",
          company: row.company || "",
        }))
        .filter((row) => row.email.includes("@")),
      scheduledAt: body.scheduledAt,
      batchSize: body.batchSize,
      sendMode: body.sendMode || "draft",
    });
    return NextResponse.json({ ok: true, campaign }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "تعذّر إنشاء الحملة" },
      { status: 400 }
    );
  }
}
