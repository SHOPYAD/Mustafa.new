import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { deleteClause } from "@/lib/server/legal-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { ok: false, error: "معرف البند مطلوب" },
        { status: 400 }
      );
    }

    const deleted = await deleteClause(id);
    if (!deleted) {
      return NextResponse.json(
        { ok: false, error: "لم يتم العثور على البند المطلوب حذفه" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, message: "تم حذف البند بنجاح" });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to delete clause" },
      { status: 500 }
    );
  }
}
