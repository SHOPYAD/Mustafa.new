import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  listMergedPackages,
  resetExtraPackages,
  syncPublishedPackages,
  unpublishPackage,
  upsertPublishedPackage,
} from "@/lib/server/packages-store";
import type { HolidayPackage } from "@/types/package";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const packages = await listMergedPackages();
  return NextResponse.json(
    { ok: true, packages },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = (await req.json()) as Partial<HolidayPackage> &
      Record<string, unknown>;
    const pkg = await upsertPublishedPackage(body);
    return NextResponse.json({ ok: true, package: pkg });
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
    const body = (await req.json()) as Partial<HolidayPackage> &
      Record<string, unknown> & { id?: string };
    if (!body.id && !body.slug) {
      return NextResponse.json(
        { ok: false, error: "id or slug required" },
        { status: 400 }
      );
    }
    const pkg = await upsertPublishedPackage(body);
    return NextResponse.json({ ok: true, package: pkg });
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
    const ok = await unpublishPackage(id);
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
    const body = (await req.json()) as {
      action?: string;
      packages?: Array<Partial<HolidayPackage> & Record<string, unknown>>;
    };
    if (body.action === "reset") {
      const packages = await resetExtraPackages();
      return NextResponse.json({ ok: true, packages });
    }
    if (body.action === "sync") {
      const incoming = Array.isArray(body.packages) ? body.packages : [];
      const saved = await syncPublishedPackages(incoming);
      const packages = await listMergedPackages();
      return NextResponse.json({ ok: true, saved: saved.length, packages });
    }
    return NextResponse.json(
      { ok: false, error: "Unknown action" },
      { status: 400 }
    );
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Patch failed" },
      { status: 500 }
    );
  }
}
