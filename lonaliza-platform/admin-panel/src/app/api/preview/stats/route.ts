import { NextRequest, NextResponse } from "next/server";
import { collectDashboardStats } from "@/lib/server/dashboard-stats";

export const runtime = "nodejs";

export async function GET(_req: NextRequest) {
  try {
    const stats = await collectDashboardStats();
    if (stats.bookings && stats.bookings.recent) {
      stats.bookings.recent = stats.bookings.recent.map((b) => ({
        ...b,
        name: b.name ? b.name.replace(/^(.).+(.)$/, "$1***$2") : "VIP Traveler",
      }));
    }
    return NextResponse.json({ ok: true, stats, isPreview: true });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: "preview_stats_unavailable",
    });
  }
}
