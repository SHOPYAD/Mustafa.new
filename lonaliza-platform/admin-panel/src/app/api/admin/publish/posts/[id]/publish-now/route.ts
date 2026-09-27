import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { NOT_APPROVED_AR } from "@/lib/publish/constants";
import { runPublishPost } from "@/lib/publish/engine";
import { schedulePublishNow } from "@/lib/publish/posts";
import { enqueuePublishPost } from "@/lib/publish/queue";
import { publishNowSchema } from "@/lib/publish/schemas";
import { getStoredChannel } from "@/lib/publish/store";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const { id } = await ctx.params;
    const body = publishNowSchema.parse(await req.json());
    if (body.approved !== true) {
      return NextResponse.json({ ok: false, error: NOT_APPROVED_AR }, { status: 400 });
    }
    const queued = await schedulePublishNow(id, true);
    if (!queued) {
      return NextResponse.json({ ok: false, error: "المنشور غير موجود" }, { status: 404 });
    }
    const channel = await getStoredChannel(queued.channelId);
    const enqueued = channel
      ? await enqueuePublishPost(queued, channel.provider, { approved: true })
      : false;
    if (enqueued) {
      return NextResponse.json({ ok: true, post: queued, enqueued: true });
    }
    const { post, result } = await runPublishPost(queued.id, { approved: true });
    return NextResponse.json({ ok: result.ok, post, result, enqueued: false });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "تعذّر النشر الفوري" },
      { status: 400 }
    );
  }
}
