import { NextRequest, NextResponse } from "next/server";
import { tripToProgramInput } from "@/lib/planner/to-program";
import type { PlannerTrip } from "@/types/planner";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { trip?: PlannerTrip };
  if (!body.trip?.days?.length) {
    return NextResponse.json({ ok: false, error: "no_trip" }, { status: 400 });
  }
  const input = tripToProgramInput(body.trip);
  try {
    const adminUrl =
      process.env.ADMIN_INTERNAL_URL || "http://127.0.0.1:3048";
    const res = await fetch(`${adminUrl}/api/ai-programs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; program?: unknown };
    if (data.ok) return NextResponse.json({ ok: true, program: data.program });
  } catch {
    /* fall through to local store */
  }

  const { saveAiProgram } = await import("@/lib/server/ai-programs-store");
  const saved = await saveAiProgram(input);
  return NextResponse.json({ ok: true, program: saved.program, local: true });
}
