import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { listMergedTours, upsertTour } from "@/lib/server/tours-store";
import type { Tour } from "@/data/tours";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const tours = await listMergedTours();
  return NextResponse.json(
    { ok: true, tours },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function DELETE(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id") || "";
    if (!id) {
      const body = (await req.json().catch(() => ({}))) as { id?: string };
      id = body.id || "";
    }
    if (!id) {
      return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
    }
    const { deleteTour } = await import("@/lib/server/tours-store");
    const ok = await deleteTour(id);
    return NextResponse.json({ ok });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Delete failed" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = (await req.json()) as { action?: string };
    if (body.action === "reset") {
      const { resetExtraTours } = await import("@/lib/server/tours-store");
      const tours = await resetExtraTours();
      return NextResponse.json({ ok: true, tours });
    }
    return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Patch failed" },
      { status: 500 }
    );
  }
}
