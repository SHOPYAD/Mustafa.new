import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { generatePublishImage } from "@/lib/publish/ai-media";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = (await req.json()) as { prompt?: string; aspectRatio?: "9:16" | "4:5" | "1:1" };
    const result = await generatePublishImage({
      prompt: String(body.prompt || ""),
      aspectRatio: body.aspectRatio,
    });
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true, url: result.media?.url, media: result.media });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "تعذّر توليد الصورة" },
      { status: 400 }
    );
  }
}
