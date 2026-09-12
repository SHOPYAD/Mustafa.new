import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { runGeminiBuilderChat } from "@/lib/server/gemini-builder";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = await req.json();
    const result = await runGeminiBuilderChat({
      ...body,
      pageId: typeof body.pageId === "string" && body.pageId.trim() ? body.pageId : "home",
    });
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: result.status }
      );
    }
    return NextResponse.json({
      ok: true,
      reply: result.reply,
      homepagePatch: result.homepagePatch,
      templatePatch: result.templatePatch,
      pageThemePatch: result.pageThemePatch,
      customPage: result.customPage,
      created: result.created,
      pageId: result.pageId,
      filesChanged: result.filesChanged,
      copilotSection: result.copilotSection,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
