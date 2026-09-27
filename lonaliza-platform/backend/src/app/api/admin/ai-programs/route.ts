import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  deleteAiProgram,
  listAiPrograms,
  setAiProgramHidden,
} from "@/lib/server/ai-programs-store";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const programs = await listAiPrograms({ includeHidden: true });
  return NextResponse.json({ ok: true, programs });
}

export async function PATCH(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = (await req.json()) as { id?: string; hidden?: boolean };
    const id = String(body.id || "").trim();
    if (!id) {
      return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
    }
    const program = await setAiProgramHidden(id, Boolean(body.hidden));
    if (!program) {
      return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, program });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Update failed" },
      { status: 500 }
    );
  }
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
    const removed = await deleteAiProgram(id);
    if (!removed) {
      return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Delete failed" },
      { status: 500 }
    );
  }
}
