import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { AGENT_READY_REPLY_AR, handlePublishAgentMessage } from "@/lib/publish/agent";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  return NextResponse.json({
    ok: true,
    reply: AGENT_READY_REPLY_AR,
  });
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  try {
    const result = await handlePublishAgentMessage(body);
    return NextResponse.json({
      ok: true,
      reply: result.reply,
      posts: result.posts,
      approved: false,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        approved: false,
        error: err instanceof Error ? err.message : "تعذّر الرد من وكيل النشر",
        reply: "تعذّر حفظ المسودة. استخدم الملحن أو التقويم للجدولة.",
      },
      { status: 400 }
    );
  }
}
