import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { deleteRssFeed, listRssFeeds, previewRssFeed, saveRssFeed } from "@/lib/publish/rss";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const feeds = await listRssFeeds();
  return NextResponse.json({ ok: true, feeds });
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = (await req.json()) as Record<string, unknown>;
    if (typeof body.previewUrl === "string") {
      const preview = await previewRssFeed(body.previewUrl);
      return NextResponse.json({ ok: preview.success, preview, ...preview });
    }
    const feed = await saveRssFeed(body);
    return NextResponse.json({ ok: true, feed });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "تعذّر حفظ التغذية" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const id = new URL(req.url).searchParams.get("id") || "";
  if (!id) return NextResponse.json({ ok: false, error: "المعرّف مطلوب" }, { status: 400 });
  const deleted = await deleteRssFeed(id);
  return NextResponse.json({ ok: deleted, deleted });
}
