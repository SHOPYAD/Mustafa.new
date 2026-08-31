import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { parseMediaQuery, searchPexels } from "@/lib/server/media-search";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const { query, page, perPage } = parseMediaQuery(req.nextUrl.searchParams);
  if (!query) {
    return NextResponse.json(
      { ok: false, error: "query required" },
      { status: 400 }
    );
  }

  try {
    const result = await searchPexels({ query, page, perPage });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Pexels search failed";
    const missing = message.includes("not configured");
    return NextResponse.json(
      { ok: false, error: message },
      { status: missing ? 400 : 502 }
    );
  }
}
