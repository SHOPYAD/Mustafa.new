import { NextRequest, NextResponse } from "next/server";
import {
  customSlugFromPageId,
  isCustomPageId,
  resolvePageIdFromPath,
} from "@/lib/builder-pages";
import { getPageTheme } from "@/lib/server/page-themes-store";
import { getCustomPageBySlug } from "@/lib/server/pages-store";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const pageId =
    req.nextUrl.searchParams.get("pageId") ||
    resolvePageIdFromPath(req.nextUrl.searchParams.get("path") || "") ||
    "";

  if (!pageId) {
    return NextResponse.json({ ok: false, error: "pageId required" }, { status: 400 });
  }

  if (isCustomPageId(pageId)) {
    const slug = customSlugFromPageId(pageId);
    const page = slug ? await getCustomPageBySlug(slug) : null;
    return NextResponse.json({
      ok: true,
      pageId,
      tokens: page?.theme || {},
      layoutHints: page?.layoutHints || {},
    });
  }

  const record = await getPageTheme(pageId);
  return NextResponse.json({
    ok: true,
    pageId,
    tokens: record?.tokens || {},
    layoutHints: record?.layoutHints || {},
  });
}
