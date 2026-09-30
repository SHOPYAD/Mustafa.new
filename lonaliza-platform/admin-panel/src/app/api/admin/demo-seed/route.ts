import { assertAdminApi } from "@/lib/server/admin-auth";
import { NextResponse } from "next/server";
import { getDemoSeedStats, bulkDeleteDemoSeed } from "@/lib/server/demo-seed";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const stats = await getDemoSeedStats();
    const total = stats.packages + stats.tours + stats.articles + stats.bookings + stats.coupons;
    return NextResponse.json({ ok: true, stats, total });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load demo stats";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = (await req.json()) as { action: "delete_all" };
    if (body.action === "delete_all") {
      const result = await bulkDeleteDemoSeed();
      return NextResponse.json({
        ok: true,
        message: `تم حذف ${result.deletedCount} سجل تجريبي بنجاح`,
        deletedCount: result.deletedCount,
      });
    }
    return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete demo seed";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
