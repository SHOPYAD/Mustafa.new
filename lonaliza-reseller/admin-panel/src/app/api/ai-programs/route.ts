import { NextResponse } from "next/server";
import { listAiPrograms, toPublicProgram } from "@/lib/server/ai-programs-store";

export const runtime = "nodejs";

export async function GET() {
  const programs = await listAiPrograms({ includeHidden: false });
  return NextResponse.json({
    ok: true,
    programs: programs.map(toPublicProgram),
  });
}
