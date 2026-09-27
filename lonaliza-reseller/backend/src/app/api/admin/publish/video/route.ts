import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { generatePublishVideo, listPublishVideoOptions } from "@/lib/publish/ai-media";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const options = await listPublishVideoOptions();
  return NextResponse.json({ ok: true, video: options, options });
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = (await req.json()) as {
      prompt?: string;
      identifier?: string;
      output?: "vertical" | "horizontal";
    };
    const result = await generatePublishVideo({
      prompt: String(body.prompt || ""),
      identifier: body.identifier,
      output: body.output,
    });
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true, url: result.media?.url, media: result.media });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "تعذّر توليد الفيديو" },
      { status: 400 }
    );
  }
}
