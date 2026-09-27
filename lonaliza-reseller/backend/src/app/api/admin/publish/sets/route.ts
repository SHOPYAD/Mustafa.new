import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { deleteSet, listSets, saveSet } from "@/lib/publish/settings-store";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const sets = await listSets();
  return NextResponse.json({ ok: true, sets });
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const set = await saveSet(await req.json());
    return NextResponse.json({ ok: true, set });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "تعذّر حفظ المجموعة" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const id = new URL(req.url).searchParams.get("id")?.trim() || "";
  if (!id) {
    return NextResponse.json({ ok: false, error: "المعرّف مطلوب" }, { status: 400 });
  }
  const deleted = await deleteSet(id);
  return NextResponse.json({ ok: deleted, deleted });
}
