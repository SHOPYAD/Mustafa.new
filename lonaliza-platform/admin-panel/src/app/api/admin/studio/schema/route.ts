import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { getCollectionMeta, listCollections } from "@/lib/studio/server/pb-meta";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const name = req.nextUrl.searchParams.get("collection");
  try {
    if (!name) {
      const all = await listCollections();
      return NextResponse.json({ ok: true, collections: [...all.values()].map((c) => ({ name: c.name, type: c.type, fields: c.fields.length })) });
    }
    const meta = await getCollectionMeta(name);
    if (!meta) return NextResponse.json({ ok: false, error: "unknown_collection" }, { status: 404 });
    return NextResponse.json({ ok: true, collection: meta.name, type: meta.type, fields: meta.fields });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "schema_failed" }, { status: 502 });
  }
}
