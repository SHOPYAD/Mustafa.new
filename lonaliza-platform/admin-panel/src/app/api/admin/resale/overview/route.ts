import { assertAdminApi } from "@/lib/server/admin-auth";
import { NextResponse } from "next/server";
import {
  getResellerOverviewStats,
  getResellerCompanies,
  getResellerLicenses,
} from "@/lib/server/resale-store";
import { assertOriginOnly } from "@/lib/server/deployment-role";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    assertOriginOnly("Reseller Overview API");
    const [stats, companies, licenses] = await Promise.all([
      getResellerOverviewStats(),
      getResellerCompanies(),
      getResellerLicenses(),
    ]);

    return NextResponse.json({
      ok: true,
      stats,
      recentCompanies: companies.slice(0, 5),
      recentLicenses: licenses.slice(0, 5),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load overview";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
