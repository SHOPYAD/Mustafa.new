import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { createPost, listPosts } from "@/lib/publish/posts";
import { listPostsQuerySchema } from "@/lib/publish/schemas";
import { isPublishState } from "@/lib/publish/state";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const url = new URL(req.url);
  const parsed = listPostsQuerySchema.safeParse({
    from: url.searchParams.get("from") || undefined,
    to: url.searchParams.get("to") || undefined,
    state: url.searchParams.get("state") || undefined,
    channelId:
      url.searchParams.get("channelId") ||
      url.searchParams.get("channel") ||
      undefined,
  });
  const filters = parsed.success ? parsed.data : {};
  const state = filters.state && isPublishState(filters.state) ? filters.state : undefined;
  const { posts, store } = await listPosts({
    from: filters.from,
    to: filters.to,
    state,
    channelId: filters.channelId,
  });
  return NextResponse.json({ ok: true, posts, store });
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const post = await createPost(await req.json());
    return NextResponse.json({ ok: true, post });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "تعذّر إنشاء المنشور" },
      { status: 400 }
    );
  }
}
