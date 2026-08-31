import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { resolveAdsCredentials } from "@/lib/ads/config";
import { wouldExceedCap } from "@/lib/ads/budget";
import { pauseGoogleCampaigns } from "@/lib/ads/google/campaigns";
import { fetchGoogleCampaignSpend } from "@/lib/ads/google/insights";
import { pauseMetaCampaigns } from "@/lib/ads/meta/campaigns";
import { fetchMetaCampaignSpend } from "@/lib/ads/meta/insights";
import { listCampaigns, patchCampaign } from "@/lib/ads/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  return NextResponse.json({ ok: true, campaigns: await listCampaigns() });
}

export async function POST(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  let body: { id?: string; action?: "pause" | "resume" };
  try {
    body = (await req.json()) as { id?: string; action?: "pause" | "resume" };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const id = String(body.id || "").trim();
  const action = body.action === "resume" ? "resume" : "pause";
  const rows = await listCampaigns();
  const row = rows.find((c) => c.id === id);
  if (!row) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  const creds = await resolveAdsCredentials();

  if (action === "pause") {
    if (row.platform === "google" && row.providerResource) {
      await pauseGoogleCampaigns(creds, [row.providerResource]);
    }
    if (row.platform === "meta" && row.providerId) {
      await pauseMetaCampaigns(creds, [row.providerId]);
    }
    const next = await patchCampaign(row.id, { status: "paused" });
    return NextResponse.json({ ok: true, campaign: next });
  }

  if (row.providerId) {
    const spend =
      row.platform === "google"
        ? await fetchGoogleCampaignSpend(creds, row.providerResource || row.providerId)
        : await fetchMetaCampaignSpend(creds, row.providerId);
    if (wouldExceedCap(spend.spendToday, row.dailyBudget)) {
      return NextResponse.json(
        { ok: false, error: "daily_cap_reached", spend: spend.spendToday },
        { status: 409 }
      );
    }
    if (row.lifetimeBudget && wouldExceedCap(spend.spendAll, row.lifetimeBudget)) {
      return NextResponse.json(
        { ok: false, error: "lifetime_cap_reached", spend: spend.spendAll },
        { status: 409 }
      );
    }
  }

  const next = await patchCampaign(row.id, { status: row.dryRun ? "dry_run" : "enabled" });
  return NextResponse.json({ ok: true, campaign: next });
}
