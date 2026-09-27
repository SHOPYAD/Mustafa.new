import { NextRequest, NextResponse } from "next/server";
import {
  listAiPrograms,
  saveAiProgram,
  toPublicProgram,
} from "@/lib/server/ai-programs-store";
import type { AiProgramInput } from "@/types/ai-program";

export const runtime = "nodejs";

export async function GET() {
  const programs = await listAiPrograms({ includeHidden: false });
  return NextResponse.json({
    ok: true,
    programs: programs.map(toPublicProgram),
  });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as AiProgramInput;
  try {
    const saved = await saveAiProgram(body);
    return NextResponse.json({
      ok: true,
      program: toPublicProgram(saved.program),
      deduped: saved.deduped,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "save_failed" },
      { status: 400 }
    );
  }
}
