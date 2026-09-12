import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/server/admin-auth";
import { getCustomPageBySlug, getPublishedPageBySlug } from "@/lib/server/pages-store";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const builder =
    req.nextUrl.searchParams.get("builder") === "1" ||
    req.nextUrl.searchParams.get("builder") === "true";
  const page =
    builder && (await isAdminRequest(req))
      ? await getCustomPageBySlug(slug)
      : await getPublishedPageBySlug(slug);
  if (!page) {
    return NextResponse.json(
      { ok: false, error: "not_found" },
      { status: 404, headers: { "Cache-Control": "no-store" } }
    );
  }
  return NextResponse.json(
    { ok: true, page },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
