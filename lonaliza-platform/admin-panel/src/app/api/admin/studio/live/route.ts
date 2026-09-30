import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { createAdminPocketBase } from "@/lib/pocketbase/admin";
import { listCollections } from "@/lib/studio/server/pb-meta";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** عدّادات حية لمجموعات الخريطة المعروضة. المجهول يرجع null لا صفر. */
export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const names = (req.nextUrl.searchParams.get("collections") || "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, 60);
  const known = await listCollections().catch(() => null);
  const pb = await createAdminPocketBase();
  const counts: Record<string, { totalItems: number | null; state: "live" | "missing" | "error" }> = {};
  await Promise.all(
    names.map(async (name) => {
      if (known && !known.has(name)) {
        counts[name] = { totalItems: null, state: "missing" };
        return;
      }
      try {
        const r = await pb.collection(name).getList(1, 1, { fields: "id", skipTotal: false });
        counts[name] = { totalItems: r.totalItems, state: "live" };
      } catch {
        counts[name] = { totalItems: null, state: "error" };
      }
    })
  );
  return NextResponse.json({ ok: true, fetchedAt: new Date().toISOString(), counts });
}
