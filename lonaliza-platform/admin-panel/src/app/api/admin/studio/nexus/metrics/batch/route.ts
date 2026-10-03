import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Prefetch جيران الكاروسيل — يعيد توجيه كل hub إلى مسار المفرد (cache مشترك عبر الطلبات اللاحقة). */
export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const body = (await req.json().catch(() => ({}))) as { hubIds?: unknown };
  const hubIds = Array.isArray(body.hubIds) ? body.hubIds.map(String).filter(Boolean).slice(0, 8) : [];
  return NextResponse.json({ ok: true, hubIds, hint: "fetch /nexus/metrics?hubId= per id" });
}
