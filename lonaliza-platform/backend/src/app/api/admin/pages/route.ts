import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  createCustomPage,
  deleteCustomPage,
  listCustomPages,
  updateCustomPage,
} from "@/lib/server/pages-store";
import type { CustomPageInput } from "@/types/custom-page";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const pages = await listCustomPages();
  return NextResponse.json({ ok: true, pages });
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = (await req.json()) as CustomPageInput;
    const result = await createCustomPage(body);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: true, page: result.page });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Create failed" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = (await req.json()) as CustomPageInput & { id?: string };
    if (!body.id) {
      return NextResponse.json(
        { ok: false, error: "id required" },
        { status: 400 }
      );
    }
    const result = await updateCustomPage(body.id, body);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: true, page: result.page });
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
      return NextResponse.json(
        { ok: false, error: "id required" },
        { status: 400 }
      );
    }
    const result = await deleteCustomPage(id);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Delete failed" },
      { status: 500 }
    );
  }
}
