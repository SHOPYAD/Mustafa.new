import { NextRequest, NextResponse } from "next/server";
import { runPublishPost } from "@/lib/publish/engine";
import {
  createPublicApiPost,
  PublicApiApprovalError,
  wantsImmediatePublish,
} from "@/lib/publish/public-api";
import { assertPublishPublicApi } from "@/lib/publish/public-auth";
import { listPosts, schedulePublishNow } from "@/lib/publish/posts";
import { enqueuePublishPost } from "@/lib/publish/queue";
import { listPostsQuerySchema } from "@/lib/publish/schemas";
import { isPublishState } from "@/lib/publish/state";
import { getStoredChannel } from "@/lib/publish/store";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertPublishPublicApi(req);
  if (denied) return denied;
  const url = new URL(req.url);
  const parsed = listPostsQuerySchema.safeParse({
    from: url.searchParams.get("from") || undefined,
    to: url.searchParams.get("to") || undefined,
    state: url.searchParams.get("state") || undefined,
    channelId:
      url.searchParams.get("channelId") ||
      url.searchParams.get("channel") ||
      url.searchParams.get("integration") ||
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
  const denied = await assertPublishPublicApi(req);
  if (denied) return denied;
  try {
    const body: unknown = await req.json();
    const post = await createPublicApiPost(body);
    const rec = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
    if (!wantsImmediatePublish(body) || rec.approved !== true) {
      return NextResponse.json({ ok: true, post, publishedToNetwork: false });
    }
    const queued = await schedulePublishNow(post.id, true);
    if (!queued) {
      return NextResponse.json({ ok: false, error: "المنشور غير موجود" }, { status: 404 });
    }
    const channel = await getStoredChannel(queued.channelId);
    const enqueued = channel
      ? await enqueuePublishPost(queued, channel.provider, { approved: true })
      : false;
    if (enqueued) {
      return NextResponse.json({
        ok: true,
        post: queued,
        enqueued: true,
        publishedToNetwork: false,
      });
    }
    const ran = await runPublishPost(queued.id, { approved: true });
    return NextResponse.json({
      ok: ran.result.ok,
      post: ran.post,
      result: ran.result,
      enqueued: false,
      publishedToNetwork: ran.result.ok,
    });
  } catch (err) {
    const approval = err instanceof PublicApiApprovalError;
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "تعذّر إنشاء المنشور",
      },
      { status: approval ? 400 : 400 }
    );
  }
}
