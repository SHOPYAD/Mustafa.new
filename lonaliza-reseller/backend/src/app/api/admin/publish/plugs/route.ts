import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { deletePlug, listPlugs, plugCatalog, savePlug } from "@/lib/publish/plugs";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const plugs = await listPlugs();
  return NextResponse.json({ ok: true, plugs, catalog: plugCatalog() });
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const plug = await savePlug(await req.json());
    return NextResponse.json({ ok: true, plug });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "تعذّر حفظ القاعدة" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const id = new URL(req.url).searchParams.get("id") || "";
  if (!id) return NextResponse.json({ ok: false, error: "المعرّف مطلوب" }, { status: 400 });
  const deleted = await deletePlug(id);
  return NextResponse.json({ ok: deleted, deleted });
}
