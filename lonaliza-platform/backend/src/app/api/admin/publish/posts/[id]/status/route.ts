import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { getStoredChannel } from "@/lib/publish/store";
import { changePostStatus } from "@/lib/publish/posts";
import { enqueuePublishPost } from "@/lib/publish/queue";
import { changeStatusSchema } from "@/lib/publish/schemas";
import { postApproved } from "@/lib/publish/state";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const { id } = await ctx.params;
    const body = changeStatusSchema.parse(await req.json());
    const post = await changePostStatus(id, body);
    if (!post) {
      return NextResponse.json({ ok: false, error: "المنشور غير موجود" }, { status: 404 });
    }
    if (post.state === "queue" && postApproved(post)) {
      const channel = await getStoredChannel(post.channelId);
      if (channel) {
        await enqueuePublishPost(post, channel.provider, { approved: true });
      }
    }
    return NextResponse.json({ ok: true, post });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "تعذّر تغيير الحالة" },
      { status: 400 }
    );
  }
}
