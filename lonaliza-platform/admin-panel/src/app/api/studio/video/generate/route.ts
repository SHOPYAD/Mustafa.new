import { NextRequest, NextResponse } from "next/server";
import { siteOrigin } from "@/lib/automation/site-url";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { queueStudioPublishApproval } from "@/lib/server/mcp/connectors/studio-handoff";
import { resolveGeminiApiKey } from "@/lib/server/gemini";
import { studioNotifyTelegram } from "@/lib/studio/creative/notify";
import { writeStudioLastOutput } from "@/lib/studio/last-output";
import { detectStudioModels } from "@/lib/studio/video/detect-models";
import { resolveFfmpeg } from "@/lib/studio/video/ffmpeg";
import { generateStudioVideo } from "@/lib/studio/video/generate";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const { apiKey } = await resolveGeminiApiKey();
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "مفتاح Gemini غير مُعدّ." },
      { status: 400 }
    );
  }
  const models = await detectStudioModels(apiKey);
  const ffmpeg = await resolveFfmpeg();
  return NextResponse.json({ ok: true, models, ffmpeg });
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const result = await generateStudioVideo({
      prompt: typeof body.prompt === "string" ? body.prompt : "",
      durationMinutes: body.durationMinutes,
      locale: body.locale,
      loudnorm: body.loudnorm,
    });
    if (result.ok && result.video) {
      const origin = siteOrigin();
      const absolute = result.video.url.startsWith("http")
        ? result.video.url
        : `${origin}${result.video.url}`;
      await writeStudioLastOutput({
        caption: result.prompt,
        videoPaths: [result.video.absolutePath],
        videoUrls: [absolute],
        pendingPublish: true,
      });
      const notify = await studioNotifyTelegram({
        title: `فيديو استوديو · ${result.model}`,
        paths: [result.video.absolutePath],
        urls: [absolute],
      });
      await queueStudioPublishApproval(result.prompt);
      return NextResponse.json({ ...result, notify }, { status: 200 });
    }
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "تعذّر توليد الفيديو",
      },
      { status: 500 }
    );
  }
}
