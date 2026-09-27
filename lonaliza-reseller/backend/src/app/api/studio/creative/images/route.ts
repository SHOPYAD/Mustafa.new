import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { generateBrandedStudioImages } from "@/lib/studio/creative/slides";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const result = await generateBrandedStudioImages({
      prompt: typeof body.prompt === "string" ? body.prompt : undefined,
      title: typeof body.title === "string" ? body.title : undefined,
      destination:
        typeof body.destination === "string" ? body.destination : undefined,
      cta: typeof body.cta === "string" ? body.cta : undefined,
      locale: body.locale,
      format: body.format,
      count: body.count,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "تعذّر توليد الصور",
      },
      { status: 500 }
    );
  }
}
