import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { editVideoToDuration } from "@/lib/studio/video/edit";

export const runtime = "nodejs";
export const maxDuration = 180;

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const result = await editVideoToDuration({
      inputPath: typeof body.inputPath === "string" ? body.inputPath : undefined,
      name: typeof body.name === "string" ? body.name : undefined,
      durationMinutes: body.durationMinutes,
      loudnorm: body.loudnorm,
    });
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "تعذّر تحرير المدة",
      },
      { status: 500 }
    );
  }
}
