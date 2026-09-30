import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { createAdminPocketBase } from "@/lib/pocketbase/admin";
import { getCollectionMeta, redactRecord, searchFilter } from "@/lib/studio/server/pb-meta";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const sp = req.nextUrl.searchParams;
  const collection = sp.get("collection") || "";
  const meta = await getCollectionMeta(collection).catch(() => null);
  if (!meta) return NextResponse.json({ ok: false, error: "unknown_collection" }, { status: 404 });
  const pb = await createAdminPocketBase();
  try {
    const id = sp.get("id");
    if (id) {
      const rec = await pb.collection(collection).getOne(id);
      return NextResponse.json({ ok: true, item: redactRecord(meta, rec as unknown as Record<string, unknown>) });
    }
    const page = Math.max(1, Number(sp.get("page") || 1));
    const perPage = Math.min(100, Math.max(1, Number(sp.get("perPage") || 20)));
    const sortField = (sp.get("sort") || "-updated").replace(/[^a-zA-Z0-9_\-+,]/g, "");
    const known = new Set(["id", "created", "updated", ...meta.fields.map((f) => f.name)]);
    const sort = sortField
      .split(",")
      .filter((s) => known.has(s.replace(/^[-+]/, "")))
      .join(",");
    const filters = [searchFilter(meta, sp.get("q") || "")].filter(Boolean);
    const status = sp.get("status");
    if (status && meta.fields.some((f) => f.name === "status")) filters.push(`status = "${status.replace(/["\\]/g, "")}"`);
    const list = await pb.collection(collection).getList(page, perPage, {
      sort: sort || undefined,
      filter: filters.length ? filters.map((f) => `(${f})`).join(" && ") : undefined,
    });
    return NextResponse.json({
      ok: true,
      collection,
      page: list.page,
      perPage: list.perPage,
      totalItems: list.totalItems,
      totalPages: list.totalPages,
      items: list.items.map((r) => redactRecord(meta, r as unknown as Record<string, unknown>)),
    });
  } catch (e) {
    const status = (e as { status?: number }).status;
    if (status === 400 && sp.get("sort")) {
      return NextResponse.json({ ok: false, error: "invalid_sort" }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "records_failed" }, { status: status && status < 500 ? status : 502 });
  }
}
